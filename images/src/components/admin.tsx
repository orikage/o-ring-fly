/**
 * admin.tsx — AdminUI
 * 管理パネル（Basic Auth保護）
 *
 * 機能:
 * - ギャラリー一覧表示・管理
 * - 新規ギャラリー作成フォーム
 * - タイトル・説明・本文のWebエディタ
 * - 画像アップロード（ドラッグ&ドロップ対応）
 *
 * 将来: Cloudflare R2 切り替え時は storage.ts の差し替えのみで対応可能
 */

import type { GalleryMeta } from "../content";
import { escapeHtml, escapeJs } from "../utils";

function AdminLayout(children: string, title = "Admin Console"): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | Tactical Image Archive</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#fff;font-family:'Inter',-apple-system,sans-serif;min-height:100vh;">
  <!-- Admin header -->
  <div style="background:#111;border-bottom:1px solid #1a1a1a;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;">
    <div style="display:flex;align-items:center;gap:16px;">
      <div style="width:8px;height:8px;background:var(--ak-yellow);"></div>
      <span style="font-family:monospace;font-size:11px;letter-spacing:3px;color:var(--ak-yellow);">ADMIN CONSOLE</span>
    </div>
    <div style="display:flex;gap:12px;align-items:center;">
      <a href="/" style="font-family:monospace;font-size:10px;color:#555;text-decoration:none;letter-spacing:1px;"
         onmouseover="this.style.color='#888'" onmouseout="this.style.color='#555'">→ GALLERY</a>
      <a href="/admin/logout" style="font-family:monospace;font-size:10px;color:#333;text-decoration:none;letter-spacing:1px;border:1px solid #222;padding:4px 12px;"
         onmouseover="this.style.color='#555'" onmouseout="this.style.color='#333'">LOGOUT</a>
    </div>
  </div>

  <div style="max-width:900px;margin:0 auto;padding:32px 24px;">
    ${children}
  </div>
</body>
</html>`;
}

export function AdminIndexPage(galleries: GalleryMeta[]): string {
  const items = galleries.map((g) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #161616;transition:background 0.2s;"
         onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
      <div>
        <div style="font-size:14px;font-weight:600;color:#ccc;">${escapeHtml(g.title)}</div>
        <div style="font-family:monospace;font-size:10px;color:#444;margin-top:3px;">
          ${escapeHtml(g.slug)} &nbsp;|&nbsp; ${escapeHtml(g.date || "no date")} &nbsp;|&nbsp; ${escapeHtml(g.type)}
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <a href="/admin/gallery/${encodeURIComponent(g.slug)}/edit"
           style="font-family:monospace;font-size:10px;color:var(--ak-cyan);text-decoration:none;border:1px solid rgba(0,229,255,0.2);padding:4px 12px;transition:all 0.2s;"
           onmouseover="this.style.borderColor='var(--ak-cyan)'" onmouseout="this.style.borderColor='rgba(0,229,255,0.2)'">EDIT</a>
        <a href="/admin/gallery/${encodeURIComponent(g.slug)}/upload"
           style="font-family:monospace;font-size:10px;color:var(--ak-yellow);text-decoration:none;border:1px solid rgba(255,215,0,0.2);padding:4px 12px;transition:all 0.2s;"
           onmouseover="this.style.borderColor='var(--ak-yellow)'" onmouseout="this.style.borderColor='rgba(255,215,0,0.2)'">UPLOAD</a>
      </div>
    </div>`).join("");

  return AdminLayout(`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;">
      <div>
        <div style="font-family:monospace;font-size:10px;color:var(--ak-yellow);letter-spacing:3px;margin-bottom:6px;">// GALLERY_MANAGEMENT</div>
        <h1 style="margin:0;font-size:1.4rem;font-weight:900;color:#fff;">Gallery Index</h1>
      </div>
      <a href="/admin/gallery/new" class="admin-btn" style="text-decoration:none;">+ NEW GALLERY</a>
    </div>

    <!-- Gallery list -->
    <div style="border:1px solid #1a1a1a;margin-bottom:40px;">
      <div style="padding:10px 16px;border-bottom:1px solid #1a1a1a;background:#111;">
        <span style="font-family:monospace;font-size:10px;color:#444;letter-spacing:2px;">GALLERIES (${galleries.length})</span>
      </div>
      ${items || `<div style="padding:32px;text-align:center;font-family:monospace;font-size:12px;color:#333;">No galleries yet.</div>`}
    </div>
  `);
}

