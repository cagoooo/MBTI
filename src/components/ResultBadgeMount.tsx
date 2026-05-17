"use client";

import { useEffect, useState } from "react";
import BadgeWall from "./BadgeWall";
import type { MBTIType } from "@/lib/types";

interface Props {
  type: MBTIType;
}

/** 結果頁專用：從 sessionStorage 讀 branch，然後驅動徽章解鎖 */
export default function ResultBadgeMount({ type }: Props) {
  const [branch, setBranch] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("mbti-result");
      if (raw) {
        const parsed = JSON.parse(raw) as { branch?: string };
        setBranch(parsed.branch);
      }
    } catch {}
    setReady(true);
  }, []);

  if (!ready) return null;
  return <BadgeWall newlyUnlocked={type} branch={branch} />;
}
