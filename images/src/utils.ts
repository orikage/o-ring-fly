/**
 * utils.ts — 共有ユーティリティ
 * エスケープ関数をここに集約し、各コンポーネントで重複定義しない。
 */

/** HTML特殊文字をエスケープ (XSS対策) */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** JavaScriptの文字列リテラル内に埋め込む際のエスケープ */
export function escapeJs(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

/** ファイル名から危険な文字を除去する */
export function sanitizeFilename(name: string): string {
  // ディレクトリ区切り文字・予約文字を除去
  const base = name.split(/[/\\]/).pop() || name;
  return base.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").slice(0, 255);
}

/** 許可された画像拡張子のセット */
export const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);

/** アップロード最大サイズ (50MB) */
export const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;
