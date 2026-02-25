/**
 * storage.ts
 * ストレージ抽象化レイヤー
 *
 * 現在: LocalStorage (ファイルシステム)
 * 将来: R2Storage (Cloudflare R2) への差し替えを想定
 *
 * インターフェース設計により、上位レイヤーはストレージの実装に依存しない。
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, rmSync, statSync } from "fs";
import { resolve, join, dirname } from "path";

/**
 * ストレージアダプターインターフェース
 * LocalStorage / R2Storage ともにこのインターフェースを実装する
 */
export interface StorageAdapter {
  readFile(path: string): Promise<Buffer | null>;
  writeFile(path: string, data: Buffer | string): Promise<void>;
  listFiles(dir: string): Promise<string[]>;
  listDirectories(dir: string): Promise<string[]>;
  exists(path: string): Promise<boolean>;
  deleteFile(path: string): Promise<void>;
}

/**
 * LocalStorage — ファイルシステムベースのストレージ実装
 */
export class LocalStorage implements StorageAdapter {
  private root: string;

  constructor(root: string) {
    this.root = resolve(root);
  }

  /**
   * ルートディレクトリからの相対パスを安全な絶対パスに解決する
   * パストラバーサル攻撃を防ぐ
   */
  private resolveSafe(relativePath: string): string | null {
    const resolved = resolve(this.root, relativePath);
    if (!resolved.startsWith(this.root + "/") && resolved !== this.root) {
      return null;
    }
    return resolved;
  }

  async readFile(path: string): Promise<Buffer | null> {
    const fullPath = this.resolveSafe(path);
    if (!fullPath) return null;
    if (!existsSync(fullPath)) return null;
    return readFileSync(fullPath);
  }

  async writeFile(path: string, data: Buffer | string): Promise<void> {
    const fullPath = this.resolveSafe(path);
    if (!fullPath) throw new Error(`パストラバーサルが検出されました: ${path}`);
    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, data);
  }

  async listFiles(dir: string): Promise<string[]> {
    const fullPath = this.resolveSafe(dir);
    if (!fullPath || !existsSync(fullPath)) return [];
    try {
      return readdirSync(fullPath).filter((name) => {
        const itemPath = join(fullPath, name);
        return existsSync(itemPath) && statSync(itemPath).isFile();
      });
    } catch {
      return [];
    }
  }

  async listDirectories(dir: string): Promise<string[]> {
    const fullPath = this.resolveSafe(dir);
    if (!fullPath || !existsSync(fullPath)) return [];
    try {
      return readdirSync(fullPath).filter((name) => {
        const itemPath = join(fullPath, name);
        return existsSync(itemPath) && statSync(itemPath).isDirectory();
      });
    } catch {
      return [];
    }
  }

  async exists(path: string): Promise<boolean> {
    const fullPath = this.resolveSafe(path);
    if (!fullPath) return false;
    return existsSync(fullPath);
  }

  async deleteFile(path: string): Promise<void> {
    const fullPath = this.resolveSafe(path);
    if (!fullPath) return;
    if (!existsSync(fullPath)) return;
    rmSync(fullPath);
  }
}
