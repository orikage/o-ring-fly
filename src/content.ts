import { readFileSync, readdirSync, existsSync } from "fs";
import { marked } from "marked";
import { resolve, join } from "path";

const CONTENT_DIR = resolve(import.meta.dir, "content");

export interface Article {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  body: string;
}

export interface ArticleMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
}

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const [key, ...valueParts] = line.split(":");
    if (key) meta[key.trim()] = valueParts.join(":").trim();
  }
  return { meta, body: match[2] };
}

export function getAllArticles(): ArticleMeta[] {
  if (!existsSync(CONTENT_DIR)) return [];

  return readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = readFileSync(join(CONTENT_DIR, file), "utf-8");
      const { meta } = parseFrontmatter(raw);
      const slug = file.replace(".md", "");
      return {
        slug,
        title: meta.title || slug,
        date: meta.date || "",
        tags: meta.tags ? meta.tags.split(",").map((t) => t.trim()) : [],
      };
    })
    .sort((a, b) => (b.date > a.date ? 1 : -1));
}

export async function getArticle(slug: string): Promise<Article | null> {
  const filePath = join(CONTENT_DIR, `${slug}.md`);
  if (!existsSync(filePath)) return null;

  const raw = readFileSync(filePath, "utf-8");
  const { meta, body } = parseFrontmatter(raw);
  const html = await marked(body);

  return {
    slug,
    title: meta.title || slug,
    date: meta.date || "",
    tags: meta.tags ? meta.tags.split(",").map((t) => t.trim()) : [],
    body: html as string,
  };
}
