"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  GEMINI_SETTINGS_EVENT,
  clearGeminiConfiguration,
  configureGemini,
  getGeminiStatus,
  isGeminiAvailable,
  selectGeminiModel,
} from "@/lib/gemini";

type GeminiStatus = ReturnType<typeof getGeminiStatus>;

// 只訂閱記憶體設定；生成計數事件不會改變 revision。
export function useGeminiSettings() {
  const [status, setStatus] = useState<GeminiStatus | null>(null);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setStatus(getGeminiStatus());
      setAvailable(isGeminiAvailable());
    };
    window.addEventListener(GEMINI_SETTINGS_EVENT, refresh);
    refresh();
    return () => window.removeEventListener(GEMINI_SETTINGS_EVENT, refresh);
  }, []);

  return { status, available, revision: status?.revision ?? 0 };
}

export default function GeminiKeySettings() {
  const { status } = useGeminiSettings();
  const id = useId();
  const [apiKey, setApiKey] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    let lastRevision = getGeminiStatus().revision;
    const refresh = () => {
      const next = getGeminiStatus();
      if (next.revision === lastRevision) return;
      lastRevision = next.revision;
      // 另一個面板清除設定時，也清掉這個面板尚未送出的輸入。
      if (!next.configured) {
        setApiKey("");
        setConfirmed(false);
      }
      setError(null);
    };
    window.addEventListener(GEMINI_SETTINGS_EVENT, refresh);
    return () => {
      window.removeEventListener(GEMINI_SETTINGS_EVENT, refresh);
      requestId.current++;
    };
  }, []);

  async function configure() {
    if (!confirmed || !apiKey.trim() || configuring) return;
    const currentRequest = ++requestId.current;
    setConfiguring(true);
    setError(null);
    try {
      await configureGemini(apiKey.trim());
      if (currentRequest !== requestId.current) return;
      // 驗證成功後，金鑰只留在共用函式的記憶體，不留在輸入欄。
      setApiKey("");
      setConfirmed(false);
    } catch (e) {
      if (currentRequest !== requestId.current) return;
      setError(e instanceof Error ? e.message : "無法取得可用模型，請確認本人金鑰、網路與 Google 的存取設定後再試一次。");
    } finally {
      if (currentRequest === requestId.current) setConfiguring(false);
    }
  }

  function clear() {
    requestId.current++;
    clearGeminiConfiguration();
    setApiKey("");
    setConfirmed(false);
    setConfiguring(false);
    setError(null);
  }

  const selectedModel = status?.models.find((model) => model.name === status.model);

  return (
    <div className="relative my-4 min-w-0 rounded-2xl border border-violet-200 bg-white/80 p-4 text-violet-950 print-hide">
      <h4 className="font-bold text-sm">教師的 Gemini 設定</h4>
      <p className="mt-2 text-xs leading-relaxed">
        請由教師輸入本人金鑰，本工具沒有學校共用金鑰。驗證金鑰與取得模型清單（ListModels）、生成文字時，金鑰與請求只送至 Google，不上傳至學校資料庫。
        金鑰只放在此頁記憶體，不寫入任何儲存空間；重整或關閉頁面就會清除。
      </p>
      <p className="mt-2 text-xs leading-relaxed">
        請勿在學生共享裝置輸入私人金鑰。請勿輸入姓名、聯絡方式或其他個資。AI 文字不是心理診斷，使用前需由教師審閱。
      </p>
      <label htmlFor={`${id}-key`} className="mt-3 block text-xs font-bold">本人 Gemini API 金鑰</label>
      <input
        id={`${id}-key`}
        type="password"
        autoComplete="off"
        spellCheck={false}
        autoCapitalize="none"
        value={apiKey}
        disabled={configuring}
        onChange={(event) => { setApiKey(event.target.value); setError(null); }}
        placeholder="由教師貼上本人金鑰"
        className="mt-1 w-full min-w-0 rounded-xl border border-violet-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-60"
      />
      <label className="mt-3 flex items-start gap-2 text-xs leading-relaxed">
        <input
          type="checkbox"
          checked={confirmed}
          disabled={configuring}
          onChange={(event) => setConfirmed(event.target.checked)}
          className="mt-0.5 shrink-0 accent-violet-600"
        />
        <span>我確認使用本人金鑰，且不輸入或傳送個人資料，生成內容會先經教師審閱。</span>
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!confirmed || !apiKey.trim() || configuring}
          onClick={() => void configure()}
          className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {configuring ? "正在向 Google 驗證，請耐心等待…" : "驗證金鑰並取得模型"}
        </button>
        <button type="button" onClick={clear} className="rounded-xl border border-violet-300 bg-white px-3 py-2 text-xs font-bold hover:bg-violet-50">
          清除金鑰與輸入
        </button>
      </div>
      <label htmlFor={`${id}-model`} className="mt-3 block text-xs font-bold">Google 即時回傳的可用模型</label>
      <select
        id={`${id}-model`}
        value={status?.model ?? ""}
        disabled={configuring || !status?.configured || !status.models.length}
        onChange={(event) => {
          try {
            selectGeminiModel(event.target.value);
            setError(null);
          } catch {
            setError("模型無法選取，請重新驗證金鑰並取得模型清單。");
          }
        }}
        className="mt-1 w-full min-w-0 rounded-xl border border-violet-300 bg-white px-3 py-2 text-sm disabled:opacity-60"
      >
        <option value="" disabled>請先驗證金鑰並取得模型</option>
        {status?.models.map((model) => (
          <option key={model.name} value={model.name}>
            {model.displayName || model.name}{model.thinking ? "（思考模型）" : ""}
          </option>
        ))}
      </select>
      <div role="status" aria-live="polite" className="mt-3 space-y-1 text-xs leading-relaxed break-words">
        <p>{status?.configured ? `目前選定模型：${selectedModel?.displayName || status.model || "尚未選取"}` : "尚未設定金鑰，請教師完成設定後再生成。"}</p>
        {status?.model && <p className="font-mono text-[11px]">{status.model}</p>}
        <p>此瀏覽器每小時 {status?.limit ?? 5} 次的防誤按提醒；已記錄 {status?.generationCount ?? 0} 次。清除金鑰不會重設計數，但重新整理頁面可繞過提醒；這並非 Google 的硬性配額或費用上限。請教師自行留意本人帳號的用量與費用。</p>
        {status && status.generationCount >= status.limit && <p className="text-amber-900">已達本機提醒次數，請先確認是否需要再次生成；Google 的可用額度以本人帳號為準。</p>}
      </div>
      {error && <p role="alert" className="mt-2 text-xs leading-relaxed text-rose-800">{error}</p>}
    </div>
  );
}
