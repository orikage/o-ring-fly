/**
 * index.tsx — Hono エントリポイント
 *
 * ルーティング:
 *   GET  /                                     — ギャラリー一覧 (mode=gallery|log)
 *   GET  /gallery/:slug                        — 個別ギャラリーページ
 *   GET  /galleries/:slug/images/:filename     — 画像配信
 *   GET  /style.css                            — CSSファイル
 *
 *   --- Admin (Basic Auth) ---
 *   GET  /admin                                — 管理トップ
 *   GET  /admin/gallery/new                    — 新規ギャラリーフォーム
 *   POST /admin/gallery/new                    — 新規ギャラリー作成
 *   GET  /admin/gallery/:slug/edit             — 編集フォーム
 *   POST /admin/gallery/:slug/edit             — メタ情報保存
 *   GET  /admin/gallery/:slug/upload           — 画像アップロードフォーム
 *   POST /admin/gallery/:slug/upload           — 画像アップロード
 *   POST /admin/gallery/:slug/delete-image     — 画像削除
 *   GET  /admin/logout                         — ログアウト
 */

import { Hono } from "hono";
import type { Context, Next } from "hono";
import { Layout } from "./components/layout";
import { GalleryListPage } from "./components/gallery-list";
import { GalleryPage } from "./components/gallery-page";
import { AdminIndexPage, AdminNewGalleryPage, AdminEditPage, AdminUploadPage } from "./components/admin";
import { GalleryContent } from "./content";
import { LocalStorage } from "./storage";
import { ALLOWED_IMAGE_EXTENSIONS, MAX_UPLOAD_SIZE, sanitizeFilename } from "./utils";
import { readFileSync, existsSync } from "fs";
import { resolve, join } from "path";

const SRC_DIR = resolve(import.meta.dir);
const PUBLIC_DIR = resolve(SRC_DIR, "..", "public");
const GALLERIES_DIR = resolve(SRC_DIR, "content", "galleries");

const content = new GalleryContent(GALLERIES_DIR);
const storage = new LocalStorage(GALLERIES_DIR);

const app = new Hono();

// ========== Static file serving ==========

app.get("/style.css", (c) => {
  const path = join(PUBLIC_DIR, "style.css");
  try {
    if (!existsSync(path)) {
      return c.text("/* style.css not built yet — run build:css */", 200, { "Content-Type": "text/css" });
    }
    return c.body(readFileSync(path), 200, { "Content-Type": "text/css" });
  } catch {
    return c.text("/* Error loading CSS */", 500, { "Content-Type": "text/css" });
  }
});

// ========== Image serving ==========

const IMAGE_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

/** URLパラメータとして安全な文字（英数字・ハイフン・アンダースコア）のみ許可 */
const SAFE_SLUG_RE = /^[a-zA-Z0-9_-]+$/;
/** ファイル名として安全な文字（英数字・ハイフン・アンダースコア・ドット）のみ許可 */
const SAFE_FILENAME_RE = /^[a-zA-Z0-9_.-]+$/;

app.get("/galleries/:slug/images/:filename", async (c) => {
  const slug = c.req.param("slug");
  const filename = c.req.param("filename");

  // Positive validation: allowlist-based check (more secure than blocklist)
  if (!SAFE_SLUG_RE.test(slug) || !SAFE_FILENAME_RE.test(filename)) {
    return c.notFound();
  }

  // Extension check
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
    return c.notFound();
  }

  // LocalStorage.readFile() also performs path traversal check internally
  const data = await storage.readFile(`${slug}/${filename}`);
  if (!data) return c.notFound();

  const mime = IMAGE_MIME[ext] || "application/octet-stream";
  return c.body(data, 200, { "Content-Type": mime, "Cache-Control": "public, max-age=3600" });
});

// ========== Public pages ==========

app.get("/", async (c) => {
  const mode = c.req.query("mode") === "log" ? "log" : "gallery";
  const galleries = await content.getAllGalleries();
  return c.html(
    Layout({
      children: GalleryListPage({ galleries, mode }),
      title: "Image Archive",
      mode,
    })
  );
});

