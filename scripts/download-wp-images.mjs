// scripts/download-wp-images.mjs
import fs from 'node:fs';
import path from 'node:path';

const catalogPath = path.resolve('src/lib/catalog.ts');
const catalogCode = fs.readFileSync(catalogPath, 'utf8');

// Find all unique wp-content URLs
const regex = /https:\/\/nutrifitness\.ch\/wp-content\/uploads\/[^\s"',]+/g;
const matches = [...catalogCode.matchAll(regex)].map(m => m[0]);
const uniqueUrls = [...new Set(matches)];

console.log(`Found ${uniqueUrls.length} unique WordPress image URLs in catalog.ts\n`);

const queue = [...uniqueUrls];
let downloaded = 0;
let failed = 0;
const errors = [];

async function downloadOne(url) {
  try {
    const urlObj = new URL(url);
    const relativePath = decodeURIComponent(urlObj.pathname); // e.g. /wp-content/uploads/2026/10/...
    const targetFile = path.join(process.cwd(), 'public', relativePath);
    const targetDir = path.dirname(targetFile);

    if (fs.existsSync(targetFile) && fs.statSync(targetFile).size > 100) {
      downloaded++;
      return;
    }

    fs.mkdirSync(targetDir, { recursive: true });

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 50) {
      throw new Error('Downloaded file too small (< 50 bytes)');
    }

    fs.writeFileSync(targetFile, buffer);
    downloaded++;
    if (downloaded % 20 === 0 || downloaded === uniqueUrls.length) {
      console.log(`  Progress: ${downloaded}/${uniqueUrls.length} images saved...`);
    }
  } catch (err) {
    failed++;
    errors.push({ url, error: err.message });
    console.error(`  ❌ Failed: ${url} -> ${err.message}`);
  }
}

console.log('Starting concurrent download (concurrency: 8)...');
const CONCURRENCY = 8;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) {
      const url = queue.shift();
      if (url) await downloadOne(url);
    }
  })
);

console.log('\n' + '='.repeat(60));
console.log(`DOWNLOAD COMPLETE`);
console.log(`  Successfully downloaded: ${downloaded}`);
console.log(`  Failed: ${failed}`);
console.log('='.repeat(60) + '\n');

if (errors.length > 0) {
  console.log('Errors encountered:');
  errors.forEach(e => console.log(`  ${e.url} : ${e.error}`));
  process.exit(1);
} else {
  console.log('All 196 images downloaded successfully to public/wp-content/uploads/!');
  process.exit(0);
}
