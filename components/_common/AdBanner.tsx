"use client";

import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AdBanner = () => {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!loadedRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        loadedRef.current = true;
      } catch (e) {
        console.error("Adsbygoogle error:", e);
      }
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", height: 100 }}
      data-ad-client="ca-pub-1234567890123456"
      data-ad-slot="1234567890"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
};

export default AdBanner;
