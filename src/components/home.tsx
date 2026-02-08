export function HomePage() {
  return `
    <div style="display:flex;justify-content:center;align-items:center;min-height:100vh;padding:20px;">
      <div style="max-width:480px;width:100%;padding:48px 40px;border-left:3px solid #ffd700;background:rgba(0,0,0,0.85);backdrop-filter:blur(15px);" class="content-panel">
        <div style="font-family:monospace;font-size:10px;color:#ffd700;letter-spacing:2px;margin-bottom:8px;">// PRTS TERMINAL_LINK: OK</div>
        <h1 style="font-size:clamp(2.5rem,8vw,4rem);font-weight:900;margin:0;text-transform:uppercase;letter-spacing:-2px;line-height:0.85;">O-RING<br>FLY</h1>
        <div style="background:#ffd700;color:#000;padding:2px 10px;font-weight:bold;display:inline-block;margin-top:12px;font-size:12px;">TACTICAL_PORTFOLIO_V5</div>
        <p style="color:#aaa;font-size:14px;margin-top:28px;line-height:1.8;">
          情報の深淵を3D空間として表現しつつ、<br>
          従来の「タクティカル・ミニマリズム」を前景に統合。<br>
          エンドフィールドの機能美をWeb技術で再構築する。
        </p>
        <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,215,0,0.2);">
          <a href="/content" style="color:#00e5ff;font-family:monospace;font-size:13px;text-decoration:none;letter-spacing:1px;"
             onmouseover="this.style.color='#ffd700'" onmouseout="this.style.color='#00e5ff'">
            → ARCHIVES を閲覧する
          </a>
        </div>
      </div>
    </div>`;
}
