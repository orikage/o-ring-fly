import { marked } from "marked";
import { readFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CONTENT_DIR = resolve(__dirname, "content");

export interface ArticleFrontmatter {
  title: string;
  date: string;
  tags?: string[];
}

export interface Article extends ArticleFrontmatter {
  slug: string;
  body: string;
  html: string;
}

/** Parse YAML-style frontmatter (title, date, tags only — no full YAML parser needed) */
function parseFrontmatter(raw: string): { frontmatter: ArticleFrontmatter; body: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: { title: "Untitled", date: "UNKNOWN" }, body: raw };
  }

  const block = match[1];
  const body = match[2];

  const titleMatch = block.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  const dateMatch = block.match(/^date:\s*["']?(.+?)["']?\s*$/m);
  const tagsMatch = block.match(/^tags:\s*\[(.+?)\]\s*$/m);

  const tags = tagsMatch
    ? tagsMatch[1].split(",").map((t) => t.trim().replace(/^["']|["']$/g, ""))
    : undefined;

  return {
    frontmatter: {
      title: titleMatch ? titleMatch[1].trim() : "Untitled",
      date: dateMatch ? dateMatch[1].trim() : "UNKNOWN",
      tags,
    },
    body,
  };
}

/** Load a single article by slug */
export function getArticle(slug: string): Article | null {
  const filePath = resolve(CONTENT_DIR, `${slug}.md`);
  try {
    const raw = readFileSync(filePath, "utf-8");
    const { frontmatter, body } = parseFrontmatter(raw);
    const html = marked(body) as string;
    return { ...frontmatter, slug, body, html };
  } catch {
    return null;
  }
}

/** Load all articles sorted by date descending */
export function getAllArticles(): Article[] {
  let files: string[];
  try {
    files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }

  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      return getArticle(slug);
    })
    .filter((a): a is Article => a !== null)
    .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
}
