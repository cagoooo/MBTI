/** 教師自備金鑰：僅存在本頁記憶體，不讀環境金鑰、不寫瀏覽器儲存或 Firebase。
 * 瀏覽器用量提醒可被重新整理繞過，不是伺服器限流，也沒有學校共用額度。
 */
export const GEMINI_SETTINGS_EVENT = "mbti-gemini-settings-change";
const API_ROOT = "https://generativelanguage.googleapis.com/v1beta";
const HOUR = 60 * 60 * 1000;
const LIMIT = 5;
const MAX_PROMPT_CHARS = 2000;
export interface GeminiModel { name: string; displayName: string; thinking?: boolean }
let teacherKey = "";
let selectedModel = "";
let availableModels: GeminiModel[] = [];
let configurationEpoch = 0;
let generationCount = 0;
let resetAt = 0;
let generationBusy = false;
const activeRequests = new Set<AbortController>();
function cancelRequests() {
  for (const controller of activeRequests) controller.abort("settings-changed");
}

function notify() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(GEMINI_SETTINGS_EVENT));
}
function refreshWindow() {
  if (Date.now() >= resetAt) { generationCount = 0; resetAt = Date.now() + HOUR; }
}
export function getGeminiStatus() {
  refreshWindow();
  return { configured: !!teacherKey && !!selectedModel, model: selectedModel,
    models: availableModels.map(m => ({ ...m })), generationCount, limit: LIMIT, resetAt,
    revision: configurationEpoch };
}
export function isGeminiAvailable(): boolean { return !!teacherKey && !!selectedModel; }
export function clearGeminiConfiguration(): void {
  cancelRequests(); configurationEpoch++; teacherKey = ""; selectedModel = ""; availableModels = []; notify();
}
export function selectGeminiModel(name: string): void {
  if (!availableModels.some(m => m.name === name)) throw new Error("請從已驗證的模型清單選擇。");
  if (name !== selectedModel) { cancelRequests(); selectedModel = name; configurationEpoch++; notify(); }
}
function apiError(status: number): Error {
  // 不轉印 Google 原始錯誤，避免意外回顯金鑰、網址或學生資料。
  const messages: Record<number, string> = {
    400: "請求未被接受，請重新確認金鑰及所選模型。",
    401: "金鑰驗證失敗，請確認自己的 Gemini API 金鑰。",
    403: "金鑰權限或網站限制不符，請檢查 Generative Language API 權限與允許網域。",
    404: "模型目前無法使用，請重新驗證金鑰並更新模型清單。",
    429: "Google 用量或速率已達上限，請稍後再試並自行查核自己的額度。",
  };
  return new Error(messages[status] ?? `Google 服務暫時無法使用（HTTP ${status}），請稍後再試。`);
}
async function requestGoogle<T>(path: string, key: string, init: RequestInit, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  activeRequests.add(controller);
  const timeout = setTimeout(() => controller.abort("timeout"), timeoutMs);
  let onAbort: () => void = () => {};
  const aborted = new Promise<never>((_, reject) => {
    onAbort = () => reject(new Error(controller.signal.reason === "settings-changed"
      ? "金鑰或模型已變更，已取消上一份請求；請重新產生。" : "等待逾時，請稍後再試。"));
    controller.signal.addEventListener("abort", onAbort, { once: true });
  });
  try {
    return await Promise.race([aborted, (async () => {
      const response = await fetch(`${API_ROOT}/${path}`, { ...init, cache: "no-store",
        credentials: "omit", referrerPolicy: "strict-origin-when-cross-origin", signal: controller.signal,
        headers: { "Content-Type": "application/json", "x-goog-api-key": key } });
      if (!response.ok) throw apiError(response.status);
      // 逾時必須包含完整回應內容，不能收到標頭就取消計時。
      return await response.json() as T;
    })()]);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw new Error("等待逾時，請稍後再試。");
    if (error instanceof TypeError) throw new Error("無法連線 Google，請確認網路或金鑰的網站限制。");
    if (error instanceof SyntaxError) throw new Error("Google 回應格式無法讀取，請稍後再試。");
    throw error;
  } finally { clearTimeout(timeout); controller.signal.removeEventListener("abort", onAbort); activeRequests.delete(controller); }
}
/** 先 ListModels，再啟用。僅列具名、穩定、可 generateContent 的文字模型。 */
export async function configureGemini(apiKey: string): Promise<GeminiModel[]> {
  const key = apiKey.trim();
  if (key.length < 20 || key.length > 256 || /\s/.test(key)) throw new Error("請輸入自己的完整 API 金鑰。");
  clearGeminiConfiguration();
  const epoch = configurationEpoch;
  const models: GeminiModel[] = [];
  let token = "";
  for (let page = 0; page < 10; page++) {
    const data = await requestGoogle<{ models?: Array<GeminiModel & { supportedGenerationMethods?: string[] }>; nextPageToken?: string }>(
      `models?pageSize=1000${token ? `&pageToken=${encodeURIComponent(token)}` : ""}`, key, { method: "GET" }, 15000);
    for (const model of data.models ?? []) {
      if (/^models\/gemini-\d+(?:\.\d+)*-(?:flash(?:-lite)?|pro)(?:-\d+)?$/.test(model.name)
        && model.supportedGenerationMethods?.includes("generateContent")) {
        models.push({ name: model.name, displayName: model.displayName || model.name, thinking: model.thinking });
      }
    }
    token = data.nextPageToken ?? "";
    if (!token) break;
    if (page === 9) throw new Error("模型清單未讀取完整，請稍後重新驗證。");
  }
  if (epoch !== configurationEpoch) throw new Error("金鑰設定已變更，請重新驗證。");
  if (!models.length) throw new Error("此金鑰目前沒有可用的穩定文字模型，請確認 Gemini API 權限。");
  const rank = (name: string) => name.includes("flash-lite") ? 0 : name.includes("flash") ? 1 : 2;
  models.sort((a, b) => rank(a.name) - rank(b.name) || b.name.localeCompare(a.name, undefined, { numeric: true }));
  teacherKey = key; availableModels = models; selectedModel = models[0].name; configurationEpoch++; notify();
  return models.map(m => ({ ...m }));
}

