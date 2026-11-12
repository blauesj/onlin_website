-- ============================================================
-- 霓虹连击 NEON COMBO · Cloudflare D1 建表脚本（全新数据库）
-- 用法（二选一）：
--   1) Cloudflare 控制台 → 存储和数据库 → D1 → 选中数据库 → 控制台 → 粘贴执行
--   2) npx wrangler d1 execute neon-combo --remote --file=./schema.sql
--
-- ⚠️ 如果数据库里已经有 scores 表（之前建过），不要用这个文件，
--    改用 migrations/001-add-region-device.sql 做增量升级。
-- 可重复执行，不会重复建表。
-- ============================================================

CREATE TABLE IF NOT EXISTS scores (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  score      INTEGER NOT NULL,
  best_combo INTEGER NOT NULL DEFAULT 0,
  hits       INTEGER NOT NULL DEFAULT 0,
  misses     INTEGER NOT NULL DEFAULT 0,
  -- 地域：服务端从 Cloudflare 请求里自动识别（ISO 3166-1 alpha-2，未知为 XX）
  country    TEXT    NOT NULL DEFAULT 'XX',
  -- 已废弃：设备类型不再写入、也不再展示。保留该列只为兼容早期版本建过的表。
  device     TEXT    NOT NULL DEFAULT 'desktop',
  -- 玩家标识：服务端取访客 IP 做 SHA-256 后取前 16 位，不存明文 IP，只用于识别同一玩家
  player_id  TEXT,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- 榜单查询：分数倒序，同分先到先排
CREATE INDEX IF NOT EXISTS idx_scores_rank ON scores (score DESC, created_at ASC);

-- 按名字查（兼容没有 player_id 的旧数据）
CREATE INDEX IF NOT EXISTS idx_scores_name ON scores (name, created_at DESC);

-- 按玩家取最好成绩（前 50 名每人只显示一局）
CREATE INDEX IF NOT EXISTS idx_scores_player ON scores (player_id, score DESC);

-- 区域榜：同一地域内排序
CREATE INDEX IF NOT EXISTS idx_scores_country ON scores (country, score DESC);
