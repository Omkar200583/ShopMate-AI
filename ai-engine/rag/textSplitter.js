/** Splits text into overlapping chunks, preferring to cut at paragraph or sentence ends. */
export function splitText(text, { chunkSize = 500, overlap = 50 } = {}) {
  const clean = String(text ?? '').replace(/\r\n/g, '\n').trim();
  if (!clean) return [];
  if (overlap >= chunkSize) throw new Error('overlap must be smaller than chunkSize');

  const chunks = [];
  let start = 0;
  while (start < clean.length) {
    let end = Math.min(start + chunkSize, clean.length);
    if (end < clean.length) {
      const window = clean.slice(start, end);
      const cut = Math.max(window.lastIndexOf('\n\n'), window.lastIndexOf('. '), window.lastIndexOf('\n'));
      if (cut > chunkSize * 0.5) end = start + cut + 1;
    }
    const piece = clean.slice(start, end).trim();
    if (piece) chunks.push(piece);
    if (end >= clean.length) break;
    start = Math.max(end - overlap, start + 1);
  }
  return chunks;
}
