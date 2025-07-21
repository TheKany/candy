"use client";

import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    Kakao: any;
  }
}

const KakaoShareButton = () => {
  const [isKakaoReady, setIsKakaoReady] = useState(false);

  useEffect(() => {
    if (!window.Kakao) {
      const script = document.createElement("script");
      script.src = "https://developers.kakao.com/sdk/js/kakao.js";
      script.async = true;
      script.onload = () => {
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_API_KEY);
        setIsKakaoReady(true);
      };
      document.head.appendChild(script);
    } else {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_API_KEY);
      }
      setIsKakaoReady(true);
    }
  }, []);

  const handleShare = () => {
    if (!window.Kakao || !isKakaoReady) return;

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: "타로타르트",
        description: "달콤하게 점쳐보는 당신의 운명",
        imageUrl:
          "https://mud-kage.kakao.com/dn/NTmhS/btqfEUdFAUf/FjKzkZsnoeE4o19klTOVI1/openlink_640x640s.jpg",
        link: {
          mobileWebUrl: "https://tarot-tart.vercel.app/",
          webUrl: "https://tarot-tart.vercel.app/",
        },
      },
      buttons: [
        {
          title: "타로타르트 한입 보기 🍰",
          link: {
            mobileWebUrl: "https://tarot-tart.vercel.app/",
            webUrl: "https://tarot-tart.vercel.app/",
          },
        },
      ],
    });
  };

  return (
    <button onClick={handleShare} disabled={!isKakaoReady}>
      카카오톡 공유하기
    </button>
  );
};

export default KakaoShareButton;
