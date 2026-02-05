/** @jsx jsx */
import { jsx } from "hono/jsx";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { Layout } from "./components/layout.tsx";
import { HomePage } from "./components/home.tsx";
import { ContentListPage } from "./components/content-list.tsx";
import { ArticlePage } from "./components/article.tsx";
import { getAllArticles, getArticle } from "./content.ts";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = new Hono();

// --- Static files (public/) ---
app.use("/public/*", serveStatic({ root: resolve(__dirname, ".."), rewriteRequestPath: (path) => path }));

// --- Inline CSS: serve src/style.css at /style.css ---
app.get("/style.css", (c) => {
  const css = readFileSync(resolve(__dirname, "style.css"), "utf-8");
  return c.text(css, 200, { "Content-Type": "text/css; charset=utf-8" });
});

// --- Home ---
app.get("/", (c) => {
  return c.html(
    <Layout>
      <HomePage />
    </Layout>
  );
});

// --- Content list ---
app.get("/content", (c) => {
  const articles = getAllArticles();
  return c.html(
    <Layout title="O-ring fly | ARCHIVE">
      <ContentListPage articles={articles} />
    </Layout>
  );
});

// --- Single article ---
app.get("/content/:slug", (c) => {
  const slug = c.req.param("slug");
  const article = getArticle(slug);

  if (!article) {
    return c.html(
      <Layout title="O-ring fly | 404">
        <div class="layer-middle" style="justify-content: center; align-items: center;">
          <div class="content-panel">
            <div class="data-label">// ERROR CODE: 404</div>
            <h2 style="color: var(--ak-yellow); font-size: 1.6rem; margin-top: 8px;">RECORD NOT FOUND</h2>
            <p style="color: var(--ak-text-dim); font-size: 14px; margin-top: 12px;">
              要求されたアーカイブは存在しません。
            </p>
            <a href="/content" style="color: var(--ak-cyan); font-family: monospace; font-size: 12px; text-decoration: none; margin-top: 16px; display: inline-block;">
              ← BACK TO ARCHIVE
            </a>
          </div>
        </div>
      </Layout>,
      404
    );
  }

  return c.html(
    <Layout title={`O-ring fly | ${article.title}`}>
      <ArticlePage title={article.title} date={article.date} tags={article.tags} html={article.html} />
    </Layout>
  );
});

// --- Start server ---
const PORT = Number(process.env.PORT) || 3000;

export default app;

Bun.serve({
  fetch: app.fetch,
  port: PORT,
});

console.log(`[O-RING FLY] Server running on http://localhost:${PORT}`);
