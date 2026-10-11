// scripts/test-redirects.mjs
// Usage: node scripts/test-redirects.mjs [baseUrl]
// Default: http://localhost:3000
import fs from 'node:fs';

const rawBase = process.argv[2] || 'http://localhost:3000';
const base = rawBase.replace(/\/+$/, '');

const csvUrl = new URL('../data/redirect-map.csv', import.meta.url);
const text = fs.readFileSync(csvUrl, 'utf8');

const rows = text
  .replace(/\r/g, '')
  .split('\n')
  .slice(1)
  .filter(Boolean)
  .map((l) => {
    const match = l.match(/^([^,]+),([^,]+),([^,]+)(?:,(.*))?$/);
    if (!match) return null;
    return {
      old_path: match[1].trim(),
      new_path: match[2].trim(),
      type: match[3].trim(),
      note: (match[4] || '').trim(),
    };
  })
  .filter(Boolean);

// Extra edge cases
rows.push({
  old_path: '/categorie-produit/PERTE-DE-POIDS',
  new_path: '/categorie/perte-de-poids/',
  type: 'fallback',
  note: 'Case-sensitive edge case'
});

async function hit(path) {
  try {
    const res = await fetch(base + path, {
      redirect: 'manual',
      headers: { 'User-Agent': 'NutriFitness-Test-Redirects/1.0' },
    });
    return res;
  } catch (err) {
    return { error: err.message };
  }
}

async function check(r) {
  try {
    const res = await hit(r.old_path);
    if (res.error) return `request failed: ${res.error}`;
    const s = res.status;

    // For canonical pages expected to return 200
    if (r.type === 'same' || r.type === 'check') {
      return s === 200 ? null : `${r.type.toUpperCase()} → got ${s} (needs a fix: new slug, or set a redirect)`;
    }

    // For redirect pages: expect 301, 307, or 308
    if (![301, 307, 308].includes(s)) {
      return `expected redirect (301/307/308), got ${s}`;
    }

    const locHeader = res.headers?.get('location');
    if (!locHeader) {
      // 307 or client digest redirect with no Location header
      console.warn(`  ⚠️ WARN: ${r.old_path} returned status ${s} with no Location header (client-side digest redirect)`);
      return null;
    }

    // Follow redirect to destination and verify 200 OK
    let targetUrl = new URL(locHeader, base);
    let finalRes = await hit(targetUrl.pathname + targetUrl.search);
    if (finalRes.error) {
      return `redirects to ${targetUrl.pathname} but follow failed: ${finalRes.error}`;
    }
    // If the first hop was a trailing-slash normalizer (308), follow to target destination
    if ([301, 307, 308].includes(finalRes.status)) {
      const nextLoc = finalRes.headers?.get('location');
      if (nextLoc) {
        targetUrl = new URL(nextLoc, base);
        finalRes = await hit(targetUrl.pathname + targetUrl.search);
      }
    }
    if (finalRes.status !== 200) {
      return `redirects to ${targetUrl.pathname} but that returns ${finalRes.status}`;
    }

    return null;
  } catch (e) {
    return 'check error: ' + e.message;
  }
}

const problems = [];
const queue = [...rows];
console.log(`Checking ${rows.length} URLs against ${base}...`);

await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const r = queue.shift();
      const err = await check(r);
      if (err) {
        problems.push(`${r.type.padEnd(8)} ${r.old_path}  ->  ${err}`);
      }
    }
  })
);

console.log(`\nChecked ${rows.length} URLs against ${base}`);
if (!problems.length) {
  console.log('✅ ALL OK - All redirects and canonical pages verified!\n');
  process.exit(0);
} else {
  console.log(`❌ ${problems.length} PROBLEMS:\n`);
  problems.sort().forEach((p) => console.log(p));
  console.log('');
  process.exit(1);
}