export function AdminNewGalleryPage(error?: string): string {
  return AdminLayout(`
    <div style="margin-bottom:24px;">
      <a href="/admin" style="font-family:monospace;font-size:10px;color:#444;text-decoration:none;"
         onmouseover="this.style.color='#888'" onmouseout="this.style.color='#444'">← BACK</a>
    </div>
    <div style="font-family:monospace;font-size:10px;color:var(--ak-yellow);letter-spacing:3px;margin-bottom:20px;">// CREATE_GALLERY</div>

    ${error ? `<div style="background:rgba(255,0,0,0.1);border:1px solid rgba(255,0,0,0.3);color:#ff6666;padding:10px 14px;font-family:monospace;font-size:12px;margin-bottom:16px;">${escapeHtml(error)}</div>` : ""}

    <form method="POST" action="/admin/gallery/new" style="display:flex;flex-direction:column;gap:16px;">
      <div>
        <label style="font-family:monospace;font-size:10px;color:#555;letter-spacing:1px;display:block;margin-bottom:6px;">SLUG (フォルダ名) *</label>
        <input type="text" name="slug" class="admin-input" placeholder="2026-03-osaka" required pattern="[a-zA-Z0-9_-]+" title="英数字・ハイフン・アンダースコアのみ">
        <div style="font-family:monospace;font-size:9px;color:#333;margin-top:4px;">例: 2026-03-osaka (英数字・ハイフンのみ)</div>
      </div>
      <div>
        <label style="font-family:monospace;font-size:10px;color:#555;letter-spacing:1px;display:block;margin-bottom:6px;">TITLE *</label>
        <input type="text" name="title" class="admin-input" placeholder="大阪の夜" required>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label style="font-family:monospace;font-size:10px;color:#555;letter-spacing:1px;display:block;margin-bottom:6px;">DATE</label>
          <input type="date" name="date" class="admin-input" value="${new Date().toISOString().slice(0, 10)}">
        </div>
        <div>
          <label style="font-family:monospace;font-size:10px;color:#555;letter-spacing:1px;display:block;margin-bottom:6px;">TYPE</label>
          <select name="type" class="admin-input">
            <option value="photo">PHOTO</option>
            <option value="illustration">ILLUSTRATION</option>
            <option value="mixed">MIXED</option>
          </select>
        </div>
      </div>
      <div>
        <label style="font-family:monospace;font-size:10px;color:#555;letter-spacing:1px;display:block;margin-bottom:6px;">LOCATION</label>
        <input type="text" name="location" class="admin-input" placeholder="大阪">
      </div>
      <div>
        <label style="font-family:monospace;font-size:10px;color:#555;letter-spacing:1px;display:block;margin-bottom:6px;">TAGS (カンマ区切り)</label>
        <input type="text" name="tags" class="admin-input" placeholder="city,night,street">
      </div>
      <div>
        <label style="font-family:monospace;font-size:10px;color:#555;letter-spacing:1px;display:block;margin-bottom:6px;">DESCRIPTION</label>
        <input type="text" name="description" class="admin-input" placeholder="道頓堀スナップ">
      </div>
      <div style="display:flex;gap:12px;margin-top:8px;">
        <button type="submit" class="admin-btn">CREATE</button>
        <a href="/admin" class="admin-btn-secondary" style="text-decoration:none;">CANCEL</a>
      </div>
    </form>
  `);
}

