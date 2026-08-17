/**
 * 🏫 一鍵 fork 設定 — 給其他學校老師客製化
 *
 * 改這一個檔案，就能把整站從「石門國小・阿凱老師」換成你自己的學校。
 * 不用動其他程式碼，build + push 就會自動套用到 footer / metadata / 列印單 / 投影片。
 *
 * 改完後流程：
 *   1. npm run build (本機驗證)
 *   2. git commit -am "🏫 customize: 換成 XX 國小"
 *   3. git push  → GitHub Actions 自動部署
 *
 * 完整 fork 教學見 README.md「給其他學校老師：3 分鐘換成你的學校」一節
 */

export interface AppConfig {
  /** 學校全名 (footer / OG / 列印單顯示) */
  schoolFullName: string;
  /** 學校簡稱 (空間有限時) */
  schoolShortName: string;
  /** 老師署名 (footer / 列印單作者欄) */
  teacherName: string;
  /** 老師個人介紹頁 URL (footer 連結) */
  teacherHomepageUrl: string;
  /** 學校官網 (顯示在投影片 / 教師頁) */
  schoolHomepageUrl?: string;
  /** 教育主題 emoji (footer / hero) */
  schoolEmoji?: string;
  /** GitHub Pages 部署的網域 (用於 OG image 絕對路徑) */
  productionUrl: string;
  /** 站名 (browser tab 標題、所有 metadata 用) */
  siteName: string;
  /** 站描述 (OG description) */
  siteDescription: string;
  /** 課程適用年級提示 (給老師看) */
  gradeHint: string;
}

const config: AppConfig = {
  schoolFullName: "桃園市龍潭區石門國小",
  schoolShortName: "石門國小",
  teacherName: "阿凱老師",
  teacherHomepageUrl:
    "https://www.smes.tyc.edu.tw/modules/school/index.php?department_id=2&zone_id=0&page_id=2&content_id=11&type=news&from_op=all_news#a5",
  schoolHomepageUrl: "https://www.smes.tyc.edu.tw/",
  schoolEmoji: "🏫",
  productionUrl: "https://cagoooo.github.io/MBTI",
  siteName: "MBTI 校園奇遇記",
  siteDescription:
    "丟掉枯燥問卷！跟著主角走進校園，從開學第一天到校慶大結局，每個選擇都會影響你的故事走向，最後揭曉你的 16 型 MBTI 人格。",
  gradeHint: "適用 3-6 年級 / 國中初探",
};

export default config;
