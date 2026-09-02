import assert from "node:assert/strict";
import test from "node:test";
import {
  getOrbitAnimationTiming,
  getOrganicOrbitMotion,
} from "../util/organicShuffleMotion.ts";

test("gives nearby but distinct orbit axes and speeds to individual cards", () => {
  const motions = Array.from({ length: 12 }, (_, index) =>
    getOrganicOrbitMotion(index, 150)
  );

  assert.ok(new Set(motions.map(({ axisX }) => axisX)).size > 1);
  assert.ok(new Set(motions.map(({ axisY }) => axisY)).size > 1);
  assert.ok(new Set(motions.map(({ speedScale }) => speedScale)).size > 1);

  motions.forEach(({ axisX, axisY, speedScale, delayMs }) => {
    assert.ok(Math.abs(axisX - 150) <= 14);
    assert.ok(Math.abs(axisY - 150) <= 14);
    assert.ok(speedScale >= 0.9 && speedScale <= 1.1);
    assert.ok(delayMs >= 0 && delayMs <= 100);
  });
});

test("keeps every card moving linearly until the orbit phase ends", () => {
  const phaseDurationMs = 5000;
  const timings = Array.from({ length: 12 }, (_, index) =>
    getOrbitAnimationTiming(
      getOrganicOrbitMotion(index, 150),
      phaseDurationMs
    )
  );

  assert.ok(new Set(timings.map(({ durationMs }) => durationMs)).size > 1);
  timings.forEach(({ durationMs, delayMs, easing }) => {
    assert.equal(durationMs + delayMs, phaseDurationMs);
    assert.equal(easing, "linear");
  });
});
