"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { playSound } from "@/lib/sound";

interface Props {
  /** 偵測到 QR code 後呼叫,參數是 QR 內容字串 */
  onDetect: (text: string) => void;
  /** 按鈕文字 (預設「📷 掃 QR」) */
  label?: string;
  /** 按鈕 className 蓋掉預設 */
  buttonClassName?: string;
}

// 跨瀏覽器型別補丁 — TS lib 還沒涵蓋 BarcodeDetector
interface BarcodeDetectorLike {
  detect: (source: ImageBitmapSource | HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
}
interface BarcodeDetectorCtor {
  new (opts?: { formats?: string[] }): BarcodeDetectorLike;
  getSupportedFormats?: () => Promise<string[]>;
}

/**
 * QR Code 掃描按鈕
 *
 * 行為:
 *   1. 點按鈕 → 開全螢幕相機 modal
 *   2. 用 BarcodeDetector API (Chrome / Edge / Android Safari 17+) 偵測
 *   3. 偵測到 → 自動關 modal + 呼叫 onDetect(rawValue)
 *   4. 瀏覽器不支援 → 顯示「請手動輸入」訊息
 *
 * 設計考量:
 *   - 不裝 jsQR / zxing 套件 (~ 100KB), 用瀏覽器原生 API
 *   - iOS Safari 17+ / Android Chrome 88+ / desktop Chrome 88+ 支援
 *   - 不支援的瀏覽器顯示提示, 不阻擋手動輸入
 *   - safe-area 處理 iOS 瀏海
 */
export default function QrScannerButton({
  onDetect,
  label = "📷 掃 QR Code",
  buttonClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectIntervalRef = useRef<number | null>(null);

  // 偵測瀏覽器是否支援
  useEffect(() => {
    if (typeof window === "undefined") return;
    const Ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    // 進一步確認 qr_code format 有支援
    Ctor.getSupportedFormats?.()
      .then((formats) => {
        setSupported(formats.includes("qr_code"));
      })
      .catch(() => setSupported(true)); // 沒 getSupportedFormats 也算支援,先試試
  }, []);

  async function startCamera() {
    if (!supported) return;
    const Ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
    if (!Ctor) return;
    setPermissionDenied(false);
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // 後鏡頭優先
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      detectorRef.current = new Ctor({ formats: ["qr_code"] });
      // 每 250ms 偵測一次
      detectIntervalRef.current = window.setInterval(detectFrame, 250);
    } catch (e) {
      console.warn("[QR] camera open failed", e);
      setPermissionDenied(true);
      setScanning(false);
    }
  }

  async function detectFrame() {
    if (!detectorRef.current || !videoRef.current) return;
    if (videoRef.current.readyState < 2) return; // HAVE_CURRENT_DATA
    try {
      const codes = await detectorRef.current.detect(videoRef.current);
      if (codes.length > 0) {
        const raw = codes[0].rawValue;
        if (raw && raw.length > 0) {
          playSound("coin");
          handleClose();
          onDetect(raw);
        }
      }
    } catch {
      // 偶發偵測錯誤,忽略繼續下一輪
    }
  }

  function handleClose() {
    if (detectIntervalRef.current !== null) {
      clearInterval(detectIntervalRef.current);
      detectIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    detectorRef.current = null;
    setScanning(false);
    setOpen(false);
  }

  // 開啟 modal 時自動開相機
  useEffect(() => {
    if (open && supported) {
      void startCamera();
    }
    return () => {
      if (open) handleClose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, supported]);

  // 不支援的瀏覽器: 隱藏按鈕 (避免假希望)
  if (supported === false) {
    return null;
  }
  if (supported === null) {
    return null; // 還在偵測中,別 flash
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          playSound("tap");
          setOpen(true);
        }}
        className={
          buttonClassName ??
          "tap-target w-full p-3 rounded-2xl border-2 border-[var(--color-coral)]/40 bg-white text-[var(--color-coral)] font-bold hover:bg-[var(--color-coral)]/5 transition flex items-center justify-center gap-2"
        }
        style={{ minHeight: 44 }}
      >
        {label}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* 全螢幕背景 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={handleClose}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.9)",
                zIndex: 100,
              }}
            />

            {/* Camera modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 24, stiffness: 280 }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 101,
                display: "flex",
                flexDirection: "column",
                paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)",
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
              }}
            >
              {/* 頂部 header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 20px 12px",
                  color: "#fff",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: 3,
                      opacity: 0.7,
                    }}
                  >
                    ◆ QR · SCAN
                  </div>
                  <div className="f-serif" style={{ fontSize: 20, fontWeight: 900, marginTop: 2 }}>
                    對準老師的房號 QR
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  aria-label="關閉相機"
                  className="tap-target"
                  style={{
                    width: 44,
                    height: 44,
                    background: "rgba(255,255,255,0.15)",
                    border: "2px solid rgba(255,255,255,0.4)",
                    color: "#fff",
                    fontSize: 24,
                    fontWeight: 900,
                    cursor: "pointer",
                    borderRadius: 0,
                  }}
                >
                  ×
                </button>
              </div>

              {/* Video preview + 取景框 */}
              <div
                style={{
                  flex: 1,
                  position: "relative",
                  margin: "0 16px",
                  background: "#000",
                  border: "2.5px solid #fff",
                  overflow: "hidden",
                }}
              >
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                {/* 取景框 + 角落裝飾 */}
                {scanning && !permissionDenied && (
                  <div
                    style={{
                      position: "absolute",
                      inset: "10%",
                      pointerEvents: "none",
                      border: "2px solid rgba(255,131,100,0.8)",
                      boxShadow: "0 0 0 9999px rgba(0,0,0,0.3)",
                    }}
                  >
                    {/* 4 個角落 */}
                    {[
                      { top: -2, left: -2, borderTop: "4px solid #ff8364", borderLeft: "4px solid #ff8364" },
                      { top: -2, right: -2, borderTop: "4px solid #ff8364", borderRight: "4px solid #ff8364" },
                      { bottom: -2, left: -2, borderBottom: "4px solid #ff8364", borderLeft: "4px solid #ff8364" },
                      { bottom: -2, right: -2, borderBottom: "4px solid #ff8364", borderRight: "4px solid #ff8364" },
                    ].map((s, i) => (
                      <span
                        key={i}
                        style={{
                          position: "absolute",
                          width: 24,
                          height: 24,
                          ...s,
                        }}
                      />
                    ))}
                    {/* 掃描線動畫 */}
                    <motion.div
                      initial={{ top: 0 }}
                      animate={{ top: "100%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        height: 2,
                        background: "linear-gradient(90deg, transparent, #ff8364, transparent)",
                      }}
                    />
                  </div>
                )}
                {permissionDenied && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 24,
                      color: "#fff",
                      textAlign: "center",
                      background: "rgba(0,0,0,0.7)",
                    }}
                  >
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📷🚫</div>
                    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
                      沒有相機權限
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.6, maxWidth: 280 }}>
                      請到瀏覽器設定允許這個網站使用相機,
                      或手動輸入老師給的房號
                    </div>
                  </div>
                )}
              </div>

              {/* 底部提示 */}
              <div
                style={{
                  padding: "12px 20px 0",
                  color: "rgba(255,255,255,0.85)",
                  textAlign: "center",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {scanning && !permissionDenied
                  ? "對準黑板/螢幕上的 QR code,自動讀取"
                  : permissionDenied
                  ? "可以關閉相機改用手動輸入"
                  : "啟動相機中..."}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
