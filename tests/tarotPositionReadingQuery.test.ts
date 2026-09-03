import assert from "node:assert/strict";
import test from "node:test";

import { buildPositionReadingTupleFilter } from "../util/tarotPositionReadingQuery.ts";

test("builds one PostgREST expression from exact card, position, and orientation tuples", () => {
  const filter = buildPositionReadingTupleFilter([
    { cardId: 7, positionId: "past", orientation: "upright" },
    { cardId: 19, positionId: "present", orientation: "reversed" },
    { cardId: 42, positionId: "future", orientation: "upright" },
  ]);

  assert.equal(
    filter,
    "and(card_id.eq.7,position_id.eq.past,orientation.eq.upright),"
      + "and(card_id.eq.19,position_id.eq.present,orientation.eq.reversed),"
      + "and(card_id.eq.42,position_id.eq.future,orientation.eq.upright)",
  );
});

test("keeps all ten Celtic card, position, and orientation tuples paired", () => {
  const filter = buildPositionReadingTupleFilter([
    { cardId: 0, positionId: "present", orientation: "upright" },
    { cardId: 1, positionId: "obstacle", orientation: "reversed" },
    { cardId: 2, positionId: "root", orientation: "upright" },
    { cardId: 3, positionId: "goal", orientation: "reversed" },
    { cardId: 4, positionId: "past", orientation: "upright" },
    { cardId: 5, positionId: "near-future", orientation: "reversed" },
    { cardId: 6, positionId: "self", orientation: "upright" },
    { cardId: 7, positionId: "environment", orientation: "reversed" },
    { cardId: 8, positionId: "hopes-fears", orientation: "upright" },
    { cardId: 9, positionId: "outcome", orientation: "reversed" },
  ]);

  assert.equal(
    filter,
    "and(card_id.eq.0,position_id.eq.present,orientation.eq.upright),"
      + "and(card_id.eq.1,position_id.eq.obstacle,orientation.eq.reversed),"
      + "and(card_id.eq.2,position_id.eq.root,orientation.eq.upright),"
      + "and(card_id.eq.3,position_id.eq.goal,orientation.eq.reversed),"
      + "and(card_id.eq.4,position_id.eq.past,orientation.eq.upright),"
      + "and(card_id.eq.5,position_id.eq.near-future,orientation.eq.reversed),"
      + "and(card_id.eq.6,position_id.eq.self,orientation.eq.upright),"
      + "and(card_id.eq.7,position_id.eq.environment,orientation.eq.reversed),"
      + "and(card_id.eq.8,position_id.eq.hopes-fears,orientation.eq.upright),"
      + "and(card_id.eq.9,position_id.eq.outcome,orientation.eq.reversed)",
  );
});

test("rejects malformed tuple values before they reach a PostgREST filter", () => {
  assert.throws(
    () => buildPositionReadingTupleFilter([
      { cardId: 7, positionId: "past),card_id.eq.77", orientation: "upright" },
    ]),
    /position tuple/i,
  );
  assert.throws(
    () => buildPositionReadingTupleFilter([]),
    /at least one/i,
  );
});
