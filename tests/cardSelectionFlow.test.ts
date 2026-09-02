import assert from "node:assert/strict";
import test from "node:test";
import {
  getCardAtPosition,
  getRelativeSlotPosition,
  shouldOpenResultAfterReveal,
  SHUFFLE_GUIDANCE,
} from "../util/cardSelectionFlow.ts";

test("maps the visible 1 through 78 positions to the shuffled deck", () => {
  const deck = Array.from({ length: 78 }, (_, index) => 77 - index);

  assert.equal(getCardAtPosition(deck, 1), 77);
  assert.equal(getCardAtPosition(deck, 78), 0);
  assert.equal(getCardAtPosition(deck, 0), null);
  assert.equal(getCardAtPosition(deck, 79), null);
});

test("keeps the selected card target stable when the page scrolls", () => {
  const slotDocumentPosition = { top: 449, left: 175 };

  assert.deepEqual(
    getRelativeSlotPosition(
      slotDocumentPosition,
      { top: 178, left: 25 },
      { x: 0, y: 0 }
    ),
    { top: 271, left: 150 }
  );
  assert.deepEqual(
    getRelativeSlotPosition(
      slotDocumentPosition,
      { top: 36, left: 25 },
      { x: 0, y: 142 }
    ),
    { top: 271, left: 150 }
  );
});

test("opens the result only after every selected card finishes revealing", () => {
  assert.equal(shouldOpenResultAfterReveal("one", 1, false), false);
  assert.equal(shouldOpenResultAfterReveal("one", 1, true), true);
  assert.equal(shouldOpenResultAfterReveal("three", 2, true), false);
  assert.equal(shouldOpenResultAfterReveal("three", 3, true), true);
});

test("shows the requested guidance while cards are shuffling", () => {
  assert.equal(
    SHUFFLE_GUIDANCE.shuffling,
    "카드를 섞는 동안 질문을 생각해주세요."
  );
});
