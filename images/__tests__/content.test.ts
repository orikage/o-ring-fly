import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  GalleryContentManager,
  type Gallery,
  type GalleryMeta,
} from '../src/content';

describe('GalleryContentManager', () => {
  let testDir: string;
  let manager: GalleryContentManager;

  const createGallery = (
    slug: string,
    frontmatter: string,
    body = '',
    images: string[] = []
  ) => {
    const galleryDir = join(testDir, slug);
    mkdirSync(galleryDir, { recursive: true });
    const md = `---\n${frontmatter}\n---\n${body}`;
    writeFileSync(join(galleryDir, 'index.md'), md, 'utf-8');
    for (const img of images) {
      writeFileSync(join(galleryDir, img), 'binary-data');
    }
  };

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'content-test-'));
    manager = new GalleryContentManager(testDir);
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('getAllGalleries()', () => {
    it('returns empty array when no galleries exist', () => {
      const galleries = manager.getAllGalleries();
      expect(galleries).toEqual([]);
    });

    it('returns metadata for a single gallery', () => {
      createGallery(
        '2026-02-kyoto',
        'title: Kyoto Spring\ndate: 2026-02-24\ntype: photo\ntags: nature,street\ncover: DSC0001.jpg'
      );

      const galleries = manager.getAllGalleries();
      expect(galleries.length).toBe(1);
      expect(galleries[0].slug).toBe('2026-02-kyoto');
      expect(galleries[0].title).toBe('Kyoto Spring');
      expect(galleries[0].date).toBe('2026-02-24');
      expect(galleries[0].type).toBe('photo');
      expect(galleries[0].tags).toEqual(['nature', 'street']);
      expect(galleries[0].cover).toBe('DSC0001.jpg');
    });

    it('returns multiple galleries sorted by date descending', () => {
      createGallery('2025-01-old', 'title: Old\ndate: 2025-01-01\ncover: a.jpg');
      createGallery('2026-02-new', 'title: New\ndate: 2026-02-24\ncover: b.jpg');
      createGallery('2025-06-mid', 'title: Mid\ndate: 2025-06-15\ncover: c.jpg');

      const galleries = manager.getAllGalleries();
      expect(galleries[0].date).toBe('2026-02-24');
      expect(galleries[1].date).toBe('2025-06-15');
      expect(galleries[2].date).toBe('2025-01-01');
    });

    it('skips directories without index.md', () => {
      mkdirSync(join(testDir, 'no-index'), { recursive: true });
      createGallery('valid', 'title: Valid\ndate: 2026-01-01\ncover: a.jpg');

      const galleries = manager.getAllGalleries();
      expect(galleries.length).toBe(1);
      expect(galleries[0].slug).toBe('valid');
    });

    it('includes image count in imageCount', () => {
      createGallery(
        'with-images',
        'title: Photos\ndate: 2026-01-01\ncover: DSC001.jpg',
        '',
        ['DSC001.jpg', 'DSC002.jpg', 'DSC003.jpg']
      );

      const galleries = manager.getAllGalleries();
      expect(galleries[0].imageCount).toBe(3);
    });
  });

  describe('getGallery()', () => {
    it('returns gallery data for an existing gallery', async () => {
      createGallery(
        '2026-02-kyoto',
        'title: Kyoto Spring\ndate: 2026-02-24\ntype: photo\nlocation: Kyoto\ntags: nature\ncover: DSC0001.jpg\ndescription: Snap walk',
        '## Introduction\nThis is a description.',
        ['DSC0001.jpg', 'DSC0002.jpg']
      );

      const gallery = await manager.getGallery('2026-02-kyoto');
      expect(gallery).not.toBeNull();
      expect(gallery!.slug).toBe('2026-02-kyoto');
      expect(gallery!.title).toBe('Kyoto Spring');
      expect(gallery!.location).toBe('Kyoto');
      expect(gallery!.description).toBe('Snap walk');
      expect(gallery!.images.length).toBe(2);
      expect(gallery!.body).toContain('<h2');
      expect(gallery!.body).toContain('Introduction');
    });

    it('returns null for non-existent gallery', async () => {
      const gallery = await manager.getGallery('nonexistent');
      expect(gallery).toBeNull();
    });

    it('image list includes all files except index.md', async () => {
      createGallery(
        'test',
        'title: Test\ndate: 2026-01-01\ncover: a.jpg',
        '',
        ['a.jpg', 'b.png', 'c.webp']
      );

      const gallery = await manager.getGallery('test');
      const filenames = gallery!.images.map((i) => i.filename);
      expect(filenames).toContain('a.jpg');
      expect(filenames).toContain('b.png');
      expect(filenames).toContain('c.webp');
      expect(filenames).not.toContain('index.md');
    });

    it('defaults type to photo when not specified', async () => {
      createGallery('no-type', 'title: Test\ndate: 2026-01-01\ncover: a.jpg');

      const gallery = await manager.getGallery('no-type');
      expect(gallery!.type).toBe('photo');
    });
  });

  describe('parseFrontmatter() (internal via getGallery)', () => {
    it('parses tags as comma-separated array', async () => {
      createGallery(
        'tags-test',
        'title: T\ndate: 2026-01-01\ncover: a.jpg\ntags: nature, street, film'
      );
      const gallery = await manager.getGallery('tags-test');
      expect(gallery!.tags).toEqual(['nature', 'street', 'film']);
    });

    it('returns empty array when tags are empty', async () => {
      createGallery('no-tags', 'title: T\ndate: 2026-01-01\ncover: a.jpg');
      const gallery = await manager.getGallery('no-tags');
      expect(gallery!.tags).toEqual([]);
    });
  });
});