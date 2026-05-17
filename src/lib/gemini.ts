/**
 * Gemini 個人化分析 — 直接從 client 呼叫
 *
 * 🔑 安全策略 (referer-restricted client key):
 *   - 用 process.env.NEXT_PUBLIC_GEMINI_API_KEY (build 時 inline)
 *   - Google AI Studio 那支 key 限定 HTTP referer 只能從 cagoooo.github.io
 *   - 別人偷 key 也只能從那域名呼叫, 等於白拿沒用
 *   - 若 env 沒設, 整個功能 graceful disable (按鈕變灰)
 *
 * 為什麼不放後端:
 *   - 這是 GitHub Pages 純靜態站, 沒後端
 *   - 上 Cloud Functions 就要學校付錢 + 額外維護 + 流量超低不划算
 *
 * Free tier:
 *   - gemini-2.0-flash: 1500 req/day, 15 req/min, 1M token/min
 *   - 一個學校 30 人 × 每學期 1 次 = 30 req → 一週用不完一天的額度
 *
 * 設定:
 *   1. https://aistudio.google.com/ 拿 API key
 *   2. Google Cloud Console → API Keys → 編輯這支 key
 *      → Application restrictions: HTTP referrers (web sites)
 *      → 加 https://cagoooo.github.io/* (改成你的網域)
 *      → API restrictions: 只允許 Generative Language API
 *   3. GitHub repo Secrets 加 NEXT_PUBLIC_GEMINI_API_KEY
 *   4. push 觸發部署
 */

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const MODEL = "gemini-2.0-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export function isGeminiAvailable(): boolean {
  return !!API_KEY;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message: string };
}

/**
 * 用 fetch 呼叫 Gemini, 回傳純文字。
 * 失敗丟錯 (上層自己處理 UI)。
 */
export async function generateText(prompt: string, opts: {
  temperature?: number;
  maxOutputTokens?: number;
} = {}): Promise<string> {
  if (!API_KEY) throw new Error("Gemini API key 未設定");

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.85,
      maxOutputTokens: opts.maxOutputTokens ?? 600,
      // 給孩子看, 嚴格安全
      // (預設 BLOCK_MEDIUM_AND_ABOVE 已經夠嚴, 不另外調)
    },
  };

  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as GeminiResponse;
    throw new Error(err.error?.message ?? `Gemini API ${res.status}`);
  }

  const data = (await res.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini 回應沒有內容");
  return text.trim();
}

/**
 * 結果頁專用：根據 MBTI + 選擇歷史生成個人化敘述。
 *
 * 設計原則:
 *   - 對象是國小 3-6 年級, 用詞要簡單溫暖
 *   - 不下診斷 (避免 "你就是..."), 強調可能性
 *   - 3 段結構: 你的樣子 / 你的超能力 / 給你的小提醒
 *   - 用第二人稱 "你"
 */
export async function generatePersonalAnalysis(input: {
  type: string;
  nickname: string;
  branch: string;
  pretestGuess?: string;
  pickedTags?: string[]; // 玩家選過的選項摘要 (e.g. ["跟隊友合作", "幫小宇撿便當"])
}): Promise<string> {
  const branchLabel = (
    {
      main: "主線",
      sport: "校隊組",
      art: "藝術組",
      study: "學術組",
      friend: "友誼組",
    } as Record<string, string>
  )[input.branch] ?? "主線";

  const pretestLine = input.pretestGuess && input.pretestGuess !== input.type
    ? `這位同學在開始前自己猜的是 ${input.pretestGuess}，最後跑出來是 ${input.type} — 故事讓他看到自己原來還有另一面。`
    : input.pretestGuess
      ? `這位同學在開始前就猜中了自己是 ${input.type}，看起來很了解自己。`
      : "";

  const picksLine = input.pickedTags && input.pickedTags.length > 0
    ? `在故事裡他做出的關鍵選擇包括：${input.pickedTags.join("、")}。`
    : "";

  const prompt = `
你是一位溫暖、用心、了解 MBTI 的國小老師，現在要為一個國小 3-6 年級學生寫一段「專屬個人化分析」。

學生資訊：
- MBTI 類型：${input.type}（${input.nickname}）
- 故事中走的支線：${branchLabel}
${pretestLine ? `- ${pretestLine}` : ""}
${picksLine ? `- ${picksLine}` : ""}

請用第二人稱「你」寫一段 250-350 字的個人化分析，分成三個段落（每段開頭加一個 emoji）：

1. 🌟 你是這樣的人（描述特質，溫暖、肯定，舉一個生活場景）
2. 💪 你的超能力（從選擇看出的優勢，要具體不要空泛）
3. 🌱 給你的小提醒（成長建議，正向表達，鼓勵嘗試不同的選擇）

語氣：
- 溫暖、像在跟一個你疼愛的學生說話
- 用國小看得懂的詞，不要心理學術語
- 不要說「你一定是...」「你就是...」這種絕對的話，改用「你常常...」「你看起來很...」
- 不要說教，不要列規則
- 純粹的文字，不要 markdown 標題 (# 之類)，但段落間留空行
`.trim();

  return generateText(prompt, { temperature: 0.9, maxOutputTokens: 700 });
}

