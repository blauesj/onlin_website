/* ============================================================
   霓虹连击 NEON COMBO · 排行榜接口
   ------------------------------------------------------------
   GET  /api/scores?scope=global|region&name=<名字>
        读取排行榜（前 50 名，每人只取最好的一局）+ 我的排名
   POST /api/scores
        提交一局成绩

   玩家身份：服务端取访问者 IP，做 SHA-256 后取前 16 位十六进制作为
   player_id。同一网络下的同一名字会被认成同一个人，换设备也认得出；
   全程不存储明文 IP，只存这个不可逆的哈希片段。
   名字与 IP 一起构成本次榜单里的「一个人」，所以同一 WiFi 下不同名字
   的两个人不会互相覆盖成绩。

   地域由服务端从 Cloudflare 的 request.cf.country 自动识别，前端传了也不作数。

   D1 绑定名为 DB（见 wrangler.jsonc）。
   每周一 00:00（北京时间）由 Cron Trigger 调用 resetScores() 清空榜单，
   配置见 wrangler.jsonc 的 triggers.crons 与 README。
   ============================================================ */

const LIMIT_DEFAULT = 50;
const LIMIT_MAX = 50;
const MAX_NAME = 16;
const MAX_SCORE = 20000;
const MAX_COMBO = 400;
const MAX_HITS = 600;
const MAX_MISSES = 600;
const THROTTLE_SECONDS = 3;
const MAX_POINTS_PER_HIT = 250; /* 金环 50 × 倍率 5，超过这个均值必然是伪造 */
const IP_SALT = 'neon-combo:v1';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function cleanName(raw) {
  if (typeof raw !== 'string') return '';
  const s = raw.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  if (!/[0-9a-zA-Z\u00c0-\u024f\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/.test(s)) return '';
  return Array.from(s).slice(0, MAX_NAME).join('');
}

function toInt(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const i = Math.round(n);
  if (i < min || i > max) return null;
  return i;
}

/* ---------- 自动识别：地域 / 玩家（按 IP） ---------- */

/** Cloudflare 在每个入站请求上提供 cf.country；本地或非 CF 环境回退为 XX（未知）。 */
function detectCountry(request) {
  const cf = request.cf || {};
  const code = typeof cf.country === 'string' ? cf.country.trim().toUpperCase() : '';
  return /^[A-Z]{2}$/.test(code) ? code : 'XX';
}

/** 真实访客 IP：Cloudflare 会写入 cf-connecting-ip；本地开发时回退。 */
function clientIp(request) {
  const headers = request.headers;
  const direct = (headers.get('cf-connecting-ip') || '').trim();
  if (direct) return direct;

  const forwarded = (headers.get('x-forwarded-for') || '').split(',')[0].trim();
  if (forwarded) return forwarded;

  const cf = request.cf || {};
  if (typeof cf.clientIp === 'string' && cf.clientIp) return cf.clientIp;
  return '0.0.0.0';
}

/** IP → 稳定的匿名标识（SHA-256 前 16 位）。同一 IP 恒定，不可反推，不存明文。 */
async function playerIdFor(request) {
  const data = new TextEncoder().encode(IP_SALT + '|' + clientIp(request));
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  let hex = '';
  for (let i = 0; i < 8; i++) hex += bytes[i].toString(16).padStart(2, '0');
  return hex;
}

/** 展示用的短标签：取标识前 4 位，同一网络恒定，撞名时用来区分。 */
function tagFor(playerId) {
  return playerId ? playerId.slice(0, 4).toUpperCase() : '';
}

function toPublicRow(row) {
  return {
    name: row.name,
    score: row.score,
    bestCombo: row.bestCombo || 0,
    country: row.country || 'XX',
    tag: tagFor(row.playerId || ''),
    createdAt: row.createdAt
  };
}

/* ---------- SQL ---------- */

/* 每人（同一 IP + 同一名字）只保留最高分那一局，再按分数倒序取前 N；
   region 时只看同一地域 */
function boardSql(region) {
  return `SELECT name, score, best_combo AS bestCombo, country,
                 player_id AS playerId, created_at AS createdAt
            FROM (
              SELECT *,
                     ROW_NUMBER() OVER (
                       PARTITION BY COALESCE(player_id, ''), name
                       ORDER BY score DESC, created_at ASC
                     ) AS rn
                FROM scores
                ${region ? 'WHERE country = ?2' : ''}
            )
           WHERE rn = 1
           ORDER BY score DESC, created_at ASC
           LIMIT ?1`;
}

/* 名次 = 比自己最好成绩更高的人数 + 1（按人去重，不是按局数） */
function rankSql(region) {
  return `SELECT COUNT(*) + 1 AS rank
            FROM (
              SELECT COALESCE(player_id, '') AS pid, name, MAX(score) AS best
                FROM scores
                ${region ? 'WHERE country = ?2' : ''}
               GROUP BY pid, name
            )
           WHERE best > ?1`;
}

function bindBoard(stmt, limit, region, country) {
  return region ? stmt.bind(limit, country) : stmt.bind(limit);
}

function bindRank(stmt, score, region, country) {
  return region ? stmt.bind(score, country) : stmt.bind(score);
}

/* ---------- 路由处理 ---------- */

export async function handleGet(request, env) {
  if (!env || !env.DB) return json({ error: 'db_not_configured', scores: [] }, 503);

  const url = new URL(request.url);
  const limit = toInt(url.searchParams.get('limit'), 1, LIMIT_MAX) || LIMIT_DEFAULT;
  const scope = url.searchParams.get('scope') === 'region' ? 'region' : 'global';
  const region = scope === 'region';
  const country = detectCountry(request);
  const name = cleanName(url.searchParams.get('name') || '');
  const playerId = await playerIdFor(request);

  try {
    const { results } = await bindBoard(env.DB.prepare(boardSql(region)), limit, region, country).all();
    const body = {
      scope,
      country,
      region: region ? country : null,
      player: {
        name: name || null,
        tag: tagFor(playerId),
        best: 0,
        plays: 0,
        rank: 0,
        regionRank: 0
      },
      scores: (results || []).map(toPublicRow)
    };

    if (name) {
      const mine = await env.DB.prepare(
        "SELECT MAX(score) AS best, COUNT(*) AS plays FROM scores WHERE COALESCE(player_id, '') = ?1 AND name = ?2"
      ).bind(playerId, name).first();

      const best = (mine && mine.best) || 0;
      const globalRank = await bindRank(env.DB.prepare(rankSql(false)), best, false, country).first();
      const regionRank = await bindRank(env.DB.prepare(rankSql(true)), best, true, country).first();

      body.player.best = best;
      body.player.plays = (mine && mine.plays) || 0;
      body.player.rank = (globalRank && globalRank.rank) || 0;
      body.player.regionRank = (regionRank && regionRank.rank) || 0;
    }

    return json(body);
  } catch (err) {
    return json({ error: 'query_failed', scores: [] }, 500);
  }
}

export async function handlePost(request, env) {
  if (!env || !env.DB) return json({ error: 'db_not_configured' }, 503);

  let payload;
  try {
    payload = await request.json();
  } catch (err) {
    return json({ error: 'bad_json' }, 400);
  }

  const parsed = validate(payload);
  if (!parsed.ok) return json({ error: parsed.error }, 400);
  const { name, score, bestCombo, hits, misses } = parsed.value;

  const country = detectCountry(request);
  const playerId = await playerIdFor(request);

  try {
    /* 同一个人 3 秒内重复提交视为重复，避免刷新页面反复刷榜 */
    const recent = await env.DB.prepare(
      "SELECT COUNT(*) AS c FROM scores WHERE COALESCE(player_id, '') = ?1 AND name = ?2 AND created_at > datetime('now', ?3)"
    ).bind(playerId, name, `-${THROTTLE_SECONDS} seconds`).first();
    if (recent && recent.c > 0) return json({ error: 'too_fast' }, 429);

    await env.DB.prepare(
      `INSERT INTO scores (name, score, best_combo, hits, misses, country, player_id)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
    ).bind(name, score, bestCombo, hits, misses, country, playerId).run();

    /* 名次按这个人的最好成绩算（可能高于本局），与榜单展示口径一致 */
    const bestRow = await env.DB.prepare(
      "SELECT MAX(score) AS best FROM scores WHERE COALESCE(player_id, '') = ?1 AND name = ?2"
    ).bind(playerId, name).first();
    const best = Math.max((bestRow && bestRow.best) || 0, score);

    const globalRank = await bindRank(env.DB.prepare(rankSql(false)), best, false, country).first();
    const regionRank = await bindRank(env.DB.prepare(rankSql(true)), best, true, country).first();

    const { results } = await bindBoard(env.DB.prepare(boardSql(false)), LIMIT_DEFAULT, false, country).all();

    return json({
      ok: true,
      rank: (globalRank && globalRank.rank) || 1,
      regionRank: (regionRank && regionRank.rank) || 0,
      best,
      country,
      tag: tagFor(playerId),
      scope: 'global',
      scores: (results || []).map(toPublicRow)
    }, 201);
  } catch (err) {
    return json({ error: 'insert_failed' }, 500);
  }
}

/* ---------- 定时清空（每周一次，见 wrangler.jsonc 的 triggers.crons） ---------- */

export async function resetScores(env) {
  if (!env || !env.DB) return { ok: false, error: 'db_not_configured' };

  try {
    const res = await env.DB.prepare('DELETE FROM scores').run();
    const deleted = (res && res.meta && res.meta.changes) || 0;
    /* 顺手把自增序号归零，新赛季从 #1 开始；失败不影响清空结果 */
    try { await env.DB.prepare("DELETE FROM sqlite_sequence WHERE name = 'scores'").run(); } catch (e) { /* ignore */ }
    return { ok: true, deleted };
  } catch (err) {
    return { ok: false, error: 'reset_failed' };
  }
}

function validate(payload) {
  if (!payload || typeof payload !== 'object') return { ok: false, error: 'bad_payload' };

  const name = cleanName(payload.name);
  if (!name) return { ok: false, error: 'bad_name' };

  const score = toInt(payload.score, 0, MAX_SCORE);
  if (score === null) return { ok: false, error: 'bad_score' };

  const bestCombo = toInt(payload.bestCombo, 0, MAX_COMBO);
  if (bestCombo === null) return { ok: false, error: 'bad_combo' };

  const hits = toInt(payload.hits, 0, MAX_HITS);
  const misses = toInt(payload.misses, 0, MAX_MISSES);
  if (hits === null || misses === null) return { ok: false, error: 'bad_counts' };

  if (hits === 0 && score > 0) return { ok: false, error: 'bad_score' };
  if (hits > 0 && score / hits > MAX_POINTS_PER_HIT) return { ok: false, error: 'bad_score' };
  if (bestCombo > hits) return { ok: false, error: 'bad_combo' };

  return { ok: true, value: { name, score, bestCombo, hits, misses } };
}