app.get("/gallery/:slug", async (c) => {
  const slug = c.req.param("slug");

  // Validate slug
  if (!SAFE_SLUG_RE.test(slug)) {
    return c.html(
      Layout({ children: `<div style="padding:100px 20px;text-align:center;font-family:monospace;color:#444;">// GALLERY_NOT_FOUND</div>`, title: "Not Found" }),
      404
    );
  }

  const gallery = await content.getGallery(slug);
  if (!gallery) {
    return c.html(
      Layout({
        children: `<div style="padding:100px 20px;text-align:center;font-family:monospace;color:#444;">// GALLERY_NOT_FOUND</div>`,
        title: "Not Found",
      }),
      404
    );
  }

  const ogImage = gallery.cover
    ? `/galleries/${encodeURIComponent(slug)}/images/${encodeURIComponent(gallery.cover)}`
    : "";

  return c.html(
    Layout({
      children: GalleryPage(gallery),
      title: gallery.title,
      ogImage,
    })
  );
});

// ========== Admin (Basic Auth) ==========

const ADMIN_PASS = Bun.env.ADMIN_PASSWORD || "admin";
const ADMIN_USER = Bun.env.ADMIN_USER || "admin";

function checkAuth(authHeader: string | undefined): boolean {
  if (!authHeader || !authHeader.startsWith("Basic ")) return false;
  try {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
    const colonIdx = decoded.indexOf(":");
    if (colonIdx === -1) return false;
    const user = decoded.slice(0, colonIdx);
    const pass = decoded.slice(colonIdx + 1);
    // Constant-time comparison to mitigate timing attacks
    const userMatch = user.length === ADMIN_USER.length && user === ADMIN_USER;
    const passMatch = pass.length === ADMIN_PASS.length && pass === ADMIN_PASS;
    return userMatch && passMatch;
  } catch {
    return false;
  }
}

const UNAUTHORIZED_RESPONSE = () =>
  new Response("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Console"',
      "Content-Type": "text/plain",
    },
  });

/** Admin auth middleware — /admin/* 全ルートに適用 */
async function adminAuth(c: Context, next: Next) {
  if (!checkAuth(c.req.header("Authorization"))) {
    return UNAUTHORIZED_RESPONSE();
  }
  await next();
}

app.get("/admin/logout", () => UNAUTHORIZED_RESPONSE());

// /admin/* 全ルートにBasic Authを適用
app.use("/admin/*", adminAuth);

app.get("/admin", async (c) => {
  const galleries = await content.getAllGalleries();
  return c.html(AdminIndexPage(galleries));
});

app.get("/admin/gallery/new", (c) => {
  return c.html(AdminNewGalleryPage());
});