/**
 * SEL 結果頁專用：根據 4 軸因應分數 + 主導風格生成「個人化情緒處方」。
 *
 * 設計原則:
 *   - 對象是國小 3-6 年級，用詞溫暖具體
 *   - 不是「你應該...」，而是「下週可以試試...」
 *   - 3 段結構: 看見你 / 接下來一週可以練習 / 遇到 OO 情境時可以這樣做
 *   - 結合主導風格 (鼓勵) + 弱勢軸 (引導發展)
 */
export async function generateSelPrescription(input: {
  style: "express" | "solve" | "calm" | "connect";
  nickname: string;
  scores: { express: number; solve: number; calm: number; connect: number };
}): Promise<string> {
  const styleNames = {
    express: "表達型 (情緒會用說的、寫的、畫的表達出來)",
    solve: "思考型 (用腦袋分析原因、找解法)",
    calm: "安撫型 (用身體照顧自己、深呼吸、暫離)",
    connect: "連結型 (找家人、朋友、老師陪伴)",
  };
  const main = styleNames[input.style];
  const { scores } = input;
  const total = scores.express + scores.solve + scores.calm + scores.connect;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 25);

  // 找最弱的軸 (鼓勵發展)
  const axes: Array<["express" | "solve" | "calm" | "connect", number]> = [
    ["express", scores.express],
    ["solve", scores.solve],
    ["calm", scores.calm],
    ["connect", scores.connect],
  ];
  axes.sort((a, b) => a[1] - b[1]);
  const weakest = axes[0][0];
  const weakestName = styleNames[weakest];

  const prompt = `
你是一位溫暖、了解 SEL (社會情緒學習) 的國小輔導老師。
現在要為一個國小 3-6 年級學生寫一段「個人化情緒處方」(不是診斷，是溫暖的建議)。

學生資訊：
- 主導因應風格：${input.nickname} — ${main}
- 4 軸分布：表達 ${pct(scores.express)}% / 思考 ${pct(scores.solve)}% / 安撫 ${pct(scores.calm)}% / 連結 ${pct(scores.connect)}%
- 最少使用的方式：${weakestName}

請寫 250-300 字「情緒處方」，分成三段（每段開頭加 emoji + 標題）：

🔍 我看見的你
（30-50 字，用溫暖肯定的語氣描述他的主導風格特色，舉一個生活例子）

🌱 接下來一週可以試試 3 件小事
（90-120 字，列出 3 件「具體、可執行、今天就能開始」的小練習。
其中至少 1 件是針對他最少使用的「${weakestName}」方式 — 用「試試看」「也可以」的語氣，不是「你應該」。
例如：「明天遇到難過時，試著深呼吸 3 次再說話」「下次想哭時，先寫一句話描述感受」）

💌 遇到 OO 情境時可以這樣做
（80-110 字，舉一個具體常見情境（如：「下次有人誤會你的時候」、「下次比賽輸了的時候」），
用他主導風格的方式 + 借一點其他方式的智慧，給一個 step-by-step 的建議）

語氣要求：
- 像愛你的輔導老師在你旁邊輕聲說話
- 用國小看得懂的詞，不要心理學術語
- 不要說「你一定要...」「你應該...」，改用「試試看」「也可以」「下次或許可以」
- 不要列規則式條列，每件事都加情境
- 純文字，段落間留空行，不要 markdown 標題 (# 之類)
`.trim();

  return generateText(prompt, { temperature: 0.85, maxOutputTokens: 700 });
}

