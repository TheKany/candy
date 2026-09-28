import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clearDashboardCache, loadDashboard, readDashboard, readDashboardSummary, invalidateDashboard } from '../util/accountDashboardCache.ts';

const data = { representativeCard: 17, paid: 2, free: 1, ads: 3, freeUsedToday: false, day: new Date(Date.now()+9*3600000).toISOString().slice(0,10), total: 4, activities: [{ consultation_id: 'private', ordinal: 1, kind: 'one', topic: 'private topic', created_at: '', savedId: null }], hasMore: false, adsAvailable: false, paymentsAvailable: false };
test('shares concurrent and repeated dashboard reads; invalidation fetches again', async () => {
  clearDashboardCache();
  let calls = 0;
  const original = globalThis.fetch;
  globalThis.fetch = async () => { calls++; return Response.json(data); };
  try {
    await Promise.all([loadDashboard('a'), loadDashboard('a')]);
    await loadDashboard('a');
    assert.equal(calls, 1);
    assert.equal(readDashboard('b'), null);
    invalidateDashboard('a');
    await loadDashboard('a');
    assert.equal(calls, 2);
    clearDashboardCache();
    assert.equal(readDashboard('a'), null);
  } finally { globalThis.fetch = original; clearDashboardCache(); }
});
test('persistent summary excludes consultation metadata and is account-scoped', async () => {
  const values = new Map<string,string>();
  const storage = { getItem: (k:string)=>values.get(k)??null, setItem:(k:string,v:string)=>{values.set(k,v);}, removeItem:(k:string)=>{values.delete(k);}, key:(i:number)=>[...values.keys()][i]??null, get length(){return values.size;} };
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
  const original = globalThis.fetch;
  globalThis.fetch = async () => Response.json(data);
  try {
    await loadDashboard('a');
    assert.ok(values.size);
    assert.ok(![...values.values()].join('').includes('private'));
    assert.equal(readDashboardSummary('a')?.paid, 2);
    assert.equal(readDashboardSummary('b'), null);
    clearDashboardCache();
    assert.equal(values.size, 0);
  } finally { globalThis.fetch=original; clearDashboardCache(); Reflect.deleteProperty(globalThis,'localStorage'); }
});
test('expired values refresh and late responses cannot restore a cleared account', async () => {
  clearDashboardCache();
  const original = globalThis.fetch;
  const originalNow = Date.now;
  let now = originalNow();
  Date.now = () => now;
  let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json(data); };
  try {
    await loadDashboard('a');
    now += 61000;
    await loadDashboard('a');
    assert.equal(calls, 2);
    invalidateDashboard('a');
    let release!: (response: Response) => void;
    globalThis.fetch = () => new Promise(resolve => { release = resolve; });
    const request = loadDashboard('a');
    clearDashboardCache();
    release(Response.json(data));
    await assert.rejects(request, /DASHBOARD_CHANGED/);
    assert.equal(readDashboard('a'), null);
  } finally { Date.now = originalNow; globalThis.fetch = original; clearDashboardCache(); }
});
