import appConfig from "../../app.config";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "dev";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="container-paper print:hidden"
      style={{
        padding: "60px 0 80px",
        borderTop: "1.5px dashed var(--line-strong)",
        marginTop: 40,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 24,
          alignItems: "flex-end",
        }}
      >
        <div>
          <div
            className="f-serif"
            style={{ fontWeight: 900, fontSize: 32, lineHeight: 1, marginBottom: 8 }}
          >
            校園<span style={{ color: "var(--coral)" }}>奇遇</span>記
          </div>
          <div style={{ fontSize: 14, color: "var(--ink-soft)" }}>
            Made with <span style={{ color: "var(--coral)" }}>❤</span> by{" "}
            <a
              href={appConfig.teacherHomepageUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "inherit",
                borderBottom: "1.5px dashed var(--ink)",
                paddingBottom: 2,
                textDecoration: "none",
              }}
            >
              {appConfig.teacherName}
            </a>
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
            {appConfig.schoolFullName}資訊教育　·　{appConfig.siteName} © {year}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="hud" style={{ marginBottom: 6 }}>VERSION</div>
          <div className="f-mono" style={{ fontSize: 13, color: "var(--muted)" }}>
            v{APP_VERSION}
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid var(--line)",
          fontSize: 12,
          color: "var(--muted)",
          lineHeight: 1.7,
        }}
      >
        本網站用於 MBTI 性格類型教育推廣，結果僅供參考，不應作為心理診斷依據。
      </div>
    </footer>
  );
}
