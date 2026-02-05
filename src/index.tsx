import { Hono } from "hono";
import { Layout } from "./components/layout";
import { HomePage } from "./components/home";
import { ContentListPage } from "./components/content-list";
import { ArticlePage } from "./components/article";
import { getAllArticles, getArticle } from "./content";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const app = Hono();

const PUBLIC_DIR = resolve(import.meta.dir, "..", "public");
const SRC_DIR = resolve(import.meta.dir);

// --- Static file serving ---
// Serve /public/* files (CSS, images moved to public/)
app.get("/public/*", (c) => {
  const path = resolve(PUBLIC_DIR, c.req.param("*"));
  if (!existsSync(path)) return c.notFound();
  const ext = path.split(".").pop() || "";
  const mimeTypes: Record<string, string> = {
    css: "text/css",
    js: "application/javascript",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    webp: "image/webp",
    ico: "image/x-icon",
    woff2: "font/woff2",
  };
  const mime = mimeTypes[ext] || "application/octet-stream";
  return c.body(readFileSync(path), 200, { "Content-Type": mime });
});

// Serve /content/resource/* — 記事リソース（画像など）を src/content/resource/ から配信
app.get("/content/resource/*", (c) => {
  const resourcePath = resolve(SRC_DIR, "content", "resource", c.req.param("*"));
  if (!existsSync(resourcePath)) return c.notFound();
  const ext = resourcePath.split(".").pop() || "";
  const mimeTypes: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    webp: "image/webp",
  };
  const mime = mimeTypes[ext] || "application/octet-stream";
  return c.body(readFileSync(resourcePath), 200, { "Content-Type": mime });
});

// Serve legacy root-level images (splash_small.png etc.)
app.get("/:filename{.*\\.png}", (c) => {
  const path = resolve(PUBLIC_DIR, "..", c.req.param("filename"));
  if (!existsSync(path)) return c.notFound();
  return c.body(readFileSync(path), 200, { "Content-Type": "image/png" });
});

// --- Pages ---
app.get("/", (c) => {
  return c.html(Layout({ children: HomePage(), title: "O-ring fly" }));
});

app.get("/content", (c) => {
  const articles = getAllArticles();
  return c.html(Layout({ children: ContentListPage(articles), title: "Archives" }));
});

app.get("/content/:slug", async (c) => {
  const slug = c.req.param("slug");
  const article = await getArticle(slug);
  if (!article) return c.html(Layout({ children: `<div style="padding:100px 20px;text-align:center;color:#888;">記事が見つかりません</div>`, title: "Not Found" }), 404);
  return c.html(Layout({ children: ArticlePage(article), title: article.title }));
});

// --- Start ---
const port = Number(Bun.env.PORT || 3000);
app.listen(port);
console.log(`O-ring fly running on http://localhost:${port}`);

export default app;
