import test from 'node:test';
import assert from 'node:assert/strict';
import { getDailyDealFrames } from '../util/dailyShuffleMotion.ts';

test('all cards travel from the right through scatter and a left pile into the same selection row',()=>{
  const cards=Array.from({length:78},(_,i)=>getDailyDealFrames(i,78));
  for(const frames of cards){
    assert.ok(parseFloat(frames[0].left)>100);
    assert.ok(parseFloat(frames[2].left)>0&&parseFloat(frames[2].left)<100);
    assert.equal(frames[4].left,'0%');
    assert.equal(frames.at(-1)?.top,'0px');
    assert.equal(frames.at(-1)?.transform,'translate(-50%, -50%) rotate(0deg)');
    assert.ok(frames.every((frame,i)=>i===0||frame.offset>=frames[i-1].offset));
  }
  assert.equal(cards[0].at(-1)?.left,'0%');
  assert.equal(cards[77].at(-1)?.left,'100%');
  assert.ok(new Set(cards.map(frames=>frames[2].left)).size>50);
  assert.ok(cards[0][6].offset<cards[77][6].offset);
});
