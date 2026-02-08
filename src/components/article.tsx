import type { Article } from "../content";

export function ArticlePage(article: Article) {
  return `
    <div style="display:flex;justify-content:center;min-height:100vh;padding:80px 20px 60px;">
      <div style="max-width:720px;width:100%;">
        <!-- Header -->
        <div style="margin-bottom:36px;padding:28px 32px;border-left:3px solid #ffd700;background:rgba(0,0,0,0.85);backdrop-filter:blur(15px);" class="content-panel">
          <div style="font-family:monospace;font-size:10px;color:#ffd700;letter-spacing:2px;margin-bottom:8px;">${article.date || "DATE: UNKNOWN"}</div>
          <h1 style="font-size:clamp(1.5rem,5vw,2.2rem);font-weight:900;margin:0;color:#fff;line-height:1.2;">${article.title}</h1>
          ${article.tags.length ? `<div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap;">
            ${article.tags.map((t) => `<span style="font-size:10px;font-family:monospace;color:#00e5ff;background:rgba(0,229,255,0.1);padding:3px 10px;border-radius:2px;border:1px solid rgba(0,229,255,0.3);">${t}</span>`).join("")}
          </div>` : ""}
        </div>

        <!-- Body -->
        <div class="article-body" style="padding:0 4px;color:#ccc;font-size:15px;line-height:1.8;">
          ${article.body}
        </div>

        <!-- Back link -->
        <div style="margin-top:48px;padding-top:20px;border-top:1px solid rgba(255,215,0,0.15);">
          <a href="/content" style="color:#888;font-family:monospace;font-size:12px;text-decoration:none;"
             onmouseover="this.style.color='#ffd700'" onmouseout="this.style.color='#888'">← アーカイブ一覧へ</a>
        </div>
      </div>
    </div>`;
}
