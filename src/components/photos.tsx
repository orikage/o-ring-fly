import type { Photo } from "../photos";

export function PhotosPage(photos: Photo[]) {
  const items = photos
    .map(
      (p, i) => `
      <div onclick="openLightbox(${i})" style="cursor:pointer;aspect-ratio:1;overflow:hidden;border:1px solid rgba(255,215,0,0.15);position:relative;background:rgba(0,0,0,0.5);"
           onmouseover="this.style.borderColor='rgba(255,215,0,0.5)';this.querySelector('.photo-info').style.opacity='1'"
           onmouseout="this.style.borderColor='rgba(255,215,0,0.15)';this.querySelector('.photo-info').style.opacity='0'">
        <img src="/content/resource/photos/${p.filename}" alt="${p.title}"
             style="width:100%;height:100%;object-fit:cover;display:block;" loading="lazy">
        <div class="photo-info" style="position:absolute;bottom:0;left:0;right:0;padding:10px 12px;background:linear-gradient(transparent,rgba(0,0,0,0.85));opacity:0;transition:opacity 0.2s;pointer-events:none;">
          <div style="font-family:monospace;font-size:9px;color:#ffd700;letter-spacing:1px;">${p.date}</div>
          <div style="font-size:12px;color:#fff;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.title}</div>
        </div>
      </div>`
    )
    .join("");

  const photosJson = JSON.stringify(photos).replace(/<\//g, "<\\/");

  return `
    <div style="padding:80px 20px 60px;max-width:1200px;margin:0 auto;">
      <div style="margin-bottom:32px;">
        <div style="font-family:monospace;font-size:10px;color:#ffd700;letter-spacing:2px;margin-bottom:8px;">// SECTION: PHOTOS</div>
        <h1 style="font-size:2rem;font-weight:900;text-transform:uppercase;letter-spacing:-1px;margin:0;">写真置き場</h1>
        <div style="width:60px;height:2px;background:#ffd700;margin-top:12px;"></div>
        <div style="font-family:monospace;font-size:11px;color:#888;margin-top:10px;">${photos.length} ITEMS LOGGED</div>
      </div>

      ${
        photos.length === 0
          ? `<p style="color:#888;font-family:monospace;font-size:13px;">写真はまだありません。<br><br>src/content/resource/photos/ に画像を追加し、<br>src/content/photos.json にメタデータを記述してください。</p>`
          : `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:6px;">${items}</div>`
      }

      <div style="margin-top:40px;">
        <a href="/" style="color:#888;font-family:monospace;font-size:12px;text-decoration:none;"
           onmouseover="this.style.color='#ffd700'" onmouseout="this.style.color='#888'">← ホームへ</a>
      </div>
    </div>

    <!-- Lightbox -->
    <div id="lightbox" onclick="closeLightbox()" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;z-index:500;background:rgba(0,0,0,0.93);backdrop-filter:blur(12px);justify-content:center;align-items:center;padding:20px;box-sizing:border-box;">
      <div onclick="event.stopPropagation()" style="max-width:920px;width:100%;position:relative;">
        <button onclick="closeLightbox()" style="position:absolute;top:-36px;right:0;background:none;border:none;color:#888;font-size:13px;cursor:pointer;font-family:monospace;letter-spacing:2px;padding:0;"
                onmouseover="this.style.color='#ffd700'" onmouseout="this.style.color='#888'">× CLOSE</button>
        <img id="lightbox-img" src="" alt="" style="width:100%;max-height:68vh;object-fit:contain;display:block;border:1px solid rgba(255,215,0,0.25);">
        <div style="padding:14px 0 0;border-top:1px solid rgba(255,255,255,0.08);margin-top:0;">
          <div style="font-family:monospace;font-size:10px;color:#ffd700;letter-spacing:2px;" id="lightbox-date"></div>
          <h2 style="margin:4px 0 6px;font-size:1.2rem;font-weight:900;color:#fff;" id="lightbox-title"></h2>
          <div id="lightbox-location" style="font-family:monospace;font-size:11px;color:#888;margin-bottom:8px;"></div>
          <div id="lightbox-tags" style="display:flex;gap:6px;flex-wrap:wrap;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;padding-top:14px;">
          <button onclick="prevPhoto()" id="lightbox-prev" style="background:none;border:1px solid rgba(255,255,255,0.2);color:#888;padding:7px 16px;cursor:pointer;font-family:monospace;font-size:11px;letter-spacing:1px;"
                  onmouseover="this.style.borderColor='#ffd700';this.style.color='#ffd700'" onmouseout="this.style.borderColor='rgba(255,255,255,0.2)';this.style.color='#888'">← PREV</button>
          <span id="lightbox-counter" style="font-family:monospace;font-size:11px;color:#888;align-self:center;"></span>
          <button onclick="nextPhoto()" id="lightbox-next" style="background:none;border:1px solid rgba(255,255,255,0.2);color:#888;padding:7px 16px;cursor:pointer;font-family:monospace;font-size:11px;letter-spacing:1px;"
                  onmouseover="this.style.borderColor='#ffd700';this.style.color='#ffd700'" onmouseout="this.style.borderColor='rgba(255,255,255,0.2)';this.style.color='#888'">NEXT →</button>
        </div>
      </div>
    </div>

    <script>
      const photosData = ${photosJson};
      let currentIndex = 0;

      function openLightbox(index) {
        currentIndex = index;
        updateLightbox();
        const lb = document.getElementById('lightbox');
        lb.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }

      function closeLightbox() {
        document.getElementById('lightbox').style.display = 'none';
        document.body.style.overflow = '';
      }

      function updateLightbox() {
        const p = photosData[currentIndex];
        const img = document.getElementById('lightbox-img');
        img.src = '/content/resource/photos/' + p.filename;
        img.alt = p.title;
        document.getElementById('lightbox-date').textContent = p.date;
        document.getElementById('lightbox-title').textContent = p.title;
        const locEl = document.getElementById('lightbox-location');
        locEl.textContent = p.location ? 'LOC: ' + p.location : '';
        const tagsEl = document.getElementById('lightbox-tags');
        tagsEl.innerHTML = p.tags.map(function(t) {
          return '<span style="font-size:10px;font-family:monospace;color:#00e5ff;background:rgba(0,229,255,0.1);padding:2px 8px;border-radius:2px;border:1px solid rgba(0,229,255,0.3);">' + t + '</span>';
        }).join('');
        document.getElementById('lightbox-counter').textContent = (currentIndex + 1) + ' / ' + photosData.length;
        document.getElementById('lightbox-prev').style.visibility = currentIndex === 0 ? 'hidden' : 'visible';
        document.getElementById('lightbox-next').style.visibility = currentIndex === photosData.length - 1 ? 'hidden' : 'visible';
      }

      function prevPhoto() {
        if (currentIndex > 0) { currentIndex--; updateLightbox(); }
      }

      function nextPhoto() {
        if (currentIndex < photosData.length - 1) { currentIndex++; updateLightbox(); }
      }

      document.addEventListener('keydown', function(e) {
        if (document.getElementById('lightbox').style.display !== 'none') {
          if (e.key === 'Escape') closeLightbox();
          if (e.key === 'ArrowLeft') prevPhoto();
          if (e.key === 'ArrowRight') nextPhoto();
        }
      });
    </script>
  `;
}
