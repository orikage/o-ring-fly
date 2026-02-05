/** @jsx jsx */
import { jsx } from "hono/jsx";

export function ArticlePage({ title, date, tags, html }: { title: string; date: string; tags?: string[]; html: string }) {
  return (
    <div class="layer-middle" style="justify-content: center; align-items: center;">
      <div class="article-panel">
        <a href="/content" style="display: inline-block; color: var(--ak-text-dim); font-family: monospace; font-size: 11px; letter-spacing: 1px; text-decoration: none; margin-bottom: 20px;">
          ← BACK TO ARCHIVE
        </a>
        <div class="data-label">// {date} &nbsp; [{(tags || []).join(" | ") || "UNCLASSIFIED"}]</div>
        <h1>{title}</h1>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
