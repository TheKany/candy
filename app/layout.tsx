import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Container from "@/components/_common/_Container";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: "no",
};

export const metadata = {
  title: "타로타르트",
  description: "달콤하게 맛보는 나의 운명: 타로타르트",
  other: {
    "google-adsense-account": "ca-pub-4184442303277144",
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
    <html lang="en">
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4184442303277144"
        crossOrigin="anonymous"
      />
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
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
