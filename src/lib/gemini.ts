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
