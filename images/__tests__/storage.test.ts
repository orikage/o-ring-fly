import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync, mkdtempSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { LocalStorageProvider } from "../src/storage";

describe("LocalStorageProvider", () => {
  let testDir: string;
  let storage: LocalStorageProvider;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), "storage-test-"));
    storage = new LocalStorageProvider(testDir);
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  describe("upload()", () => {
    it("can save file to specified path", async () => {
      const data = new TextEncoder().encode("hello world");
      await storage.upload("galleries/gallery-1/photo.jpg", data, "image/jpeg");
      const result = await storage.download("galleries/gallery-1/photo.jpg");
      expect(result).not.toBeNull();
      expect(new TextDecoder().decode(result!)).toBe("hello world");
    });

    it("auto-creates intermediate directories", async () => {
      const data = new TextEncoder().encode("test");
      await storage.upload("galleries/new-gallery/deep/photo.jpg", data, "image/jpeg");
      const result = await storage.download("galleries/new-gallery/deep/photo.jpg");
      expect(result).not.toBeNull();
    });

    it("can overwrite existing file", async () => {
      const data1 = new TextEncoder().encode("original");
      const data2 = new TextEncoder().encode("updated");
      await storage.upload("galleries/g/photo.jpg", data1, "image/jpeg");
      await storage.upload("galleries/g/photo.jpg", data2, "image/jpeg");
      const result = await storage.download("galleries/g/photo.jpg");
      expect(new TextDecoder().decode(result!)).toBe("updated");
    });
  });

  describe("download()", () => {
    it("returns binary data of existing file", async () => {
      const data = new TextEncoder().encode("content");
      await storage.upload("galleries/g/file.txt", data, "text/plain");
      const result = await storage.download("galleries/g/file.txt");
      expect(result).not.toBeNull();
      expect(result instanceof Uint8Array).toBe(true);
    });

    it("returns null for non-existent file", async () => {
      const result = await storage.download("galleries/g/nonexistent.jpg");
      expect(result).toBeNull();
    });
  });

  describe("delete()", () => {
    it("can delete a file", async () => {
      const data = new TextEncoder().encode("to be deleted");
      await storage.upload("galleries/g/delete-me.jpg", data, "image/jpeg");
      await storage.delete("galleries/g/delete-me.jpg");
      const result = await storage.download("galleries/g/delete-me.jpg");
      expect(result).toBeNull();
    });

    it("does not error when deleting non-existent file", async () => {
      await expect(
        storage.delete("galleries/g/nonexistent.jpg")
      ).resolves.toBeUndefined();
    });
  });

  describe("list()", () => {
    it("returns list of keys with given prefix", async () => {
      const data = new TextEncoder().encode("test");
      await storage.upload("galleries/g/photo1.jpg", data, "image/jpeg");
      await storage.upload("galleries/g/photo2.jpg", data, "image/jpeg");
      const keys = await storage.list("galleries/g/");
      expect(keys).toContain("galleries/g/photo1.jpg");
      expect(keys).toContain("galleries/g/photo2.jpg");
      expect(keys.length).toBe(2);
    });

    it("returns empty array for non-existent prefix", async () => {
      const keys = await storage.list("galleries/nonexistent/");
      expect(keys).toEqual([]);
    });

    it("does not recursively include subdirectory files (flat listing)", async () => {
      const data = new TextEncoder().encode("test");
      await storage.upload("galleries/g/photo.jpg", data, "image/jpeg");
      await storage.upload("galleries/g/sub/photo2.jpg", data, "image/jpeg");
      const keys = await storage.list("galleries/g/");
      expect(keys).toContain("galleries/g/photo.jpg");
    });
  });

  describe("exists()", () => {
    it("returns true for existing file", async () => {
      const data = new TextEncoder().encode("test");
      await storage.upload("galleries/g/photo.jpg", data, "image/jpeg");
      const result = await storage.exists("galleries/g/photo.jpg");
      expect(result).toBe(true);
    });

    it("returns false for non-existent file", async () => {
      const result = await storage.exists("galleries/g/nonexistent.jpg");
      expect(result).toBe(false);
    });
  });
});
