-- SkillsSafe D1 Database Schema
-- Run: wrangler d1 execute skillssafe-db --file=migrations/0001_initial.sql

CREATE TABLE IF NOT EXISTS scan_reports (
  id          TEXT PRIMARY KEY,           -- scan_id e.g. ss_a3f8c901_1741680000
  decision    TEXT NOT NULL,              -- INSTALL | REVIEW | BLOCK
  score       INTEGER NOT NULL,           -- 0-100
  risk_level  TEXT NOT NULL,              -- SAFE | CAUTION | DANGER | CRITICAL
  threat_count INTEGER NOT NULL DEFAULT 0,
  zero_width_count INTEGER NOT NULL DEFAULT 0,
  threats_json TEXT NOT NULL DEFAULT '[]', -- JSON array of threats
  recommendation TEXT NOT NULL DEFAULT '',
  lang        TEXT NOT NULL DEFAULT 'en', -- en | zh | ja
  source_url  TEXT,                       -- URL if scanned from URL
  content_hash TEXT,                      -- SHA256 of scanned content (for dedup)
  content_length INTEGER NOT NULL DEFAULT 0,
  scanned_at  TEXT NOT NULL,              -- ISO 8601
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  ip_hash     TEXT                        -- hashed IP for abuse prevention
);

CREATE INDEX IF NOT EXISTS idx_scan_reports_scanned_at ON scan_reports(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_reports_decision ON scan_reports(decision);
CREATE INDEX IF NOT EXISTS idx_scan_reports_content_hash ON scan_reports(content_hash);

CREATE TABLE IF NOT EXISTS platform_stats (
  id          INTEGER PRIMARY KEY DEFAULT 1,
  total_scans INTEGER NOT NULL DEFAULT 0,
  total_threats_found INTEGER NOT NULL DEFAULT 0,
  total_blocks INTEGER NOT NULL DEFAULT 0,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Initialize stats row
INSERT OR IGNORE INTO platform_stats (id, total_scans, total_threats_found, total_blocks)
VALUES (1, 0, 0, 0);
