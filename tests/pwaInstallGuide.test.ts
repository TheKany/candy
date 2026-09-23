import assert from 'node:assert/strict';
import test from 'node:test';
import { detectInstallBrowser } from '../util/pwaInstallGuide.ts';

test('installation guide detects platform and Kakao without requiring Kakao', () => {
  assert.deepEqual(detectInstallBrowser('iPhone Safari KAKAOTALK'), { platform: 'ios', kakao: true });
  assert.deepEqual(detectInstallBrowser('Android Chrome'), { platform: 'android', kakao: false });
  assert.deepEqual(detectInstallBrowser('Macintosh Safari', 5), { platform: 'ios', kakao: false });
  assert.deepEqual(detectInstallBrowser('Windows Chrome'), { platform: 'ios', kakao: false });
});
