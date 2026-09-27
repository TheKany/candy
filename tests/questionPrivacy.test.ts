import test from "node:test";
import assert from "node:assert/strict";
test("질문은 persist 저장소 없이 메모리에서만 관리한다", async () => {
  let writes = 0;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: { getItem: () => null, setItem: () => { writes++; }, removeItem: () => {} } });
  try {
  const { useQuestionStore } = await import("../store/useQuestionStore.ts");
  assert.equal("persist" in useQuestionStore, false);
  useQuestionStore.getState().save("합성 질문", null);
  assert.equal(useQuestionStore.getState().question, "합성 질문");
  useQuestionStore.getState().reset();
  assert.equal(useQuestionStore.getState().question, "");
  assert.equal(writes, 0);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "sessionStorage", descriptor);
    else Reflect.deleteProperty(globalThis, "sessionStorage");
  }
});
