/**
 * layout.tsx — TacticalLayout
 * Arknights風タクティカルUIの外枠
 *
 * 構成:
 *   - Fixed HUD: システム時刻、コーナーブラケット
 *   - Fixed左ナビ
 *   - GALLERY | LOG モード切り替えスイッチ（ヘッダー右側）
 *   - 右端の装飾的システムログパネル（SystemLogPanel）
 *   - メインコンテンツエリア（children）
 */

import { escapeHtml } from "../utils";

function SystemLogPanel() {
  const logs = [
    "SYSTEM_ANALYSIS v2.1.4",
    "━━━━━━━━━━━━━━━━━━━━",
    "STATUS: OPERATIONAL",
    "MODE: ARCHIVE_ACCESS",
    "━━━━━━━━━━━━━━━━━━━━",
    "PROTOCOL: IMAGES_DB",
    "ENCRYPTION: AES-256",
    "CHANNEL: SECURED",
    "━━━━━━━━━━━━━━━━━━━━",
    "DATA_INTEGRITY: OK",
    "COMPRESSION: LOSSLESS",
    "FORMAT: [JPG/PNG/WEBP]",
    "━━━━━━━━━━━━━━━━━━━━",
    "// CREATIVE_LOG",
    "// VISUAL_ARCHIVE",
    "// FIELD_DISPATCH",
    "━━━━━━━━━━━━━━━━━━━━",
    "ACCESS_LEVEL: PUBLIC",
    "REGION: [REDACTED]",
    "TIMESTAMP: LIVE",
    "━━━━━━━━━━━━━━━━━━━━",
    "//////////////////// ",
    "//////////////////// ",
    "DATA STREAM ACTIVE  ",
    "//////////////////// ",
    "//////////////////// ",
  ];
  return logs.map((l) => `<div>${escapeHtml(l)}</div>`).join("");
}

