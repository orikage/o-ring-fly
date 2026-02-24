import { readFileSync, readdirSync, existsSync } from 'fs';
import { marked } from 'marked';
import { resolve, join } from 'path';

export interface GalleryImage {
  filename: string;
  caption?: string;
}

export interface GalleryMeta {
  slug: string;
  title: string;
  date: string;
  type: 'photo' | 'illustration' | 'mixed';
  location?: string;
  tags: string[];
  description?: string;
  cover: string;
  imageCount: number;
}

export interface Gallery extends GalleryMeta {
  images: GalleryImage[];
  body: string;
}

const IMAGE_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg',
]);

function isImageFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return IMAGE_EXTENSIONS.has(ext);
}

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (match == null) return { meta: {}, body: raw };

  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (key) meta[key] = value;
  }
  return { meta, body: match[2] };
}

function listImages(galleryDir: string): string[] {
  if (existsSync(galleryDir) === false) return [];
  return readdirSync(galleryDir).filter(isImageFile);
}

export class GalleryContentManager {
  constructor(private readonly galleriesDir: string) {}

  getAllGalleries(): GalleryMeta[] {
    if (existsSync(this.galleriesDir) === false) return [];

    const entries = readdirSync(this.galleriesDir, { withFileTypes: true });

    return entries
      .filter((e) => e.isDirectory())
      .map((e) => {
        const slug = e.name;
        const galleryDir = join(this.galleriesDir, slug);
        const indexPath = join(galleryDir, 'index.md');

        if (existsSync(indexPath) === false) return null;

        const raw = readFileSync(indexPath, 'utf-8');
        const { meta } = parseFrontmatter(raw);
        const images = listImages(galleryDir);

        return {
          slug,
          title: meta.title || slug,
          date: meta.date || '',
          type: (meta.type as GalleryMeta['type']) || 'photo',
          location: meta.location || undefined,
          tags: meta.tags ? meta.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          description: meta.description || undefined,
          cover: meta.cover || images[0] || '',
          imageCount: images.length,
        } satisfies GalleryMeta;
      })
      .filter((g): g is GalleryMeta => g !== null)
      .sort((a, b) => (b.date > a.date ? 1 : -1));
  }

  async getGallery(slug: string): Promise<Gallery | null> {
    const galleryDir = join(this.galleriesDir, slug);
    const indexPath = join(galleryDir, 'index.md');

    if (existsSync(indexPath) === false) return null;

    const raw = readFileSync(indexPath, 'utf-8');
    const { meta, body } = parseFrontmatter(raw);
    const html = await marked(body);
    const imageFiles = listImages(galleryDir);

    return {
      slug,
      title: meta.title || slug,
      date: meta.date || '',
      type: (meta.type as Gallery['type']) || 'photo',
      location: meta.location || undefined,
      tags: meta.tags ? meta.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      description: meta.description || undefined,
      cover: meta.cover || imageFiles[0] || '',
      imageCount: imageFiles.length,
      images: imageFiles.map((filename) => ({ filename })),
      body: html as string,
    };
  }
}
