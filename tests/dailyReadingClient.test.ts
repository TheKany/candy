import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchDailyReading } from '../util/dailyReadingClient.ts';
import { useDailyReadingStore } from '../store/useDailyReadingStore.ts';
const result = {date:'2026-09-29',card:{card_id:0,name_ko:'바보',name_en:'The Fool',arcana:'major',suit:null,rank:'0',upright_keywords:[],reversed_keywords:[],upright_one_line:'새로운 시작',reversed_one_line:''},reading:{energy:75,headline:'작게 시작하세요.',interpretation:'준비할 수 있는 것부터 확인하고 작은 시도를 해보세요.',helpfulAction:'새로운 길을 걸어보세요.',cautionAction:'준비 없이 약속하지 마세요.'}} as const;
test('same draw shares one request; failures can retry and mismatched cards fail',async()=>{
  const original=globalThis.fetch;
  let calls=0;
  globalThis.fetch=async()=>{calls++;return new Response(JSON.stringify(result),{status:200});};
  try {
    const [a,b]=await Promise.all([fetchDailyReading('one',0),fetchDailyReading('one',0)]);
    assert.equal(calls,1);assert.deepEqual(a,b);assert.equal(a.card.card_id,0);
    globalThis.fetch=async()=>new Response(JSON.stringify({code:'quota'}),{status:429});
    await assert.rejects(fetchDailyReading('retry',0),{code:'quota'});
    globalThis.fetch=async()=>new Response(JSON.stringify(result));
    assert.equal((await fetchDailyReading('retry',0)).reading.energy,75);
    await assert.rejects(fetchDailyReading('wrong-card',1),{code:'incomplete'});
  } finally {globalThis.fetch=original;}
});
test('a late result never replaces a newer draw',()=>{
  useDailyReadingStore.setState({drawId:'new',cardId:0,result:null});
  useDailyReadingStore.getState().complete('old',JSON.parse(JSON.stringify(result)));
  assert.equal(useDailyReadingStore.getState().result,null);
  useDailyReadingStore.getState().complete('new',JSON.parse(JSON.stringify(result)));
  assert.equal(useDailyReadingStore.getState().result?.reading.energy,75);
});
