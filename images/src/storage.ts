import {
  readFileSync,
  writeFileSync,
  unlinkSync,
  readdirSync,
  mkdirSync,
  existsSync,
} from 'fs';
import { resolve, dirname, join, relative } from 'path';

export interface StorageProvider {
  upload(key: string, data: Uint8Array, contentType: string): Promise<void>;
  download(key: string): Promise<Uint8Array | null>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
  exists(key: string): Promise<boolean>;
}

export class LocalStorageProvider implements StorageProvider {
  constructor(private readonly rootDir: string) {}

  private resolvePath(key: string): string {
    const resolved = resolve(this.rootDir, key);
    if (!resolved.startsWith(resolve(this.rootDir))) {
      throw new Error(`Invalid key: path traversal detected`);
    }
    return resolved;
  }

  async upload(key: string, data: Uint8Array, _contentType: string): Promise<void> {
    const filePath = this.resolvePath(key);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, data);
  }

  async download(key: string): Promise<Uint8Array | null> {
    const filePath = this.resolvePath(key);
    if (!existsSync(filePath)) return null;
    return new Uint8Array(readFileSync(filePath));
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolvePath(key);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }

  async list(prefix: string): Promise<string[]> {
    const dirPath = this.resolvePath(prefix.endsWith('/') ? prefix.slice(0, -1) : prefix);
    if (!existsSync(dirPath)) return [];
    const entries = readdirSync(dirPath, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile())
      .map((e) => {
        return join(prefix.endsWith('/') ? prefix.slice(0, -1) : prefix, e.name);
      });
  }

  async exists(key: string): Promise<boolean> {
    const filePath = this.resolvePath(key);
    return existsSync(filePath);
  }
}
