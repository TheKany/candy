import assert from 'node:assert/strict';
import test from 'node:test';
import { recordTarotStart } from '../util/recordTarotStart.ts';

test('records a start without sending question text and keeps the request alive across navigation', async () => {
  const original = globalThis.fetch;
  const calls: unknown[][] = [];
  globalThis.fetch = async (...args) => { calls.push(args); return new Response('{}'); };
  try {
    await recordTarotStart();
    assert.deepEqual(calls, [['/api/countUsers', { method: 'POST', keepalive: true }]]);
  } finally { globalThis.fetch = original; }
});
