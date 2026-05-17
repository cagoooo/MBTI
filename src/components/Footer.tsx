const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "dev";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 py-8 px-4 text-center text-sm text-[var(--color-ink)]/70">
      <div className="max-w-3xl mx-auto space-y-2">
        <p className="text-base">
          Made with <span className="text-rose-500">❤️</span> by{" "}
          <a
            href="https://www.smes.tyc.edu.tw/modules/tadnews/page.php?ncsn=11&nsn=16#a5"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline decoration-rose-300 decoration-2 underline-offset-4 hover:decoration-rose-500"
          >
            阿凱老師
          </a>
        </p>
        <p className="text-xs opacity-70">
          桃園市龍潭區石門國小資訊教育 · MBTI 校園奇遇記 © {year}
        </p>
        <p className="text-xs opacity-50">
          本網站用於 MBTI 性格類型教育推廣，結果僅供參考，不應作為心理診斷依據。
        </p>
        <p className="text-[10px] opacity-40 font-mono mt-2">
          v{APP_VERSION}
        </p>
      </div>
    </footer>
  );
}
