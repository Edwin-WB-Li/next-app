"use client";

import type { HikingData } from "@/lib/hiking";
import type { ECharts, EChartsOption, ECElementEvent, DefaultLabelFormatterCallbackParams } from "echarts";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";

interface GeoJsonFeature {
  properties: {
    name: string;
  };
}

interface GeoJsonData {
  features: GeoJsonFeature[];
}

interface MapDataItem {
  name: string;
  value: number;
  code: string | undefined;
  itemStyle: {
    areaColor: string;
    borderColor: string;
    borderWidth: number;
  };
  emphasis: {
    itemStyle: {
      areaColor: string;
      shadowBlur: number;
      shadowColor: string;
    };
  };
  select: {
    itemStyle: {
      areaColor: string;
    };
  };
}

interface ChinaMapProps {
  hikingData: HikingData;
}

const CHINA_GEOJSON_URL =
  "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json";

// 中国各省份名称与行政区划代码的映射
const provinceNameToCode: Record<string, string> = {
  北京市: "110000",
  天津市: "120000",
  河北省: "130000",
  山西省: "140000",
  内蒙古自治区: "150000",
  辽宁省: "210000",
  吉林省: "220000",
  黑龙江省: "230000",
  上海市: "310000",
  江苏省: "320000",
  浙江省: "330000",
  安徽省: "340000",
  福建省: "350000",
  江西省: "360000",
  山东省: "370000",
  河南省: "410000",
  湖北省: "420000",
  湖南省: "430000",
  广东省: "440000",
  广西壮族自治区: "450000",
  海南省: "460000",
  重庆市: "500000",
  四川省: "510000",
  贵州省: "520000",
  云南省: "530000",
  西藏自治区: "540000",
  陕西省: "610000",
  甘肃省: "620000",
  青海省: "630000",
  宁夏回族自治区: "640000",
  新疆维吾尔自治区: "650000",
  台湾省: "710000",
  香港特别行政区: "810000",
  澳门特别行政区: "820000",
};

// 兼容简写名称
const nameAlias: Record<string, string> = {
  北京: "北京市",
  天津: "天津市",
  河北: "河北省",
  山西: "山西省",
  内蒙古: "内蒙古自治区",
  辽宁: "辽宁省",
  吉林: "吉林省",
  黑龙江: "黑龙江省",
  上海: "上海市",
  江苏: "江苏省",
  浙江: "浙江省",
  安徽: "安徽省",
  福建: "福建省",
  江西: "江西省",
  山东: "山东省",
  河南: "河南省",
  湖北: "湖北省",
  湖南: "湖南省",
  广东: "广东省",
  广西: "广西壮族自治区",
  海南: "海南省",
  重庆: "重庆市",
  四川: "四川省",
  贵州: "贵州省",
  云南: "云南省",
  西藏: "西藏自治区",
  陕西: "陕西省",
  甘肃: "甘肃省",
  青海: "青海省",
  宁夏: "宁夏回族自治区",
  新疆: "新疆维吾尔自治区",
  台湾: "台湾省",
  香港: "香港特别行政区",
  澳门: "澳门特别行政区",
};

function getProvinceCode(name: string): string | undefined {
  const fullName = nameAlias[name] || name;
  return provinceNameToCode[fullName];
}