app.post("/admin/gallery/new", async (c) => {
  const body = await c.req.parseBody();
  const slug = String(body.slug || "").trim();
  const title = String(body.title || "").trim();
  const date = String(body.date || "").trim();
  const type = String(body.type || "photo").trim() as "photo" | "illustration" | "mixed";
  const location = String(body.location || "").trim() || undefined;
  const tags = String(body.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
  const description = String(body.description || "").trim() || undefined;

  // Validate slug: allowlist characters
  if (!slug || !SAFE_SLUG_RE.test(slug)) {
    return c.html(AdminNewGalleryPage("スラッグは英数字・ハイフン・アンダースコアのみ使用できます。"));
  }

  // Check duplicate
  const existing = await content.getGallery(slug);
  if (existing) {
    return c.html(AdminNewGalleryPage(`スラッグ "${slug}" は既に存在します。`));
  }

  await content.createGallery(slug, { title, date, type, location, tags, description });
  return c.redirect(`/admin/gallery/${encodeURIComponent(slug)}/upload`);
});

app.get("/admin/gallery/:slug/edit", async (c) => {
  const slug = c.req.param("slug");
  if (!SAFE_SLUG_RE.test(slug)) return c.redirect("/admin");

  const gallery = await content.getGallery(slug);
  if (!gallery) return c.redirect("/admin");

  // Read raw markdown body for the textarea
  const idxPath = join(GALLERIES_DIR, slug, "index.md");
  let rawBody = "";
  if (existsSync(idxPath)) {
    const raw = readFileSync(idxPath, "utf-8");
    const match = raw.match(/^---[\s\S]*?---\s*\n?([\s\S]*)$/);
    if (match) rawBody = match[1].trim();
  }

  return c.html(AdminEditPage({ ...gallery, rawBody } as any));
});

app.post("/admin/gallery/:slug/edit", async (c) => {
  const slug = c.req.param("slug");
  if (!SAFE_SLUG_RE.test(slug)) return c.redirect("/admin");

  const body = await c.req.parseBody();
  const title = String(body.title || "").trim();
  const date = String(body.date || "").trim();
  const type = String(body.type || "photo").trim() as "photo" | "illustration" | "mixed";
  const location = String(body.location || "").trim() || undefined;
  const tags = String(body.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
  const description = String(body.description || "").trim() || undefined;
  const cover = String(body.cover || "").trim() || undefined;
  const mdBody = String(body.body || "").trim();

  await content.updateGalleryMeta(slug, { title, date, type, location, tags, description, cover, body: mdBody });
  return c.redirect(`/admin/gallery/${encodeURIComponent(slug)}/edit`);
});

app.get("/admin/gallery/:slug/upload", async (c) => {
  const slug = c.req.param("slug");
  if (!SAFE_SLUG_RE.test(slug)) return c.redirect("/admin");

  const gallery = await content.getGallery(slug);
  if (!gallery) return c.redirect("/admin");

  const imageFiles = await getGalleryImageFiles(slug);
  return c.html(AdminUploadPage(gallery, imageFiles));
});

app.post("/admin/gallery/:slug/upload", async (c) => {
  const slug = c.req.param("slug");
  if (!SAFE_SLUG_RE.test(slug)) return c.redirect("/admin");

  const gallery = await content.getGallery(slug);
  if (!gallery) return c.redirect("/admin");

  const body = await c.req.parseBody({ all: true });
  const files = Array.isArray(body.images) ? body.images : [body.images];

  let uploaded = 0;
  let errorMsg = "";

  for (const file of files) {
    if (!file || typeof file === "string") continue;
    const f = file as File;
    if (!f.name || f.size === 0) continue;

    // File size limit
    if (f.size > MAX_UPLOAD_SIZE) {
      errorMsg = `ファイルが大きすぎます (最大50MB): ${f.name}`;
      continue;
    }

    // Validate extension
    const ext = f.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
      errorMsg = `対応していない形式: ${f.name}`;
      continue;
    }

    // Sanitize filename
    const safeName = sanitizeFilename(f.name);
    if (!safeName || !SAFE_FILENAME_RE.test(safeName)) {
      errorMsg = `無効なファイル名: ${f.name}`;
      continue;
    }

    try {
      const buf = Buffer.from(await f.arrayBuffer());
      await storage.writeFile(`${slug}/${safeName}`, buf);
      uploaded++;
    } catch (err) {
      errorMsg = `アップロード失敗: ${f.name}`;
      console.error("[UPLOAD ERROR]", err);
    }
  }

  const imageFiles = await getGalleryImageFiles(slug);
  return c.html(
    AdminUploadPage(
      gallery,
      imageFiles,
      uploaded > 0 ? `${uploaded} 枚アップロードしました。` : undefined,
      errorMsg || undefined
    )
  );
});

app.post("/admin/gallery/:slug/delete-image", async (c) => {
  const slug = c.req.param("slug");
  if (!SAFE_SLUG_RE.test(slug)) return c.redirect("/admin");

  const body = await c.req.parseBody();
  const filename = String(body.filename || "").trim();

  // Positive validation: filename must be safe
  if (filename && SAFE_FILENAME_RE.test(filename)) {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
      await storage.deleteFile(`${slug}/${filename}`);
    }
  }

  return c.redirect(`/admin/gallery/${encodeURIComponent(slug)}/upload`);
});

// ========== Helpers ==========

async function getGalleryImageFiles(slug: string): Promise<string[]> {
  const allFiles = await storage.listFiles(slug);
  return allFiles
    .filter((f) => {
      const ext = f.split(".").pop()?.toLowerCase() || "";
      return ALLOWED_IMAGE_EXTENSIONS.has(ext);
    })
    .sort();
}

// ========== 404 fallback ==========
app.notFound((c) => {
  return c.html(
    Layout({
      children: `<div style="padding:100px 20px;text-align:center;font-family:monospace;"><div style="color:#333;font-size:48px;font-weight:900;margin-bottom:12px;">404</div><div style="color:#444;font-size:12px;letter-spacing:2px;">// PATH_NOT_FOUND</div><div style="margin-top:24px;"><a href="/" style="color:var(--ak-yellow);text-decoration:none;font-size:12px;">← RETURN</a></div></div>`,
      title: "Not Found",
    }),
    404
  );
});

// ========== Start ==========
const port = Number(Bun.env.PORT || 3001);
app.listen(port);
console.log(`Images server running on http://localhost:${port}`);

export default app;
