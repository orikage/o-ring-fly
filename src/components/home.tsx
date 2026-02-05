/** @jsx jsx */
import { jsx } from "hono/jsx";

export function HomePage() {
  return (
    <div class="layer-middle">
      <div class="content-panel">
        <div class="data-label">// PRTS TERMINAL_LINK: OK</div>
        <h1 class="title">O-RING<br />FLY</h1>
        <div style="background: var(--ak-yellow); color: black; padding: 2px 10px; font-weight: bold; display: inline-block; margin-top: 10px; font-size: 12px;">
          TACTICAL_PORTFOLIO_V5
        </div>

        <p style="color: #aaa; font-size: 14px; margin-top: 30px; line-height: 1.8;">
          情報の深淵を3D空間として表現しつつ、<br />
          従来の「タクティカル・ミニマリズム」を前景に統合。<br />
          エンドフィールドの機能美をWeb技術で再構築する。
        </p>

        <a href="/content" style="display: inline-block; margin-top: 24px; color: var(--ak-cyan); font-family: monospace; font-size: 12px; letter-spacing: 1px; text-decoration: none; border-bottom: 1px solid var(--ak-cyan);">
          &gt;&gt; ARCHIVES →
        </a>
      </div>
    </div>
  );
}
