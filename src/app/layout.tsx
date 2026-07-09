import type { Metadata, Viewport } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import SoundToggle from "@/components/SoundToggle";
import SwRegister from "@/components/SwRegister";
import SettingsPanel from "@/components/SettingsPanel";
import PwaInstallBanner from "@/components/PwaInstallBanner";
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
        {/* 🛡️ App 內建瀏覽器防護：Google OAuth 禁止在 WebView 登入（403 disallowed_useragent）
            LINE → 自動帶 openExternalBrowser=1 跳系統預設瀏覽器；FB/IG/Messenger/微信/Kakao → 顯示引導。
            必須放在 <head> 最前、早於任何 Google 登入邏輯執行。 */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){var ua=navigator.userAgent||"";var isLine=/\\bLine\\//i.test(ua);var isOtherInApp=/FBAN|FBAV|FB_IAB|Instagram|Messenger|MicroMessenger|KAKAOTALK/i.test(ua);if(isLine&&location.search.indexOf("openExternalBrowser=1")===-1){var sep=location.search?"&":"?";location.replace(location.href.split("#")[0]+sep+"openExternalBrowser=1"+location.hash);return;}if(isOtherInApp||isLine){document.addEventListener("DOMContentLoaded",function(){var d=document.createElement("div");d.style.cssText="position:fixed;inset:0;z-index:99999;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,\'Microsoft JhengHei\',sans-serif;";d.innerHTML=\'<div style="max-width:420px;text-align:center;background:#1e293b;border-radius:16px;padding:32px 26px;"><div style="font-size:52px;">🌐</div><h4 style="font-weight:800;margin:14px 0 10px;">請改用瀏覽器開啟</h4><p style="font-size:15px;line-height:1.8;color:#cbd5e1;margin:0;">您目前在 <b style="color:#fbbf24;">App 內建瀏覽器</b>（LINE／FB 等）中開啟本頁，Google 基於安全政策<b>禁止在此環境登入</b>。<br><br>請點右上／右下角「<b>⋯</b>」→ 選「<b style="color:#4ade80;">用預設瀏覽器開啟</b>」。</p></div>\';document.body.appendChild(d);});}})();',
          }}
        />
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
        <PwaInstallBanner />
      </body>
    </html>
  );
}
