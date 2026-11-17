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
            LINE → 自動帶 openExternalBrowser=1 跳系統預設瀏覽器
            FB/IG/Messenger/微信/Kakao → Android 自動用 intent:// 叫出 Chrome 開本頁（只試一次），並顯示引導與「用 Chrome 開啟」按鈕；iPhone 只能顯示引導 */}
        <script
          dangerouslySetInnerHTML={{
            __html: String.raw`
                (function () {
                    var ua = navigator.userAgent || "";
                    var isLine = /\bLine\//i.test(ua);
                    var isOtherInApp = /FBAN|FBAV|FB_IAB|Instagram|Messenger|MicroMessenger|KAKAOTALK/i.test(ua);
                    var isAndroid = /Android/i.test(ua);

                    if (isLine && location.search.indexOf("openExternalBrowser=1") === -1) {
                        // LINE 官方參數：自動改用外部瀏覽器重開本頁（保留原有 query 與 hash）
                        var sep = location.search ? "&" : "?";
                        location.replace(location.href.split("#")[0] + sep + "openExternalBrowser=1" + location.hash);
                        return;
                    }
                    if (!isOtherInApp && !isLine) return;

                    // Android：用 intent:// 指定 Chrome 開啟本頁（保留 query 與 hash）。
                    // 沒裝 Chrome 時改回內建瀏覽器開「帶 iabEscape=1 的本頁」，不再重試，避免無限跳轉。
                    var chromeIntent = "";
                    if (isAndroid) {
                        var fallback = location.href.split("#")[0]
                            + (location.search ? "&" : "?") + "iabEscape=1" + location.hash;
                        chromeIntent = "intent://" + location.host + location.pathname + location.search + location.hash
                            + "#Intent;scheme=" + location.protocol.replace(":", "")
                            + ";package=com.android.chrome"
                            + ";S.browser_fallback_url=" + encodeURIComponent(fallback) + ";end";
                    }
                    var autoJump = false;
                    if (chromeIntent) {
                        autoJump = location.search.indexOf("iabEscape=1") === -1;
                        try { autoJump = autoJump && sessionStorage.getItem("iabEscapeTried") !== "1"; } catch (e) { }
                    }

                    // 自動跳轉沒生效（舊版 App、沒裝 Chrome、iPhone）→ 顯示全版引導，避免使用者白撞 Google 封鎖
                    document.addEventListener("DOMContentLoaded", function () {
                        var d = document.createElement("div");
                        d.id = "inapp-browser-guide";
                        d.style.cssText = "position:fixed;inset:0;z-index:99999;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,'Microsoft JhengHei',sans-serif;";
                        var chromeBtn = chromeIntent
                            ? '<a id="inapp-open-chrome" href="' + chromeIntent.replace(/"/g, "&quot;") + '" style="display:block;margin:22px 0 4px;padding:14px 18px;border-radius:999px;background:#22c55e;color:#052e16;font-size:17px;font-weight:800;text-decoration:none;">用 Chrome 開啟</a>'
                                + '<p style="font-size:13px;color:#94a3b8;margin:8px 0 18px;">按了沒反應，再照下面的方法</p>'
                            : "";
                        d.innerHTML = '<div style="max-width:420px;width:100%;box-sizing:border-box;text-align:center;background:#1e293b;border-radius:16px;padding:32px 26px;">'
                            + '<div style="font-size:52px;">🌐</div>'
                            + '<h4 style="font-weight:800;margin:14px 0 10px;">請改用瀏覽器開啟</h4>'
                            + '<p style="font-size:15px;line-height:1.8;color:#cbd5e1;margin:0;">您目前在 <b style="color:#fbbf24;">App 內建瀏覽器</b>（LINE／FB 等）中開啟本頁，Google 基於安全政策<b>禁止在此環境登入</b>。</p>'
                            + chromeBtn
                            + '<p style="font-size:15px;line-height:1.8;color:#cbd5e1;margin:' + (chromeIntent ? "0" : "14px 0 0") + ';">請點右上／右下角「<b>⋯</b>」→ 選「<b style="color:#4ade80;">用預設瀏覽器開啟</b>」。<br><br>💡 也可以把本站「加入主畫面」，之後從桌面圖示開啟最穩定。</p>'
                            + '<button type="button" id="inapp-guide-dismiss" onclick="this.parentNode.parentNode.remove()" style="margin-top:18px;background:transparent;border:1px solid #475569;color:#cbd5e1;border-radius:999px;padding:10px 18px;font-size:14px;">先不登入，繼續瀏覽</button>'
                            + '</div>';
                        document.body.appendChild(d);
                        // 先把引導畫出來再自動叫 Chrome：就算跳轉被 App 擋下，畫面也不會停在空白
                        if (autoJump) {
                            try { sessionStorage.setItem("iabEscapeTried", "1"); } catch (e) { }
                            setTimeout(function () { location.href = chromeIntent; }, 300);
                        }
                    });
                })();
        `,
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
