#!/usr/bin/env node
/**
 * 從 src/og-assets/ 內的 SVG 模板生成各尺寸 PNG 到 public/
 *
 * 產出：
 *   public/og.png                   1200×630  Facebook / Twitter / LINE 標準 OG
 *   public/og-square.png            1200×1200 IG 方形 / LINE 詳細卡
 *   public/favicon.ico              48×48     瀏覽器分頁標準
 *   public/favicon-16.png           16×16
 *   public/favicon-32.png           32×32
 *   public/apple-touch-icon.png     180×180   iOS 桌面 icon
 *   public/icon-192.png             192×192   PWA standard
 *   public/icon-512.png             512×512   PWA splash / install
 *   public/icon-maskable-512.png    512×512   PWA maskable (含 padding)
 *
 * 用法：npm run gen:images
 * 部署：產出的 PNG commit 進 repo，build 時自動隨 public/ 複製到 out/
 */

import { readFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const OG_SVG = readFileSync(join(process.cwd(), "src/og-assets/og-card.svg"));
const FAVICON_SVG = readFileSync(join(process.cwd(), "src/og-assets/favicon.svg"));
const PUBLIC = join(process.cwd(), "public");
if (!existsSync(PUBLIC)) mkdirSync(PUBLIC, { recursive: true });

async function svgToPng(svgBuffer, outName, { width, height, padding = 0, bg = null }) {
  const out = join(PUBLIC, outName);
  let pipeline = sharp(svgBuffer, { density: 300 }).resize(width - padding * 2, height - padding * 2, {
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 0 },
  });
  if (padding > 0 || bg) {
    pipeline = pipeline.extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: bg ?? { r: 255, g: 131, b: 100, alpha: 1 },
    });
  }
  await pipeline.png({ compressionLevel: 9 }).toFile(out);
  return out;
}

console.log("[gen-images] Generating PNG assets from SVG templates...\n");

const tasks = [
  // OG 卡 (社群分享預覽)
  { svg: OG_SVG, name: "og.png", w: 1200, h: 630, label: "Facebook / Twitter / LINE 標準 OG" },
  {
    svg: OG_SVG,
    name: "og-square.png",
    w: 1200,
    h: 1200,
    label: "方形版 (IG / LINE 詳細卡，會自動裁切上下留空)",
    bg: { r: 255, g: 214, b: 192, alpha: 1 },
  },
  // Favicon set
  { svg: FAVICON_SVG, name: "favicon-16.png", w: 16, h: 16, label: "Favicon 16×16" },
  { svg: FAVICON_SVG, name: "favicon-32.png", w: 32, h: 32, label: "Favicon 32×32" },
  { svg: FAVICON_SVG, name: "favicon-48.png", w: 48, h: 48, label: "Favicon 48×48 (Windows tile)" },
  { svg: FAVICON_SVG, name: "apple-touch-icon.png", w: 180, h: 180, label: "iOS 桌面 icon" },
  // PWA icons
  { svg: FAVICON_SVG, name: "icon-192.png", w: 192, h: 192, label: "PWA 192×192" },
  { svg: FAVICON_SVG, name: "icon-512.png", w: 512, h: 512, label: "PWA 512×512" },
  // Maskable icon (內含 padding，避免裁切到主視覺)
  {
    svg: FAVICON_SVG,
    name: "icon-maskable-512.png",
    w: 512,
    h: 512,
    padding: 80,
    bg: { r: 255, g: 131, b: 100, alpha: 1 },
    label: "PWA maskable 512×512 (含 padding)",
  },
];

for (const t of tasks) {
  const out = await svgToPng(t.svg, t.name, {
    width: t.w,
    height: t.h,
    padding: t.padding ?? 0,
    bg: t.bg ?? null,
  });
  const sizeKb = (statSync(out).size / 1024).toFixed(1);
  console.log(`  ✓ ${t.name.padEnd(28)} ${`${t.w}×${t.h}`.padEnd(11)} ${sizeKb} KB  — ${t.label}`);
}

console.log("\n[gen-images] All PNG assets generated to public/\n");
