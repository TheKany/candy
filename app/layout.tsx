import "./globals.css";
import Container from "@/components/_common/_Container";
import { Analytics } from "@vercel/analytics/next";
import PwaRegister from "@/components/_common/PwaRegister";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: "no",
  themeColor: "#0c3427",
};

export const metadata = {
  title: "타로타르트",
  description: "달콤하게 맛보는 나의 운명: 타로타르트",
  keywords: ["타로", " 타로카드", "타로점", "운세", "운명"],
  url: "https://tarot-tart.vercel.app/",
  siteName: "타로타르트",
  locale: "ko_KR",
  type: "website",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: { url: "/apple-icon-180x180.png", sizes: "180x180" },
  },
  openGraph: {
    title: "타로타르트",
    description: "달콤하게 맛보는 나의 운명: 타로타르트",
    url: "https://tarot-tart.vercel.app/",
    siteName: "타로타르트",
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: "타로타르트 미리보기 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "타로타르트",
    description: "달콤하게 맛보는 나의 운명: 타로타르트",
    images: ["/banner.png"],
  },
  other: {
    "google-adsense-account": "ca-pub-4184442303277144",
    "google-site-verification": "KjRABD7__6IdKg9gv6RUmh1X2R1lFUEtT44FXGXxSr4",
  },
};

declare global {
  interface Window {
    Kakao: any;
  }
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4184442303277144"
        crossOrigin="anonymous"
      />
      <body>
        <PwaRegister />
        <Container>{children}</Container>
        <script
          defer
          src="https://developers.kakao.com/sdk/js/kakao.min.js"
        ></script>
        <Analytics />
      </body>
    </html>
  );
}
