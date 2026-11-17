/**
 * Regression check for credentials accidentally baked into client bundles or docs.
 * This deliberately scans likely leak locations, not Git history or real env files.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const files: string[] = [];
function walk(folder: string) {
  if (!fs.existsSync(folder)) return;
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const full = path.join(folder, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(full);
  }
}
walk('src');
files.push('DELIVERY_ENGINE.md');
const violations: string[] = [];
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  if (/const\s+(?:ADMIN|OMAR)_PASSWORD\s*=\s*['"][^'"]+['"]/.test(source))
    violations.push(file + ': browser-embedded administrator password');
  if (/const\s+validSecrets\s*=\s*\[/.test(source))
    violations.push(file + ': static maintenance bypass password list');
  if (/const\s+OMAR_PASSWORD\s*=\s*process\.env\.[^\n]+\|\|\s*['"]/.test(source))
    violations.push(file + ': fallback warehouse password');
  if (/secret\s*!==\s*['"][^'"]+['"]\s*&&/.test(source))
    violations.push(file + ': hardcoded revalidation secret fallback');
  if (file === 'DELIVERY_ENGINE.md' && /Accessible with administrator credentials \(/.test(source))
    violations.push(file + ': publicly documented administrator credentials');
}
assert.deepEqual(violations, [], violations.join('\n'));
console.log('Credential source hygiene check passed for ' + files.length + ' files.');
