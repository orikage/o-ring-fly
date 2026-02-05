import type { ArticleMeta } from "../content";

export function ContentListPage(articles: ArticleMeta[]) {
  const items = articles
    .map(
      (a) => `
      <a href="/content/${a.slug}" style="display:block;padding:20px 24px;border-left:3px solid #ffd700;background:rgba(0,0,0,0.7);backdrop-filter:blur(10px);text-decoration:none;transition:background 0.2s,padding-left 0.2s;margin-bottom:12px;" class="content-panel"
         onmouseover="this.style.background='rgba(0,0,0,0.9)';this.style.paddingLeft='28px'"
         onmouseout="this.style.background='rgba(0,0,0,0.7)';this.style.paddingLeft='24px'">
        <div style="font-family:monospace;font-size:10px;color:#ffd700;letter-spacing:2px;margin-bottom:6px;">${a.date || "DATE: UNKNOWN"}</div>
        <h2 style="margin:0;font-size:1.1rem;color:#fff;font-weight:700;">${a.title}</h2>
        ${a.tags.length ? `<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
          ${a.tags.map((t) => `<span style="font-size:10px;font-family:monospace;color:#00e5ff;background:rgba(0,229,255,0.1);padding:2px 8px;border-radius:2px;border:1px solid rgba(0,229,255,0.3);">${t}</span>`).join("")}
        </div>` : ""}
      </a>`
    )
    .join("");

  return `
    <div style="display:flex;justify-content:center;min-height:100vh;padding:80px 20px 40px;">
      <div style="max-width:640px;width:100%;">
        <div style="margin-bottom:32px;">
          <div style="font-family:monospace;font-size:10px;color:#ffd700;letter-spacing:2px;margin-bottom:8px;">// SECTION: ARCHIVES</div>
          <h1 style="font-size:2rem;font-weight:900;text-transform:uppercase;letter-spacing:-1px;margin:0;">記事一覧</h1>
          <div style="width:60px;height:2px;background:#ffd700;margin-top:12px;"></div>
        </div>
        ${items || `<p style="color:#888;font-family:monospace;font-size:13px;">記事はまだありません。</p>`}
        <div style="margin-top:32px;">
          <a href="/" style="color:#888;font-family:monospace;font-size:12px;text-decoration:none;"
             onmouseover="this.style.color='#ffd700'" onmouseout="this.style.color='#888'">← ホームへ</a>
        </div>
      </div>
    </div>`;
}
