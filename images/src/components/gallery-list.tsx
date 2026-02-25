/**
 * gallery-list.tsx — GalleryListPage
 * トップページのGALLERYモードとLOGモードを提供する。
 *
 * GALLERYモード: 全ギャラリーのカバー写真をMasonryグリッドで表示
 * LOGモード: 時系列のブログ形式（カバー写真 + タイトル + 説明文）
 */

import type { GalleryMeta } from "../content";
import { escapeHtml } from "../utils";

function GalleryModeView(galleries: GalleryMeta[]): string {
  if (galleries.length === 0) {
    return `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:16px;">
        <div style="font-family:monospace;font-size:12px;color:#333;letter-spacing:2px;">// GALLERY_INDEX: EMPTY</div>
        <p style="color:#444;font-size:14px;">まだギャラリーはありません。<a href="/admin" style="color:var(--ak-yellow);text-decoration:none;">管理画面</a>から追加してください。</p>
      </div>`;
  }

  // Collect all unique tags for filter
  const tagSet = new Set<string>();
  galleries.forEach((g) => g.tags.forEach((t) => tagSet.add(t)));
  const tags = Array.from(tagSet).sort();

  const tagFilter = tags.length > 0
    ? `<div style="padding:12px 20px;display:flex;gap:8px;flex-wrap:wrap;border-bottom:1px solid #111;">
        <span style="font-family:monospace;font-size:10px;color:#444;letter-spacing:1px;padding:2px 0;margin-right:4px;">FILTER:</span>
        ${tags.map((t) => `<button class="tag-chip" data-tag="${escapeHtml(t)}" onclick="">${escapeHtml(t)}</button>`).join("")}
        <button class="tag-chip" onclick="filterByTag('');document.querySelectorAll('.tag-chip[data-tag]').forEach(c=>c.classList.remove('active'));" style="color:#444;border-color:#222;">ALL</button>
      </div>`
    : "";

  const items = galleries.map((g) => {
    const coverSrc = g.cover
      ? `/galleries/${encodeURIComponent(g.slug)}/images/${encodeURIComponent(g.cover)}`
      : "";
    const tagsAttr = g.tags.join(",");
    const displayDate = g.date ? g.date.replace(/-/g, ".") : "DATE: UNKNOWN";

    return `
    <div class="masonry-item" data-tags="${escapeHtml(tagsAttr)}"
         onclick="window.location='/gallery/${encodeURIComponent(g.slug)}'">
      ${coverSrc
        ? `<img src="${escapeHtml(coverSrc)}" alt="${escapeHtml(g.title)}" loading="lazy">`
        : `<div style="width:100%;aspect-ratio:4/3;background:#1a1a1a;display:flex;align-items:center;justify-content:center;">
             <span style="font-family:monospace;font-size:10px;color:#333;">NO_IMAGE</span>
           </div>`
      }
      <div class="overlay">
        <div>
          <div style="font-family:monospace;font-size:9px;color:var(--ak-yellow);letter-spacing:1px;margin-bottom:3px;">${escapeHtml(displayDate)}</div>
          <div style="font-size:12px;font-weight:700;color:#fff;line-height:1.3;">${escapeHtml(g.title)}</div>
          ${g.location ? `<div style="font-family:monospace;font-size:9px;color:#888;margin-top:2px;">${escapeHtml(g.location)}</div>` : ""}
        </div>
      </div>
    </div>`;
  }).join("");

  return `
    ${tagFilter}
    <div style="padding:8px;">
      <div class="masonry-grid">
        ${items}
      </div>
    </div>`;
}

function LogModeView(galleries: GalleryMeta[]): string {
  if (galleries.length === 0) {
    return `
      <div style="padding:60px 20px;text-align:center;">
        <div style="font-family:monospace;font-size:12px;color:#333;letter-spacing:2px;">// CREATIVE_LOG: EMPTY</div>
      </div>`;
  }

  const entries = galleries.map((g) => {
    const coverSrc = g.cover
      ? `/galleries/${encodeURIComponent(g.slug)}/images/${encodeURIComponent(g.cover)}`
      : "";
    const displayDate = g.date ? g.date.replace(/-/g, ".") : "DATE: UNKNOWN";

    return `
    <a href="/gallery/${encodeURIComponent(g.slug)}" class="log-entry" style="text-decoration:none;color:inherit;"
       onmouseover="this.style.background='rgba(255,215,0,0.03)'" onmouseout="this.style.background='transparent'">
      <!-- Cover thumbnail -->
      <div style="flex-shrink:0;">
        ${coverSrc
          ? `<img src="${escapeHtml(coverSrc)}" alt="${escapeHtml(g.title)}"
               style="width:140px;height:100px;object-fit:cover;display:block;border:1px solid #1a1a1a;" loading="lazy">`
          : `<div style="width:140px;height:100px;background:#111;display:flex;align-items:center;justify-content:center;border:1px solid #1a1a1a;">
               <span style="font-family:monospace;font-size:9px;color:#333;">NO_IMAGE</span>
             </div>`
        }
      </div>
      <!-- Meta -->
      <div style="display:flex;flex-direction:column;justify-content:center;gap:6px;">
        <div style="font-family:monospace;font-size:10px;color:var(--ak-yellow);letter-spacing:2px;">${escapeHtml(displayDate)}</div>
        <h2 style="margin:0;font-size:1rem;font-weight:700;color:#fff;line-height:1.3;">${escapeHtml(g.title)}</h2>
        ${g.location ? `<div style="font-family:monospace;font-size:10px;color:#666;">📍 ${escapeHtml(g.location)}</div>` : ""}
        ${g.description ? `<p style="margin:0;font-size:13px;color:#666;line-height:1.6;">${escapeHtml(g.description)}</p>` : ""}
        ${g.tags.length > 0
          ? `<div style="display:flex;gap:6px;flex-wrap:wrap;">
               ${g.tags.map((t) => `<span class="tag-chip">${escapeHtml(t)}</span>`).join("")}
             </div>`
          : ""}
      </div>
    </a>`;
  }).join("");

  return `
    <div style="padding:20px 20px 40px;max-width:800px;">
      <div style="font-family:monospace;font-size:10px;color:var(--ak-yellow);letter-spacing:3px;margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid #1a1a1a;">
        // CREATIVE_LOGBOOK — ${galleries.length} ENTRIES
      </div>
      ${entries}
    </div>`;
}

export function GalleryListPage({
  galleries,
  mode = "gallery",
}: {
  galleries: GalleryMeta[];
  mode?: "gallery" | "log";
}): string {
  return mode === "gallery"
    ? GalleryModeView(galleries)
    : LogModeView(galleries);
}
