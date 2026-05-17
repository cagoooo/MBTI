"use client";

import SoundButton from "@/components/SoundButton";

export default function PrintButton() {
  function handlePrint() {
    if (typeof window !== "undefined") window.print();
  }
  return (
    <SoundButton
      sound="coin"
      onClick={handlePrint}
      className="btn-3d inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 text-white font-black hover:bg-emerald-600 transition print-hide"
    >
      <span className="text-xl">📄</span>
      <span>列印我的結果單</span>
    </SoundButton>
  );
}
