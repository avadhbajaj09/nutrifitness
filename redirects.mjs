// redirects.mjs — builds Next.js redirects from data/redirect-map.csv
import fs from 'node:fs';
import path from 'node:path';

const csvPath = path.resolve(process.cwd(), 'data/redirect-map.csv');

function parseCsv(text) {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^([^,]+),([^,]+),([^,]+)(?:,(.*))?$/);
      if (!match) return null;
      return {
        old_path: match[1].trim(),
        new_path: match[2].trim(),
        type: match[3].trim(),
        note: (match[4] || '').trim(),
      };
    })
    .filter(Boolean);
}

export function getRedirects() {
  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));

  // Rows with type "same" or "check" with identical source & dest are NOT redirected
  const explicit = [];
  for (const r of rows) {
    if (!['exact', 'fallback', 'guess'].includes(r.type)) continue;
    if (r.old_path === r.new_path) continue;

    explicit.push({
      source: r.old_path,
      destination: r.new_path,
      permanent: true,
    });

    // Also support source without trailing slash to prevent a 2-hop chain via middleware
    if (r.old_path.length > 1 && r.old_path.endsWith('/')) {
      explicit.push({
        source: r.old_path.slice(0, -1),
        destination: r.new_path,
        permanent: true,
      });
    }
  }

  // Safety nets for anything not listed above (specific rules above always win)
  const patterns = [
    { source: '/etiquette-produit/:slug*', destination: '/boutique/', permanent: true },
    { source: '/tag/:slug*', destination: '/blog/', permanent: true },
    { source: '/category/:slug*', destination: '/blog/', permanent: true },
    { source: '/author/:slug*', destination: '/a-propos/', permanent: true },
    { source: '/brand/:slug*', destination: '/marques/', permanent: true },
    { source: '/categorie-produit/:path*', destination: '/boutique/', permanent: true },
    // Local SEO creatine city landings -> /categorie/creatine/
    { source: '/produit-creatine:slug*', destination: '/categorie/creatine/', permanent: true },
    // Legacy sports nutrition local pages -> /boutique-geneve/
    { source: '/alimentation-nutrition-sportive:slug*', destination: '/boutique-geneve/', permanent: true },
    // Legacy dietary supplements local pages (excluding /complements-alimentaires-geneve/) -> /boutique-geneve/
    { source: '/complements-alimentaires-:slug((?!geneve).*)', destination: '/boutique-geneve/', permanent: true },
    // Bare product directory route
    { source: '/produit', destination: '/boutique/', permanent: true },
    { source: '/produit/', destination: '/boutique/', permanent: true },
    // Old WordPress search: /?s=whey -> /boutique/?q=whey
    {
      source: '/',
      has: [{ type: 'query', key: 's', value: '(?<s>.+)' }],
      destination: '/boutique/?q=:s',
      permanent: true,
    },
  ];

  // Also ensure /my-account (with and without trailing slash) is cleanly redirected to /compte/
  const accountRedirects = [
    { source: '/my-account', destination: '/compte/', permanent: true },
    { source: '/my-account/', destination: '/compte/', permanent: true },
  ];

  const allRules = [...accountRedirects, ...explicit, ...patterns];

  // Build a lookup map of explicit redirects to detect chains (A -> B -> C)
  const directMap = new Map();
  for (const r of explicit) {
    directMap.set(r.source, r.destination);
  }

  const finalRules = [];
  const seenSources = new Set();

  for (const rule of allRules) {
    let dest = rule.destination;
    const src = rule.source;

    // Brand pages: /marque/... must NOT be redirected unless the slug differs
    if (src.startsWith('/marque/') && src === dest) {
      continue;
    }

    // Drop self-redirects
    if (src === dest) {
      console.warn(`[redirects] Dropping self-redirect: ${src} -> ${dest}`);
      continue;
    }

    // Resolve any redirect chains (A -> B -> C)
    let hops = 0;
    while (directMap.has(dest) && hops < 10) {
      const nextDest = directMap.get(dest);
      if (nextDest === dest || nextDest === src) break;
      console.warn(`[redirects] Flattening chain: ${src} -> ${dest} -> ${nextDest}`);
      dest = nextDest;
      hops++;
    }

    const uniqueKey = src + JSON.stringify(rule.has ?? '');
    if (seenSources.has(uniqueKey)) {
      continue;
    }
    seenSources.add(uniqueKey);

    finalRules.push({
      ...rule,
      destination: dest,
    });
  }

  return finalRules;
}
