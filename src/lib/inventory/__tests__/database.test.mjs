/** Isolated PostgreSQL integration tests. Never reads .env or production URLs. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import pg from 'pg';
import { randomUUID } from 'node:crypto';

const config = { host: '127.0.0.1', port: 55439, database: 'postgres' };
const database = `nutrifitness_inventory_test_${randomUUID().replaceAll('-', '')}`;
const admin = new pg.Client(config);
await admin.connect();
await admin.query(`CREATE DATABASE ${database}`);
const c = new pg.Client({ ...config, database });
await c.connect();
const migration = 'supabase/migrations/' + fs.readdirSync('supabase/migrations').find(f => f.endsWith('_atomic_inventory_saves.sql'));
try {
  await c.query(fs.readFileSync('src/lib/inventory/__tests__/schema.sql', 'utf8'));
  for (const file of ['supabase/migrations/005_stock_triggers_and_atomic_admin.sql', 'supabase/migrations/006_harden_admin_variant_skus.sql', migration, migration]) {
    await c.query(fs.readFileSync(file, 'utf8'));
  }
  const save = async (payload, mode = 'patch', connection = c) => (await connection.query(
    'select public.save_inventory_product($1::jsonb,$2,$3) result', [JSON.stringify(payload), mode, 'fixture-admin'],
  )).rows[0].result;
  const product = async (variants = undefined) => save({ name: 'Fixture', slug: `fixture-${randomUUID()}`,
    stock_geneva: 4, stock_portugal: 3, ...(variants ? { variants } : {}),
  }, 'full');
  const snapshot = async id => (await c.query('select * from products where id=$1', [id])).rows[0];
  const stock = async id => (await c.query('select * from product_stock where product_id=$1 order by origin_id,variant_id', [id])).rows;
  const edit = async (id, extra) => save({ id, expected_updated_at: (await snapshot(id)).updated_at.toISOString(), ...extra });
  // PostgreSQL preserves microseconds; API clients must round-trip the original JSON string.
  const token = async id => (await c.query('select to_jsonb(updated_at) token from products where id=$1', [id])).rows[0].token;
  const patch = async (id, extra) => save({ id, expected_updated_at: await token(id), ...extra });

  await test('migration is repeatable and mutating RPC is not executable by anon', async () => {
    const r = await c.query("select has_function_privilege('anon','public.save_inventory_product(jsonb,text,text)','EXECUTE') allowed");
    assert.equal(r.rows[0].allowed, false);
  });
  await test('simple stock persists zero and omitted fields preserve the other warehouse', async () => {
    const p = await product();
    await patch(p.id, { stock_geneva: 0 });
    const row = await snapshot(p.id);
    assert.equal(row.stock_geneva, 0);
    assert.equal(row.stock_portugal, 3);
    await save({ id: p.id, expected_updated_at: await token(p.id), name: 'New title' }, 'full');
    assert.deepEqual((await stock(p.id)).map(s => s.quantity), [0, 3]);
  });
  await test('stale full product save rejects instead of overwriting newer quantities', async () => {
    const p = await product();
    const old = await token(p.id);
    await patch(p.id, { stock_geneva: 10 });
    await assert.rejects(save({ id: p.id, expected_updated_at: old, name: 'Stale', stock_geneva: 4 }, 'full'), e => e.code === '40001');
    assert.equal((await snapshot(p.id)).stock_geneva, 10);
  });
  await test('location changes preserve counted quantities in both warehouses', async () => {
    const p = await product();
    const before = (await stock(p.id)).map(s => [s.origin_id, s.quantity]);
    await patch(p.id, { main_location: 'PORTUGAL' });
    assert.deepEqual((await stock(p.id)).map(s => [s.origin_id, s.quantity]), before);
  });
  await test('variable stock must be edited by variant and totals derive from variants', async () => {
    const p = await product([{ sku: `v-${randomUUID()}`, flavor: 'Vanille', stock_geneva: 2, stock_portugal: 3 }]);
    await assert.rejects(patch(p.id, { stock_geneva: 20 }), e => e.code === '22023');
    const v = (await c.query('select id from product_variants where product_id=$1', [p.id])).rows[0];
    await patch(p.id, { variants: [{ id: v.id, stock_geneva: 8 }] });
    assert.equal((await snapshot(p.id)).stock_geneva, 8);
    assert.equal((await snapshot(p.id)).stock_portugal, 3);
  });
  await test('invalid quantities and foreign variant IDs fail without changing stock', async () => {
    const p = await product();
    for (const value of [-1, 0.5, '8', null]) await assert.rejects(patch(p.id, { stock_geneva: value }), e => e.code === '22023');
    await assert.rejects(patch(p.id, { variants: [{ id: randomUUID(), stock_geneva: 2 }] }), e => e.code === '22023');
    assert.equal((await snapshot(p.id)).stock_geneva, 4);
  });
  await test('stock audit records actor/source/old/new and cannot silently fail', async () => {
    const p = await product();
    await patch(p.id, { stock_geneva: 9 });
    const logs = (await c.query("select * from stock_change_log where product_id=$1 and old_quantity=4 and new_quantity=9", [p.id])).rows;
    assert.equal(logs.length, 1);
    assert.equal(logs[0].actor, 'fixture-admin');
    assert.equal(logs[0].source, 'admin_patch');
    await c.query("CREATE FUNCTION reject_fixture_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'injected audit failure'; END $$; CREATE TRIGGER reject_fixture_audit BEFORE INSERT ON stock_change_log FOR EACH ROW EXECUTE FUNCTION reject_fixture_audit();");
    try {
      await assert.rejects(patch(p.id, { name: 'Should rollback', stock_geneva: 20 }), /injected audit failure/);
      assert.equal((await snapshot(p.id)).stock_geneva, 9);
      assert.equal((await snapshot(p.id)).name, 'Fixture');
    } finally { await c.query('DROP TRIGGER reject_fixture_audit ON stock_change_log; DROP FUNCTION reject_fixture_audit()'); }
  });
  await test('concurrent saves of the same snapshot allow exactly one writer', async () => {
    const p = await product();
    const expected_updated_at = await token(p.id);
    const other = new pg.Client({ ...config, database }); await other.connect();
    try {
      const results = await Promise.allSettled([save({ id: p.id, expected_updated_at, stock_geneva: 10 }), save({ id: p.id, expected_updated_at, stock_geneva: 11 }, 'patch', other)]);
      assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
      assert.equal(results.find(r => r.status === 'rejected').reason.code, '40001');
    } finally { await other.end(); }
  });
  await test('atomic deltas change canonical rows once and duplicate keys cannot change payload', async () => {
    const p = await product();
    const payload = { productId: p.id, delta: -2, origin: 'GENEVA', idempotency_key: randomUUID() };
    const adjust = async body => (await c.query('select public.adjust_inventory($1::jsonb,$2) result', [JSON.stringify(body), 'fixture-pos'])).rows[0].result;
    const first = await adjust(payload);
    assert.equal(first.stockGeneva, 2);
    assert.deepEqual(await adjust(payload), first);
    assert.equal((await snapshot(p.id)).stock_geneva, 2);
    await assert.rejects(adjust({ ...payload, delta: -1 }), e => e.code === '22023');
    await assert.rejects(adjust({ ...payload, idempotency_key: randomUUID(), delta: -3 }), e => e.code === '22023');
    assert.equal((await snapshot(p.id)).stock_geneva, 2);
  });
  await test('absolute stock API requires editor snapshot and rejects missing variant', async () => {
    const p = await product([{ sku: `v-${randomUUID()}`, flavor: 'Chocolat', stock_geneva: 2 }]);
    await assert.rejects(c.query('select public.adjust_inventory($1::jsonb,$2)', [JSON.stringify({ productId:p.id,quantity:8 }), 'fixture']), e => e.code === '40001');
    await assert.rejects(c.query('select public.adjust_inventory($1::jsonb,$2)', [JSON.stringify({ productId:p.id,quantity:8,expected_updated_at:await token(p.id) }), 'fixture']), e => e.code === '22023');
  });

} finally {
  await c.end();
  await admin.query(`DROP DATABASE ${database}`);
  await admin.end();
}
