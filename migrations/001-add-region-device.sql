-- ============================================================
-- 增量升级：给已有的 scores 表补上 地域 / 设备 / 玩家标识
-- ------------------------------------------------------------
-- 适用于「之前已经跑过旧版 schema.sql」的数据库。
-- 全新数据库请直接执行根目录的 schema.sql，不要执行本文件
-- （否则会因为列已存在而报 duplicate column name）。
--
-- 用法：
--   控制台 → D1 → 选中数据库 → 控制台 → 粘贴执行
--   或：npx wrangler d1 execute neon-combo --remote --file=./migrations/001-add-region-device.sql
--
-- 旧数据会被填成 country='XX'、device='desktop'、player_id=NULL，
-- 榜单里仍会按名字合并显示，不影响使用。
-- ============================================================

ALTER TABLE scores ADD COLUMN country   TEXT NOT NULL DEFAULT 'XX';
ALTER TABLE scores ADD COLUMN device    TEXT NOT NULL DEFAULT 'desktop';
ALTER TABLE scores ADD COLUMN player_id TEXT;

CREATE INDEX IF NOT EXISTS idx_scores_player  ON scores (player_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_country ON scores (country, score DESC);