interface GeminiResponse {
  candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>;
}
export async function generateText(prompt: string, opts: { temperature?: number; maxOutputTokens?: number } = {}): Promise<string> {
  if (!isGeminiAvailable()) throw new Error("請先由教師輸入自己的金鑰並完成驗證。");
  if (!prompt.trim() || prompt.length > MAX_PROMPT_CHARS) throw new Error("分析內容過長，請縮減至 2000 字以內。");
  refreshWindow();
  if (generationBusy) throw new Error("上一份建議仍在產生，請稍候再操作。");
  if (generationCount >= LIMIT) throw new Error("本頁每小時 5 次的防誤按提醒已達上限，請稍後再試；實際額度由 Google 管理。");
  generationBusy = true; generationCount++; notify();
  const epoch = configurationEpoch;
  const key = teacherKey;
  const model = selectedModel;
  const generationConfig = {
    temperature: opts.temperature ?? 0.7,
    maxOutputTokens: Math.max(2048, opts.maxOutputTokens ?? 2048),
    // 2.5 Flash 系列支援關閉思考，避免小段建議被思考 token 截斷；其他模型維持預設。
    ...(model.startsWith("models/gemini-2.5-flash") ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
  };
  try {
    const data = await requestGoogle<GeminiResponse>(`${model}:generateContent`, key, { method: "POST",
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig }) }, 60000);
    if (epoch !== configurationEpoch) throw new Error("金鑰或模型已變更，已略過上一份回應；請重新產生。");
    const candidate = data.candidates?.[0];
    if (candidate?.finishReason === "MAX_TOKENS") throw new Error("建議未產生完整，請重新嘗試或選擇其他可用模型。");
    if (candidate?.finishReason && candidate.finishReason !== "STOP") throw new Error("回應遭安全機制或服務限制攔截，未以預設文字冒充 AI 結果。");
    const text = candidate?.content?.parts?.filter(p => !p.thought).map(p => p.text ?? "").join("").trim();
    if (!text) throw new Error("Google 未回傳可用內容，請稍後再試；未使用預設文字替代。");
    return text;
  } finally { generationBusy = false; notify(); }
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
  if (!/^[EI][SN][TF][JP]$/.test(input.type)) throw new Error("人格傾向資料格式不正確，請重新完成故事。");
  const branchLabel = (
    {
      main: "主線",
      sport: "校隊組",
      art: "藝術組",
      study: "學術組",
      friend: "友誼組",
    } as Record<string, string>
  )[input.branch] ?? "主線";

  const safeGuess = input.pretestGuess && /^[EI][SN][TF][JP]$/.test(input.pretestGuess) ? input.pretestGuess : "";
  const pretestLine = safeGuess && safeGuess !== input.type
    ? `這位同學在開始前自己猜的是 ${safeGuess}，最後跑出來是 ${input.type} — 故事讓他看到自己原來還有另一面。`
    : safeGuess
      ? `這位同學在開始前就猜中了自己是 ${input.type}，看起來很了解自己。`
      : "";

  // 不傳自由文字、姓名或學生暱稱；這個版本只分析類型、支線及有效的預猜類型。

  const prompt = `
你是一位溫暖、用心、了解 MBTI 的國小老師，現在要為一個國小 3-6 年級學生寫一段「專屬個人化分析」。

學生資訊：
- MBTI 傾向：${input.type}
- 故事中走的支線：${branchLabel}
${pretestLine ? `- ${pretestLine}` : ""}

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
  if (!main || Object.values(scores).length !== 4 || Object.values(scores).some(n => !Number.isFinite(n) || n < 0 || n > 10000)) {
    throw new Error("情緒練習資料格式不正確，請重新完成情境活動。");
  }
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
- 主導因應風格：${main}
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
  const counts = [input.totalCount, input.completedCount, ...Object.values(input.typeDistribution), ...Object.values(input.axisCount)];
  if (counts.some(n => !Number.isInteger(n) || n < 0 || n > 10000) || input.completedCount > input.totalCount
    || Object.keys(input.typeDistribution).some(type => !/^[EI][SN][TF][JP]$/.test(type))) {
    throw new Error("班級統計格式不正確，請重新整理統計資料。");
  }
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
- 活動：去識別化班級故事活動
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
