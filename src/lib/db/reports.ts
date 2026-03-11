/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * D1 database operations for scan reports.
 * Cloudflare Pages + next-on-pages: bindings via getRequestContext().
 * Development: in-memory fallback.
 */
import type { ScanResult } from "@/lib/scanner/engine";

export interface StoredReport {
  id: string;
  decision: string;
  score: number;
  risk_level: string;
  threat_count: number;
  zero_width_count: number;
  threats_json: string;
  recommendation: string;
  lang: string;
  source_url?: string;
  content_length: number;
  scanned_at: string;
  created_at: string;
}

const DEV_STORE = new Map<string, StoredReport>();

function getDB(db?: any): any {
  if (db) return db;
  // Fallback: try globalThis (works in some CF environments)
  const g = globalThis as any;
  return g.DB ?? null;
}

export async function saveReport(
  result: ScanResult,
  sourceUrl?: string,
  db?: any
): Promise<void> {
  const d1 = getDB(db);

  const record = {
    id: result.scan_id,
    decision: result.decision,
    score: result.score,
    risk_level: result.risk_level,
    threat_count: result.threat_count,
    zero_width_count: result.zero_width_count,
    threats_json: JSON.stringify(result.threats),
    recommendation: result.recommendation,
    lang: result.lang,
    source_url: sourceUrl ?? null,
    content_length: result.content_length,
    scanned_at: result.scanned_at,
  };

  if (d1) {
    try {
      await d1
        .prepare(
          `INSERT OR IGNORE INTO scan_reports
           (id, decision, score, risk_level, threat_count, zero_width_count,
            threats_json, recommendation, lang, source_url, content_length, scanned_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          record.id, record.decision, record.score, record.risk_level,
          record.threat_count, record.zero_width_count, record.threats_json,
          record.recommendation, record.lang, record.source_url,
          record.content_length, record.scanned_at
        )
        .run();

      await d1
        .prepare(
          `UPDATE platform_stats SET
            total_scans = total_scans + 1,
            total_threats_found = total_threats_found + ?,
            total_blocks = total_blocks + ?,
            updated_at = datetime('now')
          WHERE id = 1`
        )
        .bind(result.threat_count, result.decision === "BLOCK" ? 1 : 0)
        .run();
    } catch (e) {
      console.error("[D1] saveReport failed:", e);
    }
  } else {
    DEV_STORE.set(record.id, {
      ...record,
      source_url: record.source_url ?? undefined,
      created_at: new Date().toISOString(),
    });
  }
}

export async function getReport(
  scanId: string,
  db?: any
): Promise<StoredReport | null> {
  const d1 = getDB(db);
  if (d1) {
    try {
      const row = await d1
        .prepare("SELECT * FROM scan_reports WHERE id = ?")
        .bind(scanId)
        .first();
      return (row as StoredReport) ?? null;
    } catch (e) {
      console.error("[D1] getReport failed:", e);
      return null;
    }
  }
  return DEV_STORE.get(scanId) ?? null;
}

export async function getPlatformStats(db?: any): Promise<{
  total_scans: number;
  total_threats_found: number;
  total_blocks: number;
}> {
  const d1 = getDB(db);
  if (d1) {
    try {
      const row = await d1
        .prepare("SELECT * FROM platform_stats WHERE id = 1")
        .first();
      return (row as any) ?? { total_scans: 0, total_threats_found: 0, total_blocks: 0 };
    } catch (e) {
      console.error("[D1] getPlatformStats failed:", e);
      return { total_scans: 0, total_threats_found: 0, total_blocks: 0 };
    }
  }
  return {
    total_scans: DEV_STORE.size,
    total_threats_found: [...DEV_STORE.values()].reduce((a, r) => a + r.threat_count, 0),
    total_blocks: [...DEV_STORE.values()].filter((r) => r.decision === "BLOCK").length,
  };
}
