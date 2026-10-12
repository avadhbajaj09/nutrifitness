import http from 'http';

interface Failure {
  url: string;
  reason: string;
}

const PORT = process.env.PORT || 3000;
const BASE_HOST = 'nutrifitness.ch';
const LOCAL_ORIGIN = `http://localhost:${PORT}`;

function fetchText(requestUrl: string): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    // Parse path from URL
    const parsed = new URL(requestUrl);
    const path = parsed.pathname + parsed.search;

    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path,
      method: 'GET',
      headers: {
        Host: BASE_HOST,
        Cookie: 'nf_maintenance_bypass=true',
        'User-Agent': 'SitemapGuard/1.0',
      },
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        resolve({
          status: res.statusCode || 0,
          headers: res.headers,
          body,
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function extractTags(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}>([^<]+)<\\/${tag}>`, 'gi');
  const matches: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(xml)) !== null) {
    matches.push(m[1].trim());
  }
  return matches;
}

function extractCanonical(html: string): string | null {
  const match = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    || html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  return match ? match[1].trim() : null;
}

function hasNoindexMeta(html: string): boolean {
  return /<meta[^>]*content=["'][^"']*noindex[^"']*["']/i.test(html) ||
         /<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
}

async function main() {
  console.log(`[Sitemap Guard] Checking sitemaps on ${LOCAL_ORIGIN} ...`);

  // 1. Fetch main sitemap index
  let indexRes;
  try {
    indexRes = await fetchText(`${LOCAL_ORIGIN}/sitemap.xml`);
  } catch (err: any) {
    console.error(`[Sitemap Guard] Could not connect to local server at ${LOCAL_ORIGIN}. Make sure "next start -p ${PORT}" is running!`);
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  if (indexRes.status !== 200) {
    console.error(`[Sitemap Guard] /sitemap.xml returned HTTP ${indexRes.status}`);
    process.exit(1);
  }

  let subSitemaps = extractTags(indexRes.body, 'loc');
  // If no sitemap index tags found, check for url tags directly
  let allUrls: string[] = [];

  if (subSitemaps.length > 0 && indexRes.body.includes('<sitemap>')) {
    console.log(`[Sitemap Guard] Found ${subSitemaps.length} sub-sitemaps:`, subSitemaps);
    for (const sub of subSitemaps) {
      const res = await fetchText(sub.replace(/^https?:\/\/[^\/]+/, LOCAL_ORIGIN));
      if (res.status !== 200) {
        console.error(`[Sitemap Guard] Sub-sitemap ${sub} returned HTTP ${res.status}`);
        process.exit(1);
      }
      const locs = extractTags(res.body, 'loc');
      console.log(`  -> ${sub}: ${locs.length} URLs`);
      allUrls.push(...locs);
    }
  } else {
    allUrls = extractTags(indexRes.body, 'loc');
  }

  console.log(`\n[Sitemap Guard] Total URLs to verify: ${allUrls.length}`);

  let pass200Count = 0;
  const failures: Failure[] = [];

  // Concurrency batch runner
  const CONCURRENCY = 10;
  for (let i = 0; i < allUrls.length; i += CONCURRENCY) {
    const chunk = allUrls.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      chunk.map(async (targetUrl) => {
        try {
          const res = await fetchText(targetUrl.replace(/^https?:\/\/[^\/]+/, LOCAL_ORIGIN));
          return { targetUrl, res, error: null };
        } catch (err: any) {
          return { targetUrl, res: null, error: err.message };
        }
      })
    );

    for (const { targetUrl, res, error } of results) {
      if (error || !res) {
        failures.push({ url: targetUrl, reason: `Network error: ${error}` });
        continue;
      }

      // 1. Status 200
      if (res.status !== 200) {
        failures.push({ url: targetUrl, reason: `Expected HTTP 200, got ${res.status} (Redirect or Error)` });
        continue;
      }

      // 2. No redirect header
      if (res.headers.location) {
        failures.push({ url: targetUrl, reason: `Unexpected redirect to: ${res.headers.location}` });
        continue;
      }

      // 3. No noindex header
      const xRobots = res.headers['x-robots-tag'] as string | undefined;
      if (xRobots && xRobots.toLowerCase().includes('noindex')) {
        failures.push({ url: targetUrl, reason: `X-Robots-Tag header contains noindex: "${xRobots}"` });
        continue;
      }

      // 4. No noindex meta tag
      if (hasNoindexMeta(res.body)) {
        failures.push({ url: targetUrl, reason: 'HTML contains <meta name="robots" content="noindex">' });
        continue;
      }

      // 5. Canonical equals targetUrl
      const canonical = extractCanonical(res.body);
      if (!canonical) {
        failures.push({ url: targetUrl, reason: 'Missing canonical <link rel="canonical">' });
        continue;
      }

      // Normalize trailing slash comparison
      let normCanonical = canonical.trim().replace(/\/+$/, '');
      if (normCanonical.startsWith('/')) {
        normCanonical = `https://${BASE_HOST}${normCanonical}`;
      }
      const normTarget = targetUrl.trim().replace(/\/+$/, '');
      if (normCanonical !== normTarget) {
        failures.push({ url: targetUrl, reason: `Canonical mismatch: expected "${targetUrl}", found "${canonical}"` });
        continue;
      }

      pass200Count++;
    }

    process.stdout.write(`\r[Sitemap Guard] Verified ${Math.min(i + CONCURRENCY, allUrls.length)} / ${allUrls.length} ...`);
  }

  console.log('\n\n=== SITEMAP GUARD REPORT ===');
  console.log(`Total URLs Checked : ${allUrls.length}`);
  console.log(`Passed (200 & Valid): ${pass200Count}`);
  console.log(`Failures           : ${failures.length}`);

  if (failures.length > 0) {
    console.error('\nFAILURE DETAILS:');
    for (const f of failures) {
      console.error(`- ${f.url} => ${f.reason}`);
    }
    console.error('\nResult: FAILED');
    process.exit(1);
  } else {
    console.log('\nResult: ALL SITEMAP CHECKS PASSED (0 Failures)');
    process.exit(0);
  }
}

main();
