import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

export interface Photo {
  id: string;
  filename: string;
  title: string;
  date: string;
  location: string;
  tags: string[];
}

const PHOTOS_FILE = resolve(import.meta.dir, "content", "photos.json");

export function getAllPhotos(): Photo[] {
  if (!existsSync(PHOTOS_FILE)) return [];
  try {
    const raw = readFileSync(PHOTOS_FILE, "utf-8");
    return JSON.parse(raw) as Photo[];
  } catch {
    return [];
  }
}
