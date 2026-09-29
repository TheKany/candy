import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDailyRequest, parseDailyReading } from '../util/dailyReadingWriter.ts';
import { getRequiredCardCount, shouldOpenResultAfterReveal } from '../util/cardSelectionFlow.ts';

const valid = { energy: 50, headline: '작은 계획부터 실행해보세요.', interpretation: '오늘은 서두르기보다 할 수 있는 일 하나를 마무리해보세요.', helpfulAction: '미뤄둔 연락 한 통을 해보세요.', cautionAction: '대답을 재촉하지 마세요.' };
test('daily accepts only internal deck IDs 0 through 77', () => {
  for (const cardId of [0,77]) assert.deepEqual(parseDailyRequest({cardId}), {cardId});
  for (const cardId of [-1,78,1.5,'1',null]) assert.equal(parseDailyRequest({cardId}), null);
});
test('daily energy must be an integer percentage and all reading sections must exist', () => {
  for (const energy of [0,50,100]) assert.equal(parseDailyReading({...valid,energy}).energy,energy);
  for (const energy of [-1,101,NaN,0.5,'50']) assert.throws(()=>parseDailyReading({...valid,energy}));
  for (const field of ['headline','interpretation','helpfulAction','cautionAction']) assert.throws(()=>parseDailyReading({...valid,[field]:' '}));
});
test('daily requires exactly one revealed card', () => {
  assert.equal(getRequiredCardCount('daily'),1);
  assert.equal(shouldOpenResultAfterReveal('daily',1,true),true);
  assert.equal(shouldOpenResultAfterReveal('daily',0,true),false);
  assert.equal(shouldOpenResultAfterReveal('daily',2,true),false);
  assert.equal(shouldOpenResultAfterReveal('daily',1,false),false);
});
