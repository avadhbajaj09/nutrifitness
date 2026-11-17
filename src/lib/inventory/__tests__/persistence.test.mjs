import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(file, mocks = {}) {
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { module, exports: module.exports, Request, Response,
    require: id => {
      if (id in mocks) return mocks[id];
      throw new Error(`Unmocked dependency: ${id}`);
    }, console: { error() {}, warn() {} }, fetch: mocks.fetch,
  });
  return module.exports;
}
const errors = load('src/lib/inventory/errors.ts');

function stockRoute({ failWrite = false } = {}) {
  let writes = 0;
  const db = { rpc() {
    writes++;
    return Promise.resolve({ data: { success: true }, error: failWrite ? { message: 'fixture failure' } : null });
  }, from(table) {
    let mutation = false;
    const query = {
      select() { return query; }, eq() { return query; }, is() { return query; }, or() { return query; },
      update() { mutation = true; writes++; return query; },
      insert() { mutation = true; writes++; return query; },
      upsert() { mutation = true; writes++; return query; },
      maybeSingle() { return Promise.resolve({ data: table === 'products'
        ? { id: '00000000-0000-4000-8000-000000000001', slug: 'fixture' }
        : { id: 'stock', quantity: 2 }, error: null }); },
      then(resolve, reject) { return Promise.resolve({ data: mutation ? null : [],
        error: mutation && failWrite ? { message: 'fixture failure' } : null }).then(resolve, reject); },
    };
    return query;
  } };
  return { route: load('src/app/api/admin/stock/route.ts', {
    'next/server': { NextResponse: { json: (body, init) => new Response(JSON.stringify(body), init) } },
    '@/lib/supabase': { getAdminSupabase: () => db },
    '@/lib/inventory/errors': errors,
    '@/lib/inventory/save': load('src/lib/inventory/save.ts', { '@/lib/supabase': { getAdminSupabase: () => db } }),
    'next/cache': { revalidatePath() {}, revalidateTag() {} },
    '@/lib/delivery/service': { clearDeliveryCache() {} },
  }), writes: () => writes };
}
const request = extra => new Request('http://fixture/api/admin/stock', {
  method: 'POST', body: JSON.stringify({ productId: '00000000-0000-4000-8000-000000000001', quantity: 10, ...extra }),
});

test('actual stock handler rejects a resolved database write failure', async () => {
  const { route, writes } = stockRoute({ failWrite: true });
  const response = await route.POST(request());
  assert.equal(response.status, 500);
  assert.notEqual((await response.json()).success, true);
  assert.equal(writes(), 1, 'stop immediately after first failed write');
});

test('invalid quantities and simultaneous quantity/delta never write', async () => {
  for (const extra of [{ quantity: -1 }, { quantity: 1.5 }, { quantity: null }, { quantity: '10' }, { delta: -1 }, { origin: 'INVALID' }]) {
    const { route, writes } = stockRoute();
    assert.equal((await route.POST(request(extra))).status, 400);
    assert.equal(writes(), 0);
  }
});

test('client propagates HTTP errors instead of treating them as saved', async () => {
  const { checkedFetch } = load('src/lib/inventory/client.ts', {
    fetch: async () => new Response(JSON.stringify({ error: 'Stock modifié ailleurs.' }), { status: 409 }),
  });
  await assert.rejects(checkedFetch('/fixture'), /Stock modifié ailleurs/);
});

test('client propagates network failures', async () => {
  const { checkedFetch } = load('src/lib/inventory/client.ts', {
    fetch: async () => { throw new Error('offline'); },
  });
  await assert.rejects(checkedFetch('/fixture'), /offline/);
});
