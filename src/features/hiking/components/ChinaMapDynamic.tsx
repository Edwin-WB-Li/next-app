"use client";

import dynamic from "next/dynamic";
import type { HikingData } from "@/lib/hiking";

const ChinaMapInner = dynamic(() => import("@/components/china-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center rounded-xl border border-border bg-muted sm:h-[500px] lg:h-[600px]">
      <div className="flex items-center gap-2 text-muted-foreground">
        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm">加载地图中...</span>
      </div>
    </div>
  ),
});

interface ChinaMapDynamicProps {
  hikingData: HikingData;
}

export default function ChinaMapDynamic({ hikingData }: ChinaMapDynamicProps) {
  return <ChinaMapInner hikingData={hikingData} />;
}
