/**
 * gallery-page.tsx — GalleryPage
 * 個別ギャラリーページ
 *
 * 機能:
 * - Masonryグリッド（アスペクト比保持）で全画像を表示
 * - 画像クリックでライトボックス表示
 * - グリッチホバーエフェクト
 * - Markdown本文表示（左カラム or 上部）
 */

import type { Gallery } from "../content";
import { escapeHtml, escapeJs } from "../utils";

export function GalleryPage(gallery: Gallery): string {
  const basePath = `/galleries/${encodeURIComponent(gallery.slug)}/images/`;
  const displayDate = gallery.date ? gallery.date.replace(/-/g, ".") : "DATE: UNKNOWN";

  // Build lightbox images array as JSON
  const lightboxImages = gallery.images.map((img) => ({
    src: basePath + encodeURIComponent(img.filename),
    caption: img.caption || img.filename,
  }));
  const lightboxJson = JSON.stringify(lightboxImages);

  const imageItems = gallery.images.map((img, i) => {
    const src = basePath + encodeURIComponent(img.filename);
    const caption = img.caption || img.filename;
    return `
    <div class="masonry-item" onclick="openLightbox(window._galleryImages, ${i})">
      <img src="${escapeHtml(src)}" alt="${escapeHtml(caption)}" loading="lazy">
      <div class="overlay">
        <div style="font-family:monospace;font-size:10px;color:#ccc;">${escapeHtml(caption)}</div>
      </div>
    </div>`;
  }).join("");

  const noImages = gallery.images.length === 0
    ? `<div style="padding:60px 20px;text-align:center;font-family:monospace;font-size:12px;color:#333;letter-spacing:2px;">// NO_IMAGES_FOUND</div>`
    : "";

  return `
  <!-- Gallery page layout: header + 2-column (body | images) -->
  <div style="padding:20px;">
    <!-- Back link -->
    <div style="margin-bottom:20px;">
      <a href="/" style="font-family:monospace;font-size:11px;color:#444;text-decoration:none;letter-spacing:1px;"
         onmouseover="this.style.color='var(--ak-yellow)'" onmouseout="this.style.color='#444'">← GALLERY_INDEX</a>
    </div>

    <!-- Header panel with 45° clip -->
    <div class="panel-clip" style="padding:24px 28px;border-left:3px solid var(--ak-yellow);background:rgba(0,0,0,0.7);backdrop-filter:blur(10px);margin-bottom:24px;">
      <div style="font-family:monospace;font-size:10px;color:var(--ak-yellow);letter-spacing:3px;margin-bottom:6px;">${escapeHtml(displayDate)}</div>
      <h1 style="font-size:clamp(1.4rem,4vw,2rem);font-weight:900;margin:0;color:#fff;letter-spacing:-0.5px;">${escapeHtml(gallery.title)}</h1>
      <div style="margin-top:10px;display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
        ${gallery.location ? `<span style="font-family:monospace;font-size:10px;color:#666;">LOC: ${escapeHtml(gallery.location)}</span>` : ""}
        <span style="font-family:monospace;font-size:10px;color:#444;">TYPE: ${escapeHtml(gallery.type.toUpperCase())}</span>
        <span style="font-family:monospace;font-size:10px;color:#444;">IMG_COUNT: ${gallery.images.length}</span>
      </div>
      ${gallery.tags.length > 0
        ? `<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">
             ${gallery.tags.map((t) => `<span class="tag-chip">${escapeHtml(t)}</span>`).join("")}
           </div>`
        : ""}
    </div>

    <!-- Two-column: body text + image grid -->
    <div style="display:grid;grid-template-columns:${gallery.body && gallery.body.trim().length > 20 ? "minmax(200px,280px) 1fr" : "1fr"};gap:24px;align-items:start;">
      ${gallery.body && gallery.body.trim().length > 20
        ? `
      <!-- Left: description / body text -->
      <div>
        <div style="position:sticky;top:60px;">
          <div style="font-family:monospace;font-size:9px;color:var(--ak-yellow);letter-spacing:2px;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #1a1a1a;">// FIELD_NOTES</div>
          <div class="article-body" style="color:#888;font-size:13px;line-height:1.8;">${gallery.body}</div>
        </div>
      </div>
      ` : ""}

      <!-- Right: Masonry image grid -->
      <div>
        ${noImages}
        ${gallery.images.length > 0
          ? `<div class="masonry-grid">${imageItems}</div>`
          : ""}
      </div>
    </div>
  </div>

  <script>
    // Initialize gallery lightbox images
    window._galleryImages = ${lightboxJson};
  </script>`;
}
