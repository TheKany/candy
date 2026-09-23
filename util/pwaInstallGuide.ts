export function detectInstallBrowser(userAgent: string, maxTouchPoints = 0) {
  const ios = /iPhone|iPad|iPod/i.test(userAgent)
    || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1);
  return {
    platform: (ios || !/Android/i.test(userAgent) ? 'ios' : 'android') as 'ios' | 'android',
    kakao: /KAKAOTALK/i.test(userAgent),
  };
}
