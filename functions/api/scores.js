/* ============================================================
   霓虹连击 NEON COMBO · 排行榜 API（Cloudflare Pages Functions）
   ------------------------------------------------------------
   GET  /api/scores?limit=10          读取排行榜（可选 &name= 查个人最佳）
   POST /api/scores                   提交一局成绩
   需要在 Pages 项目里绑定 D1 数据库，变量名必须是 DB。
   ============================================================ */

const LIMIT_DEFAULT = 10;
const LIMIT_MAX = 50;
const MAX_NAME = 16;
const MAX_SCORE = 20000;
const MAX_COMBO = 400;
const MAX_HITS = 600;
const MAX_MISSES = 600;
const THROTTLE_SECONDS = 3;
const MAX_POINTS_PER_HIT = 250; /* 金环 50 × 倍率 5，超过这个均值必然是伪造 */

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

const RANK_SQL = `SELECT name, score, best_combo AS bestCombo, created_at AS createdAt
                    FROM scores
                   ORDER BY score DESC, created_at ASC
                   LIMIT ?1`;

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env || !env.DB) return json({ error: 'db_not_configured', scores: [] }, 503);

  const url = new URL(request.url);
  const limit = toInt(url.searchParams.get('limit'), 1, LIMIT_MAX) || LIMIT_DEFAULT;
  const name = cleanName(url.searchParams.get('name') || '');

  try {
    const { results } = await env.DB.prepare(RANK_SQL).bind(limit).all();
    const body = { scores: results || [] };

    if (name) {
      const row = await env.DB.prepare(
        'SELECT MAX(score) AS best, COUNT(*) AS plays FROM scores WHERE name = ?1'
      ).bind(name).first();
      body.player = {
        name,
        best: (row && row.best) || 0,
        plays: (row && row.plays) || 0
      };
    }

    return json(body);
  } catch (err) {
    return json({ error: 'query_failed', scores: [] }, 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
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

  try {
    /* 同一个名字 3 秒内重复提交视为重复，避免刷新页面反复刷榜 */
    const recent = await env.DB.prepare(
      "SELECT COUNT(*) AS c FROM scores WHERE name = ?1 AND created_at > datetime('now', ?2)"
    ).bind(name, `-${THROTTLE_SECONDS} seconds`).first();
    if (recent && recent.c > 0) return json({ error: 'too_fast' }, 429);

    await env.DB.prepare(
      'INSERT INTO scores (name, score, best_combo, hits, misses) VALUES (?1, ?2, ?3, ?4, ?5)'
    ).bind(name, score, bestCombo, hits, misses).run();

    const rankRow = await env.DB.prepare(
      'SELECT COUNT(*) + 1 AS rank FROM scores WHERE score > ?1'
    ).bind(score).first();

    const { results } = await env.DB.prepare(RANK_SQL).bind(LIMIT_DEFAULT).all();

    return json({
      ok: true,
      rank: (rankRow && rankRow.rank) || 1,
      scores: results || []
    }, 201);
  } catch (err) {
    return json({ error: 'insert_failed' }, 500);
  }
}
