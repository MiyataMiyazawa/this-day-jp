import { DayCard } from "./types";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const memoryCache = new Map<string, DayCard>();

function getCacheDir(): string {
  return join(process.cwd(), ".cache");
}

function getJSTDateString(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

export function getTodayKey(): string {
  return getJSTDateString();
}

export async function getCached(key: string): Promise<DayCard | null> {
  if (memoryCache.has(key)) {
    return memoryCache.get(key)!;
  }

  try {
    const filePath = join(getCacheDir(), `${key}.json`);
    const data = await readFile(filePath, "utf-8");
    const card = JSON.parse(data) as DayCard;
    memoryCache.set(key, card);
    return card;
  } catch {
    return null;
  }
}

export async function setCache(key: string, card: DayCard): Promise<void> {
  memoryCache.set(key, card);

  try {
    const dir = getCacheDir();
    await mkdir(dir, { recursive: true });
    const filePath = join(dir, `${key}.json`);
    await writeFile(filePath, JSON.stringify(card, null, 2), "utf-8");
  } catch {
    // File cache is best-effort (won't work on Vercel)
  }
}
