-- ============================================================
-- 霓虹连击 NEON COMBO · Cloudflare D1 建表脚本
-- 用法（二选一）：
--   1) Cloudflare 控制台 → 存储和数据库 → D1 → 选中数据库 → 控制台 → 粘贴执行
--   2) npx wrangler d1 execute <数据库名> --remote --file=./schema.sql
-- 可重复执行，不会重复建表。
-- ============================================================

CREATE TABLE IF NOT EXISTS scores (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  score      INTEGER NOT NULL,
  best_combo INTEGER NOT NULL DEFAULT 0,
  hits       INTEGER NOT NULL DEFAULT 0,
  misses     INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- 排行榜查询：分数倒序，同分先到先排
CREATE INDEX IF NOT EXISTS idx_scores_rank ON scores (score DESC, created_at ASC);

-- 按名字查个人最佳 + 同名节流
CREATE INDEX IF NOT EXISTS idx_scores_name ON scores (name, created_at DESC);
