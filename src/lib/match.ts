import { ALL_TYPES, type MBTIType } from "./types";

export interface MatchResult {
  /** 0~100 合拍指數 */
  score: number;
  /** 一句話總結 */
  headline: string;
  /** 相處模式描述 */
  dynamic: string;
  /** 常見衝突點 */
  conflicts: string[];
  /** 溝通建議 */
  tips: string[];
  /** 適合一起做的事 */
  goodAt: string[];
}

/**
 * 計算合拍分數 (0~100)：
 *   - 同維度相反 +20 (互補)，相同 +5 (同調)
 *   - E/I 互補時 +18, S/N 互補 +22 (認知功能配對最重要), T/F 互補 +18, J/P 同向 +15
 *   - 「黃金配對」(榮格認知功能對偶) 多加 12 分
 *   - 基礎 30 分保底
 */
const GOLDEN_PAIRS: Array<[MBTIType, MBTIType]> = [
  ["INTJ", "ENFP"], ["INTJ", "ENTP"],
  ["INTP", "ENTJ"], ["INTP", "ESFJ"],
  ["ENTJ", "INTP"], ["ENTJ", "INFP"],
  ["ENTP", "INFJ"], ["ENTP", "INTJ"],
  ["INFJ", "ENTP"], ["INFJ", "ENFP"],
  ["INFP", "ENFJ"], ["INFP", "ENTJ"],
  ["ENFJ", "INFP"], ["ENFJ", "ISFP"],
  ["ENFP", "INTJ"], ["ENFP", "INFJ"],
  ["ISTJ", "ESFP"], ["ISTJ", "ESTP"],
  ["ISFJ", "ESTP"], ["ISFJ", "ESFP"],
  ["ESTJ", "ISFP"], ["ESTJ", "ISTP"],
  ["ESFJ", "ISFP"], ["ESFJ", "ISTP"],
  ["ISTP", "ESFJ"], ["ISTP", "ESTJ"],
  ["ISFP", "ENFJ"], ["ISFP", "ESTJ"],
  ["ESTP", "ISFJ"], ["ESTP", "ISTJ"],
  ["ESFP", "ISFJ"], ["ESFP", "ISTJ"],
];