export function AdminEditPage(gallery: GalleryMeta & { body?: string }, error?: string): string {
  const rawBody = (gallery as any).rawBody || "";
  return AdminLayout(`
    <div style="margin-bottom:24px;">
      <a href="/admin" style="font-family:monospace;font-size:10px;color:#444;text-decoration:none;"
         onmouseover="this.style.color='#888'" onmouseout="this.style.color='#444'">← BACK</a>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
      <div style="font-family:monospace;font-size:10px;color:var(--ak-yellow);letter-spacing:3px;">// EDIT: ${escapeHtml(gallery.slug)}</div>
      <div style="display:flex;gap:8px;">
        <a href="/gallery/${encodeURIComponent(gallery.slug)}" style="font-family:monospace;font-size:10px;color:#555;text-decoration:none;border:1px solid #222;padding:4px 12px;"
           target="_blank">VIEW ↗</a>
        <a href="/admin/gallery/${encodeURIComponent(gallery.slug)}/upload"
           style="font-family:monospace;font-size:10px;color:var(--ak-yellow);text-decoration:none;border:1px solid rgba(255,215,0,0.2);padding:4px 12px;">+ IMAGES</a>
      </div>
    </div>

    ${error ? `<div style="background:rgba(255,0,0,0.1);border:1px solid rgba(255,0,0,0.3);color:#ff6666;padding:10px 14px;font-family:monospace;font-size:12px;margin-bottom:16px;">${escapeHtml(error)}</div>` : ""}

    <form method="POST" action="/admin/gallery/${encodeURIComponent(gallery.slug)}/edit" style="display:flex;flex-direction:column;gap:16px;">
      <div>
        <label style="font-family:monospace;font-size:10px;color:#555;letter-spacing:1px;display:block;margin-bottom:6px;">TITLE *</label>
        <input type="text" name="title" class="admin-input" value="${escapeHtml(gallery.title)}" required>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label style="font-family:monospace;font-size:10px;color:#555;letter-spacing:1px;display:block;margin-bottom:6px;">DATE</label>
          <input type="date" name="date" class="admin-input" value="${escapeHtml(gallery.date)}">
        </div>
        <div>
          <label style="font-family:monospace;font-size:10px;color:#555;letter-spacing:1px;display:block;margin-bottom:6px;">TYPE</label>
          <select name="type" class="admin-input">
            <option value="photo" ${gallery.type === "photo" ? "selected" : ""}>PHOTO</option>
            <option value="illustration" ${gallery.type === "illustration" ? "selected" : ""}>ILLUSTRATION</option>
            <option value="mixed" ${gallery.type === "mixed" ? "selected" : ""}>MIXED</option>
          </select>
        </div>
      </div>
      <div>
        <label style="font-family:monospace;font-size:10px;color:#555;letter-spacing:1px;display:block;margin-bottom:6px;">LOCATION</label>
        <input type="text" name="location" class="admin-input" value="${escapeHtml(gallery.location || "")}">
      </div>
      <div>
        <label style="font-family:monospace;font-size:10px;color:#555;letter-spacing:1px;display:block;margin-bottom:6px;">TAGS (カンマ区切り)</label>
        <input type="text" name="tags" class="admin-input" value="${escapeHtml(gallery.tags.join(","))}">
      </div>
      <div>
        <label style="font-family:monospace;font-size:10px;color:#555;letter-spacing:1px;display:block;margin-bottom:6px;">DESCRIPTION</label>
        <input type="text" name="description" class="admin-input" value="${escapeHtml(gallery.description || "")}">
      </div>
      <div>
        <label style="font-family:monospace;font-size:10px;color:#555;letter-spacing:1px;display:block;margin-bottom:6px;">COVER IMAGE (ファイル名)</label>
        <input type="text" name="cover" class="admin-input" value="${escapeHtml(gallery.cover || "")}" placeholder="DSC0001.jpg">
      </div>
      <div>
        <label style="font-family:monospace;font-size:10px;color:#555;letter-spacing:1px;display:block;margin-bottom:6px;">BODY (Markdown)</label>
        <textarea name="body" class="admin-textarea">${escapeHtml(rawBody)}</textarea>
      </div>
      <div style="display:flex;gap:12px;margin-top:8px;">
        <button type="submit" class="admin-btn">SAVE</button>
        <a href="/admin" class="admin-btn-secondary" style="text-decoration:none;">CANCEL</a>
      </div>
    </form>
  `);
}

