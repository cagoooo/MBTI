import type { Metadata, Viewport } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import SoundToggle from "@/components/SoundToggle";
import SwRegister from "@/components/SwRegister";
import SettingsPanel from "@/components/SettingsPanel";
import appConfig from "../../app.config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || appConfig.productionUrl;
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: `${BASE}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    title: appConfig.schoolShortName,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: `${BASE}/favicon-32.png`, sizes: "32x32", type: "image/png" },
      { url: `${BASE}/favicon-16.png`, sizes: "16x16", type: "image/png" },
      { url: `${BASE}/icon.svg`, type: "image/svg+xml" },
    ],
    apple: [
      { url: `${BASE}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" },
    ],
    shortcut: `${BASE}/favicon-32.png`,
  },
  title: `${appConfig.siteName} ｜ 用故事玩出你的人格類型`,
  description: appConfig.siteDescription,
  keywords: ["MBTI", "16型人格", "校園 RPG", "互動故事", "性格測驗", "國小教學"],
  openGraph: {
    title: `${appConfig.siteName} ｜ 玩 10 分鐘故事，找出你的 16 型人格`,
    description: appConfig.siteDescription,
    type: "website",
    locale: "zh_TW",
    siteName: appConfig.siteName,
    url: SITE_URL,
    images: [
      {
        url: `${BASE}/og.png`,
        width: 1200,
        height: 630,
        alt: `${appConfig.siteName} — 16 型人格 RPG 故事`,
        type: "image/png",
      },
      {
        url: `${BASE}/og-square.png`,
        width: 1200,
        height: 1200,
        alt: `${appConfig.siteName} (方形版)`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: appConfig.siteName,
    description: appConfig.siteDescription,
    images: [`${BASE}/og.png`],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // 移除 maximumScale:1 — 違反 WCAG 2.5.5/1.4.4 a11y, 視障使用者無法放大網頁
  // 加 viewportFit:'cover' — 讓 iOS 瀏海手機的 env(safe-area-inset-*) 正常計算
  viewportFit: "cover",
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
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;800;900&family=Noto+Serif+TC:wght@400;500;700;900&family=Ma+Shan+Zheng&family=JetBrains+Mono:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
        {/* 避免字級 + 注音設定首次 paint 閃爍 — 在 client render 前就套用 */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var v=localStorage.getItem('mbti-font-scale');var m={sm:.9,md:1,lg:1.15,xl:1.3};document.documentElement.style.setProperty('--font-scale',String(m[v]||1));if(localStorage.getItem('mbti-zhuyin-on')==='1')document.documentElement.classList.add('zhuyin-on');}catch(e){}})();",
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