function isGoldenPair(a: MBTIType, b: MBTIType) {
  return GOLDEN_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

export function computeMatch(a: MBTIType, b: MBTIType): MatchResult {
  if (a === b) {
    return {
      score: 70,
      headline: `兩位都是 ${a}，像照鏡子一樣！`,
      dynamic: `你們有相同的人格類型，思考方式、做事節奏、看世界角度都很像。在一起會有「啊我懂你！」的感動，也會有「為什麼你跟我一樣固執」的小煩惱。`,
      conflicts: [
        "兩人有相同的盲點，缺乏不同視角的提醒",
        "可能會強化彼此原有的習慣（包含不好的）",
        "意見不合時，因為都很相似反而更難讓步",
      ],
      tips: [
        "保留一些「跟自己不同類型」的朋友當參考",
        "故意嘗試對方相反的做事方法，會看到新世界",
        "分配工作時可以輪流負責，避免兩人都不擅長的事被忽略",
      ],
      goodAt: ["默契搭檔（不用講太多就懂）", "一起做需要極致同調的事（雙人舞、雙人合唱）", "互相打氣"],
    };
  }

  // 計算 4 軸差異
  const axes = [0, 1, 2, 3];
  let diffCount = 0;
  axes.forEach((i) => { if (a[i] !== b[i]) diffCount++; });

  // 基礎分
  let score = 30;
  // E/I 互補 +12 (外向內向有平衡感)
  if (a[0] !== b[0]) score += 12;
  // S/N 互補 +20 (這軸差異最重要)
  if (a[1] !== b[1]) score += 22;
  else score += 8; // 同調也加一點
  // T/F 互補 +14
  if (a[2] !== b[2]) score += 14;
  else score += 6;
  // J/P 同向 +12 (做事節奏一致較好)
  if (a[3] === b[3]) score += 12;
  // 太多差異反而降分 (差異 > 3 視為衝突高)
  if (diffCount === 4) score -= 8;
  // 黃金配對加分
  if (isGoldenPair(a, b)) score += 12;
  // clamp
  score = Math.max(20, Math.min(98, score));

  // 文案：依差異組合給細節
  const headline = getHeadline(score);
  const dynamic = getDynamic(a, b);
  const conflicts = getConflicts(a, b);
  const tips = getTips(a, b);
  const goodAt = getGoodAt(a, b);

  return { score, headline, dynamic, conflicts, tips, goodAt };
}

function getHeadline(score: number): string {
  if (score >= 90) return "🌟 天作之合！互補又互懂";
  if (score >= 75) return "💖 超合拍！相處起來很自在";
  if (score >= 60) return "👍 滿合得來，需要一點包容";
  if (score >= 45) return "🤝 需要練習互相理解";
  return "⚡ 差異很大，但差異也是養分";
}

function getDynamic(a: MBTIType, b: MBTIType): string {
  const ei = a[0] !== b[0] ? "一個比較愛跟人互動、一個比較喜歡獨處充電" : a[0] === "E" ? "兩個都很活潑，相處時氣氛超熱鬧" : "兩個都比較內向，喜歡安靜陪伴";
  const sn = a[1] !== b[1] ? "一個務實看當下、一個天馬行空看未來，思考角度很不同" : a[1] === "S" ? "都重視實際與細節，做事踏實" : "都喜歡想像與可能性，常一起做夢";
  const tf = a[2] !== b[2] ? "一個重邏輯、一個重感受，判斷標準不太一樣" : a[2] === "T" ? "都重視道理與公平，溝通直接" : "都重視感受與和諧，溫柔包容";
  const jp = a[3] !== b[3] ? "一個喜歡計畫、一個喜歡隨興，生活節奏不同" : a[3] === "J" ? "都喜歡有計畫，相處有秩序" : "都喜歡彈性，相處很自由";
  return `${ei}。${sn}。${tf}。${jp}。`;
}

function getConflicts(a: MBTIType, b: MBTIType): string[] {
  const out: string[] = [];
  if (a[0] !== b[0]) out.push("約出去玩時，一個想找一群人、一個只想兩個人靜靜");
  if (a[1] !== b[1]) out.push("討論事情時，一個專注細節、一個專注大方向，可能彼此聽不懂");
  if (a[2] !== b[2]) out.push("意見不合時，一個用道理講、一個用感受講，兩種語言");
  if (a[3] !== b[3]) out.push("做計畫時，一個想全程排好、一個想隨遇而安");
  if (out.length === 0) out.push("太相似時，可能會強化彼此的盲點");
  return out;
}

function getTips(a: MBTIType, b: MBTIType): string[] {
  const out: string[] = [];
  if (a[0] !== b[0]) out.push(`${a[0] === "E" ? a : b} 多給對方獨處時間；${a[0] === "I" ? a : b} 偶爾主動約一下`);
  if (a[1] !== b[1]) out.push("討論時先說「我要講細節 / 講大方向」讓對方知道你的角度");
  if (a[2] !== b[2]) out.push("意見不同時，先問對方：『你的感受是？』和『你的理由是？』");
  if (a[3] !== b[3]) out.push("做計畫時留一半「自由時間」給隨興派、一半「行程表」給計畫派");
  out.push("常常告訴對方「你跟我不一樣的地方，我很喜歡」");
  return out;
}

function getGoodAt(a: MBTIType, b: MBTIType): string[] {
  const out: string[] = [];
  if (a[1] !== b[1]) out.push("做專題報告（一個負責蒐集資料、一個負責創意發想）");
  if (a[3] !== b[3]) out.push("規劃班遊（一個排行程、一個找新鮮玩法）");
  if (a[2] !== b[2]) out.push("處理同學糾紛（一個冷靜分析、一個照顧情緒）");
  if (a[0] !== b[0]) out.push("一起當小組長（一個對外溝通、一個對內整理）");
  if (out.length === 0) out.push("做需要極致同調的事，例如雙人才藝表演");
  return out;
}

/** 全班配對：找出每個人最合拍的同學 */
export interface ClassmateMatch {
  name: string;
  type: MBTIType;
  bestPartner?: { name: string; type: MBTIType; score: number };
}

export function findClassMatches(
  roster: { name: string; type: MBTIType }[],
): ClassmateMatch[] {
  return roster.map((me) => {
    let best: { name: string; type: MBTIType; score: number } | undefined;
    for (const other of roster) {
      if (other.name === me.name) continue;
      const m = computeMatch(me.type, other.type);
      if (!best || m.score > best.score) {
        best = { name: other.name, type: other.type, score: m.score };
      }
    }
    return { name: me.name, type: me.type, bestPartner: best };
  });
}

export { ALL_TYPES };
