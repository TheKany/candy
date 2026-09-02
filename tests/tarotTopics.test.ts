import assert from "node:assert/strict";
import test from "node:test";
import {
  TAROT_TOPICS,
  getTarotTopic,
  getTopicSelectionAction,
  isTarotTopicId,
} from "../constants/tarotTopics.ts";

test("exposes the eight tarot concerns once in display order", () => {
  assert.deepEqual(
    TAROT_TOPICS.map(({ id, title }) => ({ id, title })),
    [
      { id: "their-feelings", title: "상대의 마음" },
      { id: "new-love", title: "새로운 인연" },
      { id: "relationship-flow", title: "관계의 흐름" },
      { id: "career", title: "일·커리어" },
      { id: "money", title: "금전운" },
      { id: "relationships", title: "인간관계" },
      { id: "decision", title: "선택·결정" },
      { id: "personal-flow", title: "나의 흐름" },
    ],
  );
  assert.equal(new Set(TAROT_TOPICS.map(({ id }) => id)).size, 8);
});

test("rejects invalid persisted topic IDs", () => {
  assert.equal(isTarotTopicId("career"), true);
  assert.equal(isTarotTopicId("unknown"), false);
  assert.equal(getTarotTopic("career")?.title, "일·커리어");
  assert.equal(getTarotTopic(null), null);
});

test("only allows navigation after a topic is selected", () => {
  assert.deepEqual(getTopicSelectionAction(null), { kind: "hidden" });
  assert.deepEqual(getTopicSelectionAction("career"), {
    kind: "navigate",
    href: "/shuffle",
  });
});
