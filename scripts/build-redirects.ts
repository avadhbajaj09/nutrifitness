// Usage: npx tsx scripts/build-redirects.ts data/redirect-map.csv  -> writes src/redirects.json
// CSV columns: old_url,new_url  (paths or full URLs). Detects chains, loops and duplicates. Single 301 only.
import { readFileSync, writeFileSync } from 'node:fs';

const path = (u: string): string => { try { return new URL(u).pathname; } catch { return u.trim(); } };
const norm = (p: string): string => (p.length > 1 && !p.endsWith('/') ? `${p}/` : p);

const file = process.argv[2];
if (!file) { console.error('Provide the CSV path'); process.exit(1); }
const rows = readFileSync(file, 'utf8').split(/\r?\n/).slice(1).filter(Boolean).map(l => l.split(',').map(s => s.trim()));
const map = new Map<string, string>();
const errors: string[] = [];
for (const [o, n] of rows) {
  const from = norm(path(o)), to = norm(path(n));
  if (from === to) continue;
  if (map.has(from) && map.get(from) !== to) errors.push(`Duplicate source with different target: ${from}`);
  map.set(from, to);
}
for (const [from, to] of map) {
  let hops = 0, cur = to; const seen = new Set([from]);
  while (map.has(cur)) { if (seen.has(cur)) { errors.push(`Loop: ${from} -> ... -> ${cur}`); break; } seen.add(cur); cur = map.get(cur)!; hops++; }
  if (hops > 0 && !errors.some(e => e.startsWith('Loop') && e.includes(from))) { errors.push(`Chain (${hops + 1} hops): ${from} -> ${to} ... -> ${cur}. Point it straight to ${cur}`); map.set(from, cur); }
}
writeFileSync('src/redirects.json', JSON.stringify([...map].map(([source, destination]) => ({ source, destination, permanent: true })), null, 2));
console.log(`${map.size} redirects written.`);
if (errors.length) { console.warn('Fixed or flagged:\n' + errors.join('\n')); }
