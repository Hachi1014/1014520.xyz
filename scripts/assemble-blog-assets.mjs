import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const section of ['blog', 'explore', 'thoughts', 'daily']) {
  const entries = JSON.parse(await readFile(path.join(root, 'content', section, 'media.generated.json'), 'utf8'));
  const target = path.join(root, 'public', section, 'assets');
  await mkdir(target, { recursive: true });
  let restored = 0;
  for (const entry of entries) {
    if (path.basename(entry.name) !== entry.name || entry.parts.some(part => !/^[a-f0-9]{64}\.bin$/.test(part))) throw new Error('Invalid media path');
    // Verify the ready asset before reading and reassembling transport chunks.
    const file = path.join(target, entry.name);
    try {
      const existing = await readFile(file);
      if (existing.length === entry.size && createHash('sha256').update(existing).digest('hex') === entry.sha256) continue;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    const buffers = await Promise.all(entry.parts.map(part => readFile(path.join(root, 'content', section, 'media-parts', part))));
    const data = Buffer.concat(buffers);
    if (data.length !== entry.size || createHash('sha256').update(data).digest('hex') !== entry.sha256) throw new Error(`Media integrity check failed: ${entry.name}`);
    await writeFile(file, data);
    restored++;
  }
  console.log(`Verified ${entries.length} ${section} media files; restored ${restored}, reused ${entries.length - restored}.`);
}
