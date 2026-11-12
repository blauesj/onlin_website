/* ============================================================
   霓虹连击 NEON COMBO · 排行榜接口
   ------------------------------------------------------------
   GET  /api/scores?scope=global|region&player=<id>
        读取排行榜（前 50 名，每人只取最好的一局）
   POST /api/scores
        提交一局成绩

   地域与设备由服务端从请求中自动识别，不接受前端传入：
   - 地域：Cloudflare 的 request.cf.country（ISO 3166-1 alpha-2，未知为 XX）
   - 设备：User-Agent 归类为 mobile / tablet / desktop
   这样同一名字的玩家可以靠地域、设备和玩家标识区分，也无法伪造地区。

   D1 绑定名为 DB（见 wrangler.jsonc）。
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
const DEVICES = ['mobile', 'tablet', 'desktop'];

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

/* ---------- 自动识别：地域 / 设备 / 玩家标识 ---------- */

/** Cloudflare 在每个入站请求上提供 cf.country；本地或非 CF 环境回退为 XX（未知）。 */
function detectCountry(request) {
  const cf = request.cf || {};
  const code = typeof cf.country === 'string' ? cf.country.trim().toUpperCase() : '';
  return /^[A-Z]{2}$/.test(code) ? code : 'XX';
}

/** 按 UA 归类设备类型。不含精确机型，只用于区分同名玩家。 */
function detectDevice(request) {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  if (!ua) return 'desktop';
  if (/ipad|tablet|playbook|silk|kindle|android(?!.*mobile)/.test(ua)) return 'tablet';
  if (/mobi|iphone|ipod|android|blackberry|iemobile|windows phone/.test(ua)) return 'mobile';
  return 'desktop';
}

/** 客户端本地生成的随机标识（16 位十六进制）。只用来区分同名玩家，不含任何个人信息。 */
function cleanPlayerId(raw) {
  if (typeof raw !== 'string') return '';
  const s = raw.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
  if (s.length < 8 || s.length > 40) return '';
  return s;
}

/** 展示用的短标签：取标识前 4 位，同一台设备恒定，撞名时用来区分。 */
function tagFor(playerId) {
  return playerId ? playerId.slice(0, 4).toUpperCase() : '';
}

function toPublicRow(row) {
  return {
    name: row.name,
    score: row.score,
    bestCombo: row.bestCombo || 0,
    country: row.country || 'XX',
    device: DEVICES.indexOf(row.device) >= 0 ? row.device : 'desktop',
    tag: tagFor(row.playerId || ''),
    createdAt: row.createdAt
  };
}

/* ---------- SQL ---------- */

/* 每人只保留最高分那一局，再按分数倒序取前 N；region 时只看同一地域 */
function boardSql(region) {
  return `SELECT name, score, best_combo AS bestCombo, country, device,
                 player_id AS playerId, created_at AS createdAt
            FROM (
              SELECT *,
                     ROW_NUMBER() OVER (
                       PARTITION BY COALESCE(player_id, name)
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
              SELECT COALESCE(player_id, name) AS pid, MAX(score) AS best
                FROM scores
                ${region ? 'WHERE country = ?2' : ''}
               GROUP BY pid
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
  const playerId = cleanPlayerId(url.searchParams.get('player') || '');
  const name = cleanName(url.searchParams.get('name') || '');

  try {
    const { results } = await bindBoard(env.DB.prepare(boardSql(region)), limit, region, country).all();
    const body = {
      scope,
      country,
      region: region ? country : null,
      scores: (results || []).map(toPublicRow)
    };

    if (playerId || name) {
      const mine = playerId
        ? await env.DB.prepare('SELECT MAX(score) AS best, COUNT(*) AS plays FROM scores WHERE player_id = ?1')
            .bind(playerId).first()
        : await env.DB.prepare('SELECT MAX(score) AS best, COUNT(*) AS plays FROM scores WHERE name = ?1')
            .bind(name).first();

      const best = (mine && mine.best) || 0;
      const globalRank = await bindRank(env.DB.prepare(rankSql(false)), best, false, country).first();
      const regionRank = await bindRank(env.DB.prepare(rankSql(true)), best, true, country).first();

      body.player = {
        name: name || null,
        tag: tagFor(playerId),
        best,
        plays: (mine && mine.plays) || 0,
        rank: (globalRank && globalRank.rank) || 0,
        regionRank: (regionRank && regionRank.rank) || 0
      };
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
  const { name, score, bestCombo, hits, misses, playerId } = parsed.value;

  const country = detectCountry(request);
  const device = detectDevice(request);
  const throttleKey = playerId || name;

  try {
    /* 同一个玩家 3 秒内重复提交视为重复，避免刷新页面反复刷榜 */
    const recent = await env.DB.prepare(
      "SELECT COUNT(*) AS c FROM scores WHERE COALESCE(player_id, name) = ?1 AND created_at > datetime('now', ?2)"
    ).bind(throttleKey, `-${THROTTLE_SECONDS} seconds`).first();
    if (recent && recent.c > 0) return json({ error: 'too_fast' }, 429);

    await env.DB.prepare(
      `INSERT INTO scores (name, score, best_combo, hits, misses, country, device, player_id)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`
    ).bind(name, score, bestCombo, hits, misses, country, device, playerId || null).run();

    /* 名次按这个玩家的最好成绩算（可能高于本局），与榜单展示口径一致 */
    const bestRow = await env.DB.prepare(
      'SELECT MAX(score) AS best FROM scores WHERE COALESCE(player_id, name) = ?1'
    ).bind(throttleKey).first();
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
      device,
      tag: tagFor(playerId),
      scope: 'global',
      scores: (results || []).map(toPublicRow)
    }, 201);
  } catch (err) {
    return json({ error: 'insert_failed' }, 500);
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

  return {
    ok: true,
    value: { name, score, bestCombo, hits, misses, playerId: cleanPlayerId(payload.playerId) }
  };
}