/**
 * 老師班級洞察報告 — 從 SessionSnapshot 生成家長日用的班級分析
 *
 * 設計:
 *   - 對象是老師 / 家長 (不是學生)
 *   - 講人話、避免心理學術語
 *   - 包含: 班級整體個性 + 3 個合作建議 + 2 個衝突提示 + 下次活動推薦
 *   - 約 300-400 字，老師複製到家長日報告或聯絡簿剛好
 */
export async function generateClassInsight(input: {
  sessionLabel: string;
  totalCount: number;
  completedCount: number;
  typeDistribution: Record<string, number>;
  axisCount: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number };
}): Promise<string> {
  // 找出主要 type top 3
  const topTypes = Object.entries(input.typeDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const topTypesText = topTypes.map(([t, n]) => `${t} (${n}人)`).join("、");

  // 4 軸比例
  const a = input.axisCount;
  const ei = a.E + a.I;
  const sn = a.S + a.N;
  const tf = a.T + a.F;
  const jp = a.J + a.P;
  const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 50);

  const axisText = [
    `E ${pct(a.E, ei)}% / I ${pct(a.I, ei)}%`,
    `S ${pct(a.S, sn)}% / N ${pct(a.N, sn)}%`,
    `T ${pct(a.T, tf)}% / F ${pct(a.F, tf)}%`,
    `J ${pct(a.J, jp)}% / P ${pct(a.P, jp)}%`,
  ].join("，");

  const prompt = `
你是一位資深輔導老師，要為一個國小班級寫一份「MBTI 班級洞察報告」給家長日 / 老師備課用。

班級資料：
- 活動：${input.sessionLabel}
- 參與：${input.completedCount} 人完成 (總 ${input.totalCount} 人)
- 主要型別：${topTypesText}
- 4 軸比例：${axisText}

請寫一份 350-400 字的班級報告，分四段（每段開頭加 emoji + 標題）：

🎭 班級整體個性
（80-100 字：用 1-2 句描述這班是「什麼樣的一群孩子」— 從主要型 + 軸比例推。
避免標籤化，用「這班整體偏向...」「大部分孩子...」這種有溫度的句子。
舉一個生活情境例子，例如「下課時這班會比較像 ___ 的樣子」。）

🤝 3 個合作建議
（80-100 字：列 3 個具體可行的班級活動 / 分組方式建議，每條一行。
例如「分組時刻意把 P 多的同學跟 J 多的搭配，讓他們互補」「上課發問可以多用視覺圖像，因為 S 偏多」。）

⚠️ 2 個潛在衝突提示
（70-90 字：列 2 個老師需要留意的點。
例如「F 偏多代表這班容易因為人際小事影響情緒」「I 偏多的孩子可能需要更多獨處時間」。
用「老師可以多注意」的語氣，不要寫成「問題」。）

🎯 推薦下次活動
（60-80 字：根據這班特性，建議下次跑什麼主題的活動。
例如「可以嘗試 SEL 逆境特別篇 (因為 F 偏多需練習接住情緒)」或「猜朋友 MBTI 模式 (因為差異性大適合互相認識)」。）

語氣：
- 溫暖、像資深老師在跟同事 / 家長分享觀察
- 不下標籤、不評判好壞
- 用具體情境取代抽象描述
- 純文字段落，不要 markdown 標題 (# 之類)
`.trim();

  return generateText(prompt, { temperature: 0.85, maxOutputTokens: 900 });
}
