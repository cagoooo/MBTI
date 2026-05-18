"use client";

import { AnimatePresence, motion } from "framer-motion";

interface Props {
  currentVersion: string;
  newVersion: string;
  onUpdate: () => void;
  onDismiss: () => void;
}

/**
 * 新版本可用通知 Banner — 從頁面頂端滑下來，顯示新版本提示。
 * 提供「立刻更新」「等下再說」兩個動作。
 */
export default function SwUpdateBanner({ currentVersion, newVersion, onUpdate, onDismiss }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="fixed left-1/2 -translate-x-1/2 z-50 w-[min(92vw,560px)] print:hidden"
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
      >
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl shadow-2xl border-4 border-white/40 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl shrink-0">🎉</div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-base sm:text-lg">有新版本可以更新！</div>
              <div className="text-xs sm:text-sm opacity-90 mt-0.5">
                點「立刻更新」載入最新內容（不會影響你的紀錄）
              </div>
              <div className="text-xs opacity-70 mt-1 font-mono truncate">
                {currentVersion} → {newVersion}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onUpdate}
              className="flex-1 bg-white text-emerald-700 font-black px-4 rounded-xl hover:bg-emerald-50 transition shadow"
              style={{ minHeight: 44 }}
            >
              ✨ 立刻更新
            </button>
            <button
              onClick={onDismiss}
              className="px-4 rounded-xl bg-white/20 text-white text-sm font-bold hover:bg-white/30 transition"
              style={{ minHeight: 44 }}
            >
              等下再說
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
