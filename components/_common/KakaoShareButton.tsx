"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";

declare global {
  interface Window {
    Kakao: any;
  }
}

const KakaoShareButton = () => {
  const [isKakaoReady, setIsKakaoReady] = useState(false);
  const [isKakaoKey, setIsKakoKey] = useState(true);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_KAKAO_API_KEY) {
      setIsKakoKey(false);
      return;
    }

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
        imageUrl: `${window.location.origin}/banner.png`,
        link: {
          mobileWebUrl: `${window.location.origin}/`,
          webUrl: `${window.location.origin}/`,
        },
      },
      buttons: [
        {
          title: "타로타르트 한입 해보기 🍰",
          link: {
            mobileWebUrl: `${window.location.origin}/`,
            webUrl: `${window.location.origin}/`,
          },
        },
      ],
    });
  };

  return (
    <ShareButton type="button" onClick={handleShare} disabled={!isKakaoReady}>
      타로타르트 소문내기
    </ShareButton>
  );
};

export default KakaoShareButton;

const ShareButton = styled.button`
  width:100%;min-height:46px;padding:12px 8px;border:1px solid #edcf8a66;border-radius:12px;
  background:#ffffff08;color:#fff1cd;font-size:14px;line-height:1.6;cursor:pointer;
  &:disabled{opacity:.5;cursor:default;}
  &:focus-visible{outline:2px solid #edcf8a;outline-offset:3px;}
`;