export default function ChinaMap({ hikingData }: ChinaMapProps) {
  const router = useRouter();
  const topLoader = useTopLoader();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 构建名称到路线数的映射，同时支持简称和全称
  const visitedProvinces = new Map<string, number>();
  hikingData.provinces.forEach((p) => {
    visitedProvinces.set(p.name, p.routes.length);
    const fullName = nameAlias[p.name];
    if (fullName) visitedProvinces.set(fullName, p.routes.length);
  });

  const initChart = useCallback(async () => {
    if (!chartRef.current) return;

    try {
      const echarts = await import("echarts");

      // 读取 CSS 变量实际值（Canvas 不支持 CSS 变量）
      const style = getComputedStyle(document.documentElement);
      const hikingPrimary = style.getPropertyValue("--hiking-primary").trim() || "#4a7c59";
      const hikingSecondary = style.getPropertyValue("--hiking-secondary").trim() || "#8b6914";
      const cardBg = style.getPropertyValue("--card").trim() || "#ffffff";
      const borderColor = style.getPropertyValue("--border").trim() || "#e4e4e7";
      const foreground = style.getPropertyValue("--foreground").trim() || "#18181b";
      const mutedFg = style.getPropertyValue("--muted-foreground").trim() || "#71717a";

      // 获取中国地图 geoJSON
      const response = await fetch(CHINA_GEOJSON_URL);
      if (!response.ok) {
        throw new Error("地图数据加载失败");
      }
      const geoJson = (await response.json()) as GeoJsonData;
      echarts.registerMap("china", geoJson as any);

      const chart = echarts.init(chartRef.current, undefined, {
        renderer: "canvas",
      });
      chartInstanceRef.current = chart;

      // 构建地图数据
      const mapData = geoJson.features
        .map((feature: GeoJsonFeature) => {
          const name = feature.properties.name;
          const routeCount = visitedProvinces.get(name) || 0;
          const code = getProvinceCode(name);
          return {
            name,
            value: routeCount,
            code,
            itemStyle: {
              areaColor:
                routeCount > 0 ? hikingPrimary : "#d1d5db",
              borderColor: "#ffffff",
              borderWidth: 1,
            },
            emphasis: {
              itemStyle: {
                areaColor:
                  routeCount > 0 ? hikingSecondary : "#d1d5db",
                shadowBlur: 10,
                shadowColor: "rgba(0, 0, 0, 0.2)",
              },
            },
            select: {
              itemStyle: {
                areaColor:
                  routeCount > 0 ? hikingSecondary : "#d1d5db",
              },
            },
          };
        })
        .filter((item: MapDataItem) => item.name);

      const option = {
        tooltip: {
          trigger: "item",
          backgroundColor: cardBg,
          borderColor: borderColor,
          borderWidth: 1,
          textStyle: {
            color: foreground,
          },
          formatter: (params: DefaultLabelFormatterCallbackParams) => {
            const count = (params.value as number) || 0;
            if (count > 0) {
              return `<div style="font-weight:600">${params.name}</div><div style="margin-top:4px;color:${hikingPrimary}">${count} 条路线</div>`;
            }
            return `<div style="font-weight:600">${params.name}</div><div style="margin-top:4px;color:${mutedFg}">暂未打卡</div>`;
          },
        },
        series: [
          {
            type: "map",
            map: "china",
            roam: true,
            zoom: 1.2,
            center: [105, 36],
            label: {
              show: false,
            },
            emphasis: {
              label: {
                show: true,
                color: "#fff",
                fontSize: 12,
                fontWeight: "bold",
              },
            },
            select: {
              disabled: true,
            },
            data: mapData,
          },
        ],
      };

      chart.setOption(option as EChartsOption);

      // 点击事件
      chart.on("click", (params: ECElementEvent) => {
        const data = params.data as { code?: string; value?: number } | undefined;
        const code = data?.code;
        const value = data?.value;
        if (code && value && value > 0) {
          topLoader.start();
          router.push(`/hiking/${code}`);
        }
      });

      // 响应式
      const handleResize = () => chart.resize();
      window.addEventListener("resize", handleResize);

      setLoading(false);

      return () => {
        window.removeEventListener("resize", handleResize);
        chart.dispose();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "地图加载失败");
      setLoading(false);
    }
  }, [hikingData, router, visitedProvinces]);

  useEffect(() => {
    const cleanup = initChart();
    return () => {
      cleanup?.then((fn) => fn?.());
    };
  }, [initChart]);

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl border border-border bg-muted">
        <div className="text-center">
          <p className="text-muted-foreground">{error}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            请检查网络连接后刷新页面
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/80">
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg
              className="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm">加载地图中...</span>
          </div>
        </div>
      )}
      <div
        ref={chartRef}
        className="h-[400px] w-full rounded-xl border border-border sm:h-[500px] lg:h-[600px]"
      />
    </div>
  );
}
