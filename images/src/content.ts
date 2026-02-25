/**
 * content.ts
 * ギャラリーコンテンツ管理
 *
 * `galleries/` ディレクトリを自動スキャンし、
 * 各サブフォルダの index.md からメタデータを読み込む。
 *
 * フォルダ構造:
 *   galleries/
 *     2026-02-kyoto/
 *       index.md       ← frontmatter + Markdown本文
 *       DSC0001.jpg
 *       DSC0002.jpg
 */

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, statSync } from "fs";
import { resolve, join } from "path";
import { marked } from "marked";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

export interface GalleryMeta {
  slug: string;
  title: string;
  date: string;
  type: "photo" | "illustration" | "mixed";
  location?: string;
  tags: string[];
  description?: string;
  cover?: string;
}

export interface GalleryImage {
  filename: string;
  caption?: string;
}

export interface Gallery extends GalleryMeta {
  body: string; // HTMLに変換済みのMarkdown本文
  images: GalleryImage[];
}

export interface GalleryCreateInput {
  title: string;
  date: string;
  type: "photo" | "illustration" | "mixed";
  location?: string;
  tags: string[];
  description?: string;
  cover?: string;
}

export interface GalleryUpdateInput {
  title: string;
  date: string;
  type: "photo" | "illustration" | "mixed";
  location?: string;
  tags: string[];
  description?: string;
  cover?: string;
  body?: string;
}

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (key) meta[key] = value;
  }
  return { meta, body: match[2] };
}

function buildFrontmatter(input: GalleryUpdateInput): string {
  const lines = [
    `title: ${input.title}`,
    `date: ${input.date}`,
    `type: ${input.type}`,
  ];
  if (input.location) lines.push(`location: ${input.location}`);
  if (input.tags.length > 0) lines.push(`tags: ${input.tags.join(",")}`);
  if (input.description) lines.push(`description: ${input.description}`);
  if (input.cover) lines.push(`cover: ${input.cover}`);
  return `---\n${lines.join("\n")}\n---\n\n${input.body ?? ""}`;
}

function parseType(raw: string): "photo" | "illustration" | "mixed" {
  if (raw === "illustration" || raw === "mixed") return raw;
  return "photo";
}

function parseGalleryMeta(slug: string, meta: Record<string, string>): GalleryMeta {
  return {
    slug,
    title: meta.title || slug,
    date: meta.date || "",
    type: parseType(meta.type || "photo"),
    location: meta.location || undefined,
    tags: meta.tags ? meta.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    description: meta.description || undefined,
    cover: meta.cover || undefined,
  };
}

function getImageFiles(dirPath: string): GalleryImage[] {
  if (!existsSync(dirPath)) return [];
  return readdirSync(dirPath)
    .filter((name) => {
      const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
      return IMAGE_EXTENSIONS.has(ext) && statSync(join(dirPath, name)).isFile();
    })
    .sort()
    .map((filename) => ({ filename }));
}

export class GalleryContent {
  private galleriesDir: string;

  constructor(galleriesDir: string) {
    this.galleriesDir = resolve(galleriesDir);
  }

  async getAllGalleries(): Promise<GalleryMeta[]> {
    if (!existsSync(this.galleriesDir)) return [];

    const slugs = readdirSync(this.galleriesDir).filter((name) => {
      const fullPath = join(this.galleriesDir, name);
      return statSync(fullPath).isDirectory() && existsSync(join(fullPath, "index.md"));
    });

    return slugs
      .map((slug) => {
        const raw = readFileSync(join(this.galleriesDir, slug, "index.md"), "utf-8");
        const { meta } = parseFrontmatter(raw);
        return parseGalleryMeta(slug, meta);
      })
      .sort((a, b) => (b.date > a.date ? 1 : -1));
  }

  async getGallery(slug: string): Promise<Gallery | null> {
    const galleryDir = join(this.galleriesDir, slug);
    const indexPath = join(galleryDir, "index.md");

    if (!existsSync(galleryDir) || !existsSync(indexPath)) return null;

    const raw = readFileSync(indexPath, "utf-8");
    const { meta, body } = parseFrontmatter(raw);
    const html = await marked(body);

    return {
      ...parseGalleryMeta(slug, meta),
      body: html as string,
      images: getImageFiles(galleryDir),
    };
  }

  async createGallery(slug: string, input: GalleryCreateInput): Promise<void> {
    // Validate slug to prevent path traversal
    if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
      throw new Error(`Invalid slug: "${slug}" — only alphanumeric, hyphens, and underscores allowed`);
    }
    const galleryDir = join(this.galleriesDir, slug);
    if (existsSync(galleryDir)) {
      throw new Error(`Gallery already exists: ${slug}`);
    }
    mkdirSync(galleryDir, { recursive: true });
    const content = buildFrontmatter({ ...input, body: "" });
    writeFileSync(join(galleryDir, "index.md"), content, "utf-8");
  }

  async updateGalleryMeta(slug: string, input: GalleryUpdateInput): Promise<void> {
    const indexPath = join(this.galleriesDir, slug, "index.md");
    const content = buildFrontmatter(input);
    writeFileSync(indexPath, content, "utf-8");
  }
}

// グローバルインスタンス（デフォルトのギャラリーディレクトリ）
const DEFAULT_GALLERIES_DIR = resolve(import.meta.dir, "content", "galleries");
export const galleryContent = new GalleryContent(DEFAULT_GALLERIES_DIR);
