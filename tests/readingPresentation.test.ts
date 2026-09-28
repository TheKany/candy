import test from 'node:test';
import assert from 'node:assert/strict';
import { presentReading, groupActivities, clearSavedActivity } from '../util/readingPresentation.ts';
import { parseSavedConsultation } from '../util/validateSavedConsultation.ts';

test('deleting saved content keeps activity rows but clears private titles and links',()=>{
  const rows=[1,2,3].map(ordinal=>({consultation_id:'a',ordinal,kind:'one',topic:'일·커리어',created_at:'2026-09-28',savedId:'saved',title:'개인 질문'}));
  const other={...rows[0],consultation_id:'b',savedId:'other'};
  const result=clearSavedActivity([...rows,other],'saved');
  assert.equal(result.length,4);
  assert.deepEqual(result.slice(0,3).map(r=>[r.ordinal,r.savedId,r.title]),[[1,null,undefined],[2,null,undefined],[3,null,undefined]]);
  assert.equal(result[0].created_at,rows[0].created_at);
  assert.equal(result[3],other);
});

test('old saved reading keeps card details and does not invent guidance', () => {
  const result=presentReading({title:'오늘의 이야기',question:'질문',sections:[
    {title:'뽑은 카드 · 정의',cardId:11,text:'카드 의미'},
    {title:'종합 해설',text:'결론'},
    {title:'현재 상황 · 정의',text:'상세 내용'},
    {title:'지금 해볼 수 있는 일',text:'조언'},
  ]});
  assert.equal(result.cards[0].detail,'상세 내용');
  assert.equal(result.cards[0].remember,undefined);
  assert.equal(result.conclusion,'결론');
});
test('new action sections are attached to their card, not repeated as detail',()=>{
  const result=presentReading({title:'이야기',sections:[
    {title:'뽑은 카드 · 정의',cardId:11,text:'의미'}, {title:'종합 해설',text:'결론'},
    {title:'현재 상황 · 정의',cardId:11,text:'상세'},
    {title:'기억할 것 · 정의',text:'사실을 확인하세요'}, {title:'주의할 것 · 정의',text:'속단하지 마세요'},
  ]});
  assert.equal(result.cards.length,1);
  assert.equal(result.cards[0].remember,'사실을 확인하세요');
  assert.equal(result.cards[0].avoid,'속단하지 마세요');
});
test('history groups children under parent in ordinal order even with newest-first input',()=>{
  const row={created_at:'2026-09-28',kind:'one',topic:'일',savedId:null};
  const groups=groupActivities([{...row,consultation_id:'a',ordinal:3},{...row,consultation_id:'b',ordinal:1},{...row,consultation_id:'a',ordinal:1},{...row,consultation_id:'a',ordinal:2}]);
  assert.deepEqual(groups[0].items.map(r=>r.ordinal),[1,2,3]);
  assert.equal(groups.length,2);
});
test('guidance fits the existing save contract and monthly sections keep their own month',()=>{
  const reading={title:'월별 이야기',sections:[
    {title:'11월 · 정의',cardId:11,text:'11월 메시지'},
    {title:'기억할 것 · 11월 · 정의',text:'확인하세요'},
    {title:'11월 · 금전',text:'11월 금전 해설'},
    {title:'12월 · 컵 3',cardId:38,text:'12월 메시지'},
    {title:'주의할 것 · 12월 · 컵 3',text:'무리하지 마세요'},
  ]};
  assert.doesNotThrow(()=>parseSavedConsultation({consultationId:'11111111-1111-4111-8111-111111111111',revision:1,readings:[reading]}));
  const view=presentReading(reading);
  assert.equal(view.cards[0].remember,'확인하세요');
  assert.ok(!view.cards[0].detail.includes('12월'));
  assert.equal(view.cards[1].avoid,'무리하지 마세요');
});
