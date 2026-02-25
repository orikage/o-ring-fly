/**
 * storage.test.ts
 * t-wada式TDD: LocalStorageとStorageAdapterインターフェースのテスト
 *
 * テスト設計方針:
 * - 実装詳細ではなく振る舞いをテストする
 * - テスト名は仕様として読めるように記述する
 * - 各テストは独立して実行可能にする
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { LocalStorage } from "./storage";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";

const TEST_ROOT = join(import.meta.dir, "__test_storage__");

describe("LocalStorage", () => {
  let storage: LocalStorage;

  beforeEach(() => {
    mkdirSync(TEST_ROOT, { recursive: true });
    storage = new LocalStorage(TEST_ROOT);
  });

  afterEach(() => {
    rmSync(TEST_ROOT, { recursive: true, force: true });
  });

  describe("readFile", () => {
    it("存在するファイルを読み込んだとき、その内容を返す", async () => {
      writeFileSync(join(TEST_ROOT, "hello.txt"), "Hello, World!");
      const result = await storage.readFile("hello.txt");
      expect(result).not.toBeNull();
      expect(result!.toString()).toBe("Hello, World!");
    });

    it("存在しないファイルを読み込んだとき、nullを返す", async () => {
      const result = await storage.readFile("nonexistent.txt");
      expect(result).toBeNull();
    });

    it("パストラバーサル攻撃を防ぐ: ルート外へのアクセスはnullを返す", async () => {
      const result = await storage.readFile("../../etc/passwd");
      expect(result).toBeNull();
    });
  });

  describe("writeFile", () => {
    it("ファイルを書き込んだとき、後から読み込める", async () => {
      await storage.writeFile("test.txt", "test content");
      const result = await storage.readFile("test.txt");
      expect(result!.toString()).toBe("test content");
    });

    it("Bufferデータを書き込んだとき、バイナリとして保存される", async () => {
      const data = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // PNG magic bytes
      await storage.writeFile("image.png", data);
      const result = await storage.readFile("image.png");
      expect(result).not.toBeNull();
      expect(result![0]).toBe(0x89);
    });

    it("サブディレクトリ内のファイルを書き込んだとき、ディレクトリが自動生成される", async () => {
      await storage.writeFile("subdir/nested/file.txt", "nested content");
      const result = await storage.readFile("subdir/nested/file.txt");
      expect(result!.toString()).toBe("nested content");
    });

    it("パストラバーサル攻撃を防ぐ: ルート外への書き込みはエラーになる", async () => {
      await expect(storage.writeFile("../../etc/malicious.txt", "bad")).rejects.toThrow();
    });
  });

  describe("listFiles", () => {
    it("ディレクトリ内のファイル一覧を返す", async () => {
      writeFileSync(join(TEST_ROOT, "a.txt"), "a");
      writeFileSync(join(TEST_ROOT, "b.txt"), "b");
      const files = await storage.listFiles(".");
      expect(files).toContain("a.txt");
      expect(files).toContain("b.txt");
    });

    it("存在しないディレクトリを指定したとき、空配列を返す", async () => {
      const files = await storage.listFiles("nonexistent-dir");
      expect(files).toEqual([]);
    });

    it("サブディレクトリはファイル一覧に含まれない", async () => {
      writeFileSync(join(TEST_ROOT, "file.txt"), "x");
      mkdirSync(join(TEST_ROOT, "subdir"), { recursive: true });
      const files = await storage.listFiles(".");
      expect(files).toContain("file.txt");
      expect(files).not.toContain("subdir");
    });
  });

  describe("listDirectories", () => {
    it("ディレクトリ内のサブディレクトリ一覧を返す", async () => {
      mkdirSync(join(TEST_ROOT, "gallery-a"), { recursive: true });
      mkdirSync(join(TEST_ROOT, "gallery-b"), { recursive: true });
      writeFileSync(join(TEST_ROOT, "ignored.txt"), "x");
      const dirs = await storage.listDirectories(".");
      expect(dirs).toContain("gallery-a");
      expect(dirs).toContain("gallery-b");
      expect(dirs).not.toContain("ignored.txt");
    });

    it("存在しないディレクトリを指定したとき、空配列を返す", async () => {
      const dirs = await storage.listDirectories("nonexistent");
      expect(dirs).toEqual([]);
    });
  });

  describe("exists", () => {
    it("存在するファイルに対してtrueを返す", async () => {
      writeFileSync(join(TEST_ROOT, "exists.txt"), "yes");
      expect(await storage.exists("exists.txt")).toBe(true);
    });

    it("存在しないパスに対してfalseを返す", async () => {
      expect(await storage.exists("does-not-exist.txt")).toBe(false);
    });
  });

  describe("deleteFile", () => {
    it("存在するファイルを削除した後、存在しなくなる", async () => {
      writeFileSync(join(TEST_ROOT, "to-delete.txt"), "bye");
      await storage.deleteFile("to-delete.txt");
      expect(await storage.exists("to-delete.txt")).toBe(false);
    });

    it("存在しないファイルを削除してもエラーにならない", async () => {
      await expect(storage.deleteFile("nonexistent.txt")).resolves.toBeUndefined();
    });
  });
});