export function AdminUploadPage(gallery: GalleryMeta, images: string[], message?: string, error?: string): string {
  const imageList = images.map((filename) => {
    const src = `/galleries/${encodeURIComponent(gallery.slug)}/images/${encodeURIComponent(filename)}`;
    return `
    <div style="position:relative;break-inside:avoid;margin-bottom:4px;">
      <img src="${escapeHtml(src)}" alt="${escapeHtml(filename)}" style="width:100%;display:block;" loading="lazy">
      <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.7);padding:4px 8px;display:flex;align-items:center;justify-content:space-between;">
        <span style="font-family:monospace;font-size:9px;color:#888;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:calc(100% - 60px);">${escapeHtml(filename)}</span>
        <form method="POST" action="/admin/gallery/${encodeURIComponent(gallery.slug)}/delete-image" style="margin:0;">
          <input type="hidden" name="filename" value="${escapeHtml(filename)}">
          <button type="submit" onclick="return confirm('${escapeJs(filename)} を削除しますか？')"
                  style="background:transparent;border:none;color:#555;font-size:10px;cursor:pointer;padding:0 2px;font-family:monospace;"
                  onmouseover="this.style.color='#ff4444'" onmouseout="this.style.color='#555'">✕</button>
        </form>
      </div>
    </div>`;
  }).join("");

  return AdminLayout(`
    <div style="margin-bottom:24px;">
      <a href="/admin" style="font-family:monospace;font-size:10px;color:#444;text-decoration:none;"
         onmouseover="this.style.color='#888'" onmouseout="this.style.color='#444'">← BACK</a>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
      <div>
        <div style="font-family:monospace;font-size:10px;color:var(--ak-yellow);letter-spacing:3px;margin-bottom:4px;">// IMAGE_UPLOAD</div>
        <h1 style="margin:0;font-size:1.2rem;font-weight:700;color:#fff;">${escapeHtml(gallery.title)}</h1>
      </div>
      <a href="/admin/gallery/${encodeURIComponent(gallery.slug)}/edit"
         style="font-family:monospace;font-size:10px;color:#555;text-decoration:none;border:1px solid #222;padding:4px 12px;">EDIT META</a>
    </div>

    ${message ? `<div style="background:rgba(0,255,0,0.05);border:1px solid rgba(0,255,0,0.2);color:#4ade80;padding:10px 14px;font-family:monospace;font-size:12px;margin-bottom:16px;">${escapeHtml(message)}</div>` : ""}
    ${error ? `<div style="background:rgba(255,0,0,0.1);border:1px solid rgba(255,0,0,0.3);color:#ff6666;padding:10px 14px;font-family:monospace;font-size:12px;margin-bottom:16px;">${escapeHtml(error)}</div>` : ""}

    <!-- Upload zone -->
    <div style="margin-bottom:28px;">
      <div style="font-family:monospace;font-size:10px;color:#555;letter-spacing:2px;margin-bottom:10px;">UPLOAD IMAGES</div>
      <form id="upload-form" enctype="multipart/form-data" method="POST" action="/admin/gallery/${encodeURIComponent(gallery.slug)}/upload">
        <div class="drop-zone" id="drop-zone" onclick="document.getElementById('file-input').click()">
          <div style="font-family:monospace;font-size:12px;color:#444;margin-bottom:8px;">DROP FILES HERE</div>
          <div style="font-family:monospace;font-size:10px;color:#333;">対応形式: JPG, PNG, WEBP, GIF, AVIF</div>
          <input type="file" id="file-input" name="images" multiple accept="image/*" style="display:none;" onchange="handleFileSelect(this)">
        </div>
        <div id="file-list" style="margin-top:12px;font-family:monospace;font-size:11px;color:#666;"></div>
        <div style="margin-top:12px;display:flex;gap:8px;">
          <button type="submit" class="admin-btn" id="upload-btn" style="display:none;">UPLOAD</button>
        </div>
      </form>
    </div>

    <!-- Existing images -->
    ${images.length > 0 ? `
    <div>
      <div style="font-family:monospace;font-size:10px;color:#555;letter-spacing:2px;margin-bottom:10px;">CURRENT IMAGES (${images.length})</div>
      <div style="columns:2 150px;column-gap:4px;">
        ${imageList}
      </div>
    </div>` : `
    <div style="padding:40px;text-align:center;border:1px solid #1a1a1a;">
      <div style="font-family:monospace;font-size:11px;color:#333;">No images yet.</div>
    </div>
    `}

    <script>
      // Drag & drop
      const zone = document.getElementById('drop-zone');
      zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const dt = e.dataTransfer;
        if (dt && dt.files.length > 0) {
          document.getElementById('file-input').files = dt.files;
          handleFileSelect(document.getElementById('file-input'));
        }
      });

      function handleFileSelect(input) {
        const files = Array.from(input.files);
        const listEl = document.getElementById('file-list');
        const btnEl = document.getElementById('upload-btn');
        if (files.length > 0) {
          listEl.innerHTML = files.map(f => '<div>■ ' + f.name + ' (' + (f.size/1024).toFixed(1) + ' KB)</div>').join('');
          btnEl.style.display = 'inline-block';
        } else {
          listEl.innerHTML = '';
          btnEl.style.display = 'none';
        }
      }
    </script>
  `);
}
