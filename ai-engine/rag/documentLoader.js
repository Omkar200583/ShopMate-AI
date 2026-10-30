import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ALLOWED = new Set(['.md', '.txt']);

/** Loads every .md/.txt file in a folder (not recursive) -> [{ source, text }] */
export async function loadDocuments(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const docs = [];
  for (const entry of entries) {
    if (!entry.isFile() || !ALLOWED.has(path.extname(entry.name).toLowerCase())) continue;
    const text = await readFile(path.join(dir, entry.name), 'utf8');
    if (text.trim()) docs.push({ source: entry.name, text });
  }
  return docs;
}
