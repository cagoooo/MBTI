import type { Metadata, Viewport } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import SoundToggle from "@/components/SoundToggle";
import SwRegister from "@/components/SwRegister";
import SettingsPanel from "@/components/SettingsPanel";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cagoooo.github.io/MBTI";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    title: "MBTI 校園",
    statusBarStyle: "default",
  },
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icon.svg`,
    apple: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icon.svg`,
  },
  title: "MBTI 校園奇遇記 ｜ 用故事玩出你的人格類型",
  description:
    "丟掉枯燥問卷！跟著主角走進校園，從開學第一天到校慶大結局，每個選擇都會影響你的故事走向，最後揭曉你的 16 型 MBTI 人格。",
  keywords: ["MBTI", "16型人格", "校園 RPG", "互動故事", "性格測驗", "國小教學"],
  openGraph: {
    title: "MBTI 校園奇遇記",
    description: "玩一場校園 RPG 故事，找出你的 16 型人格。",
    type: "website",
    locale: "zh_TW",
    siteName: "MBTI 校園奇遇記",
  },
  twitter: {
    card: "summary_large_image",
    title: "MBTI 校園奇遇記",
    description: "玩一場校園 RPG 故事，找出你的 16 型人格。",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ff8364",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
        {/* 避免字級設定首次 paint 閃爍 — 在 client render 前就套用 */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var v=localStorage.getItem('mbti-font-scale');var m={sm:.9,md:1,lg:1.15,xl:1.3};document.documentElement.style.setProperty('--font-scale',String(m[v]||1));}catch(e){}})();",
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <SoundToggle />
        <SettingsPanel />
        <SwRegister />
      </body>
    </html>
  );
}