export function Layout({
  children,
  title = "images",
  mode = "gallery",
  currentSlug = "",
  ogImage = "",
}: {
  children: string;
  title?: string;
  mode?: "gallery" | "log";
  currentSlug?: string;
  ogImage?: string;
}) {
  const modeParam = mode === "gallery" ? "gallery" : "log";
  const toggleMode = mode === "gallery" ? "log" : "gallery";

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | Tactical Image Archive</title>
  <link rel="stylesheet" href="/style.css">
  ${ogImage ? `
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:image" content="${escapeHtml(ogImage)}">
  <meta property="og:type" content="website">
  ` : ""}
</head>
<body style="margin:0;padding:0;background:var(--ak-bg);color:#fff;font-family:'Inter',-apple-system,sans-serif;overflow-x:hidden;min-height:100vh;">

  <!-- Scanline -->
  <div class="scanline"></div>

  <!-- HUD: Fixed corners -->
  <div class="hud-corner-tl"></div>
  <div class="hud-corner-br"></div>

  <!-- HUD: Top-right status -->
  <div style="position:fixed;top:0;right:0;padding:14px 20px;font-family:monospace;font-size:10px;color:var(--ak-cyan);line-height:1.7;text-align:right;z-index:200;pointer-events:none;">
    SYSTEM_TIME: <span id="hud-time">--:--:--</span><br>
    SIGNAL: ENCRYPTED // STABLE<br>
    ARCHIVE: <span style="color:var(--ak-yellow);">IMAGES_DB</span>
  </div>

  <!-- Fixed left nav -->
  <nav style="position:fixed;left:20px;top:50%;transform:translateY(-50%);z-index:200;display:flex;flex-direction:column;gap:12px;">
    <a href="/" class="nav-item" style="font-weight:900;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#555;text-decoration:none;display:flex;align-items:center;transition:all 0.2s;"
       onmouseover="this.style.color='var(--ak-yellow)'" onmouseout="this.style.color='#555'">Gallery</a>
    <a href="/?mode=log" class="nav-item" style="font-weight:900;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#555;text-decoration:none;display:flex;align-items:center;transition:all 0.2s;"
       onmouseover="this.style.color='var(--ak-yellow)'" onmouseout="this.style.color='#555'">Log</a>
    <a href="/admin" class="nav-item" style="font-weight:900;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#333;text-decoration:none;display:flex;align-items:center;transition:all 0.2s;"
       onmouseover="this.style.color='#555'" onmouseout="this.style.color='#333'">Admin</a>
  </nav>

  <!-- Right decorative SystemLog panel -->
  <div class="syslog-panel" style="position:fixed;right:0;top:0;bottom:0;width:80px;writing-mode:vertical-rl;display:flex;flex-direction:column;justify-content:center;padding:20px 0;z-index:50;pointer-events:none;">
    ${SystemLogPanel()}
  </div>

  <!-- Main content area -->
  <div style="position:relative;z-index:20;min-height:100vh;padding-left:60px;padding-right:90px;">
    <!-- Top mode toggle -->
    <div style="position:sticky;top:0;z-index:100;background:rgba(13,13,13,0.9);backdrop-filter:blur(8px);border-bottom:1px solid #1a1a1a;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;">
      <div style="font-family:monospace;font-size:11px;color:var(--ak-text-dim);letter-spacing:3px;">// ${escapeHtml(title.toUpperCase())}</div>
      <div style="display:flex;gap:0;">
        <a href="/?mode=gallery" class="mode-toggle-btn ${mode === "gallery" ? "active" : ""}">GALLERY</a>
        <a href="/?mode=log" class="mode-toggle-btn ${mode === "log" ? "active" : ""}">LOG</a>
      </div>
    </div>

    ${children}
  </div>

  <!-- Lightbox (shared) -->
  <div class="lightbox" id="lightbox" onclick="if(event.target===this)closeLightbox()">
    <button class="lightbox-close" onclick="closeLightbox()">✕</button>
    <button class="lightbox-nav prev" onclick="lightboxPrev()">‹</button>
    <div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:12px;">
      <img class="lightbox-img" id="lightbox-img" src="" alt="">
      <div id="lightbox-caption" style="font-family:monospace;font-size:11px;color:#888;text-align:center;"></div>
      <div id="lightbox-counter" style="font-family:monospace;font-size:10px;color:#444;"></div>
    </div>
    <button class="lightbox-nav next" onclick="lightboxNext()">›</button>
  </div>

  <script>
    // --- HUD Clock ---
    function updateTime() {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const el = document.getElementById("hud-time");
      if (el) el.textContent = pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
    }
    setInterval(updateTime, 1000);
    updateTime();

    // --- Lightbox ---
    let _lightboxImages = [];
    let _lightboxIndex = 0;

    function openLightbox(images, index) {
      _lightboxImages = images;
      _lightboxIndex = index;
      _showLightbox();
      document.getElementById("lightbox").classList.add("open");
    }

    function closeLightbox() {
      document.getElementById("lightbox").classList.remove("open");
    }

    function lightboxNext() {
      if (_lightboxImages.length === 0) return;
      _lightboxIndex = (_lightboxIndex + 1) % _lightboxImages.length;
      _showLightbox();
    }

    function lightboxPrev() {
      if (_lightboxImages.length === 0) return;
      _lightboxIndex = (_lightboxIndex - 1 + _lightboxImages.length) % _lightboxImages.length;
      _showLightbox();
    }

    function _showLightbox() {
      const img = _lightboxImages[_lightboxIndex];
      document.getElementById("lightbox-img").src = img.src;
      document.getElementById("lightbox-img").alt = img.caption || "";
      document.getElementById("lightbox-caption").textContent = img.caption || "";
      document.getElementById("lightbox-counter").textContent =
        _lightboxImages.length > 1
          ? (_lightboxIndex + 1) + " / " + _lightboxImages.length
          : "";
    }

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      const lb = document.getElementById("lightbox");
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") lightboxNext();
      if (e.key === "ArrowLeft") lightboxPrev();
    });

    // --- Tag filter ---
    function filterByTag(tag) {
      const chips = document.querySelectorAll(".tag-chip[data-tag]");
      chips.forEach((c) => {
        c.classList.toggle("active", c.dataset.tag === tag);
      });
      const items = document.querySelectorAll("[data-tags]");
      items.forEach((item) => {
        const tags = item.dataset.tags ? item.dataset.tags.split(",") : [];
        item.style.display = (!tag || tags.includes(tag)) ? "" : "none";
      });
    }

    // Active tag state
    let _activeTag = "";
    document.querySelectorAll(".tag-chip[data-tag]").forEach((chip) => {
      chip.addEventListener("click", () => {
        const tag = chip.dataset.tag;
        _activeTag = _activeTag === tag ? "" : tag;
        filterByTag(_activeTag);
      });
    });
  </script>
</body>
</html>`;
}
