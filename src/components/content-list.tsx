/** @jsx jsx */
import { jsx } from "hono/jsx";
import type { Article } from "../content.ts";

export function ContentListPage({ articles }: { articles: Article[] }) {
  return (
    <div class="layer-middle" style="justify-content: center; align-items: center;">
      <div class="content-panel" style="max-width: 560px;">
        <div class="data-label">// ARCHIVE INDEX</div>
        <h2 style="color: var(--ak-yellow); font-size: 1.4rem; margin-top: 12px; margin-bottom: 24px; letter-spacing: -0.5px;">
          OPERATIONS LOG
        </h2>

        {articles.length === 0 ? (
          <p style="color: var(--ak-text-dim); font-family: monospace; font-size: 13px;">
            [NO ENTRIES FOUND]
          </p>
        ) : (
          <div>
            {articles.map((article) => (
              <div class="list-item" key={article.slug}>
                <a href={`/content/${article.slug}`}>{article.title}</a>
                <div class="meta">
                  DATE: {article.date} &nbsp; TAG: {article.tags?.join(", ") || "UNCLASSIFIED"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
