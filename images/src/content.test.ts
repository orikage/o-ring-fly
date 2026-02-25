/**
 * content.test.ts
 * t-wada式TDD: GalleryContentのテスト
 *
 * テスト設計方針:
 * - フォルダスキャン・frontmatter解析・画像一覧取得の振る舞いをテスト
 * - ファイルシステムの操作はbeforeEach/afterEachで分離し、テスト間の干渉を防ぐ
 * - テスト名は「〜のとき、〜する」という形式で仕様を表現する
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { GalleryContent } from "./content";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";

const TEST_ROOT = join(import.meta.dir, "__test_galleries__");

const SAMPLE_MD = `---
title: 京都の春
date: 2026-02-24
type: photo
location: 京都
tags: nature,street
description: 嵐山〜祇園の散歩スナップ
cover: DSC0001.jpg
---

嵐山から祇園へ。春の光の中で。
`;

describe("GalleryContent", () => {
  let content: GalleryContent;

  beforeEach(() => {
    mkdirSync(TEST_ROOT, { recursive: true });
    content = new GalleryContent(TEST_ROOT);
  });

  afterEach(() => {
    rmSync(TEST_ROOT, { recursive: true, force: true });
  });

  describe("getAllGalleries()", () => {
    it("ギャラリーディレクトリが空のとき、空配列を返す", async () => {
      const galleries = await content.getAllGalleries();
      expect(galleries).toEqual([]);
    });

    it("index.mdを持つフォルダがあるとき、そのメタデータを返す", async () => {
      mkdirSync(join(TEST_ROOT, "2026-02-kyoto"), { recursive: true });
      writeFileSync(join(TEST_ROOT, "2026-02-kyoto", "index.md"), SAMPLE_MD);

      const galleries = await content.getAllGalleries();
      expect(galleries).toHaveLength(1);
      expect(galleries[0].slug).toBe("2026-02-kyoto");
      expect(galleries[0].title).toBe("京都の春");
      expect(galleries[0].date).toBe("2026-02-24");
      expect(galleries[0].type).toBe("photo");
      expect(galleries[0].location).toBe("京都");
      expect(galleries[0].tags).toEqual(["nature", "street"]);
      expect(galleries[0].description).toBe("嵐山〜祇園の散歩スナップ");
      expect(galleries[0].cover).toBe("DSC0001.jpg");
    });

    it("index.mdを持たないフォルダはスキップされる", async () => {
      mkdirSync(join(TEST_ROOT, "no-index-folder"), { recursive: true });
      const galleries = await content.getAllGalleries();
      expect(galleries).toEqual([]);
    });

    it("複数のギャラリーが日付の降順で返される", async () => {
      mkdirSync(join(TEST_ROOT, "2025-12-tokyo"), { recursive: true });
      writeFileSync(join(TEST_ROOT, "2025-12-tokyo", "index.md"), `---\ntitle: 東京\ndate: 2025-12-01\ntype: photo\ntags: city\n---\n本文`);

      mkdirSync(join(TEST_ROOT, "2026-02-kyoto"), { recursive: true });
      writeFileSync(join(TEST_ROOT, "2026-02-kyoto", "index.md"), SAMPLE_MD);

      const galleries = await content.getAllGalleries();
      expect(galleries).toHaveLength(2);
      expect(galleries[0].slug).toBe("2026-02-kyoto"); // 新しい方が先
      expect(galleries[1].slug).toBe("2025-12-tokyo");
    });

    it("tagsが省略された場合、空配列を返す", async () => {
      mkdirSync(join(TEST_ROOT, "no-tags"), { recursive: true });
      writeFileSync(join(TEST_ROOT, "no-tags", "index.md"), `---\ntitle: タグなし\ndate: 2026-01-01\ntype: photo\n---\n`);
      const galleries = await content.getAllGalleries();
      expect(galleries[0].tags).toEqual([]);
    });
  });

  describe("getGallery(slug)", () => {
    beforeEach(() => {
      mkdirSync(join(TEST_ROOT, "2026-02-kyoto"), { recursive: true });
      writeFileSync(join(TEST_ROOT, "2026-02-kyoto", "index.md"), SAMPLE_MD);
      // 画像ファイルを追加
      writeFileSync(join(TEST_ROOT, "2026-02-kyoto", "DSC0001.jpg"), "fake-image-data");
      writeFileSync(join(TEST_ROOT, "2026-02-kyoto", "DSC0002.jpg"), "fake-image-data");
    });

    it("存在するslugを指定したとき、Galleryオブジェクトを返す", async () => {
      const gallery = await content.getGallery("2026-02-kyoto");
      expect(gallery).not.toBeNull();
      expect(gallery!.slug).toBe("2026-02-kyoto");
      expect(gallery!.title).toBe("京都の春");
    });

    it("Galleryオブジェクトにはbody (HTML)が含まれる", async () => {
      const gallery = await content.getGallery("2026-02-kyoto");
      expect(gallery!.body).toContain("嵐山から祇園へ");
    });

    it("Galleryオブジェクトにはそのフォルダ内の画像ファイル一覧が含まれる", async () => {
      const gallery = await content.getGallery("2026-02-kyoto");
      expect(gallery!.images).toHaveLength(2);
      const filenames = gallery!.images.map((i) => i.filename);
      expect(filenames).toContain("DSC0001.jpg");
      expect(filenames).toContain("DSC0002.jpg");
    });

    it("画像一覧にはjpg/png/webp/gif/avifのみ含まれ、index.mdは含まれない", async () => {
      writeFileSync(join(TEST_ROOT, "2026-02-kyoto", "README.txt"), "ignored");
      writeFileSync(join(TEST_ROOT, "2026-02-kyoto", "photo.png"), "fake");
      const gallery = await content.getGallery("2026-02-kyoto");
      const filenames = gallery!.images.map((i) => i.filename);
      expect(filenames).not.toContain("index.md");
      expect(filenames).not.toContain("README.txt");
      expect(filenames).toContain("photo.png");
    });

    it("存在しないslugを指定したとき、nullを返す", async () => {
      const gallery = await content.getGallery("nonexistent-slug");
      expect(gallery).toBeNull();
    });
  });

  describe("createGallery(slug, meta)", () => {
    it("新しいギャラリーフォルダとindex.mdを作成する", async () => {
      await content.createGallery("2026-03-osaka", {
        title: "大阪の夜",
        date: "2026-03-01",
        type: "photo",
        tags: ["city", "night"],
        description: "道頓堀スナップ",
      });

      const gallery = await content.getGallery("2026-03-osaka");
      expect(gallery).not.toBeNull();
      expect(gallery!.title).toBe("大阪の夜");
      expect(gallery!.tags).toEqual(["city", "night"]);
    });

    it("不正なスラッグ（パストラバーサル等）を指定したとき、エラーをthrowする", async () => {
      await expect(
        content.createGallery("../../etc", { title: "bad", date: "", type: "photo", tags: [] })
      ).rejects.toThrow();
    });

    it("既存のスラッグを指定したとき、エラーをthrowする", async () => {
      mkdirSync(join(TEST_ROOT, "already-exists"), { recursive: true });
      writeFileSync(join(TEST_ROOT, "already-exists", "index.md"), SAMPLE_MD);
      await expect(
        content.createGallery("already-exists", { title: "duplicate", date: "", type: "photo", tags: [] })
      ).rejects.toThrow();
    });
  });

  describe("updateGalleryMeta(slug, meta)", () => {
    beforeEach(async () => {
      mkdirSync(join(TEST_ROOT, "2026-02-kyoto"), { recursive: true });
      writeFileSync(join(TEST_ROOT, "2026-02-kyoto", "index.md"), SAMPLE_MD);
    });

    it("タイトルを更新した後、取得すると新しいタイトルが返される", async () => {
      await content.updateGalleryMeta("2026-02-kyoto", {
        title: "京都の春 (改題)",
        date: "2026-02-24",
        type: "photo",
        tags: ["nature"],
        body: "更新された本文",
      });

      const gallery = await content.getGallery("2026-02-kyoto");
      expect(gallery!.title).toBe("京都の春 (改題)");
    });
  });
});
