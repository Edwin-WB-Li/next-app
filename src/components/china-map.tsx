"use client";

import type { HikingData } from "@/lib/hiking";
import type { ECharts, EChartsOption, ECElementEvent, DefaultLabelFormatterCallbackParams } from "echarts";
import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";
import { IconSpinner } from "@/shared/components/icons";
import { getProvinceCode, nameAlias } from "@/features/hiking/province-data";

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

export default function ChinaMap({ hikingData }: ChinaMapProps) {
  const router = useRouter();
  const topLoader = useTopLoader();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 构建名称到路线数的映射，同时支持简称和全称
  const visitedProvinces = useMemo(() => {
    const map = new Map<string, number>();
    hikingData.provinces.forEach((p) => {
      map.set(p.name, p.routes.length);
      const fullName = nameAlias[p.name];
      if (fullName) map.set(fullName, p.routes.length);
    });
    return map;
  }, [hikingData]);

  useEffect(() => {
    if (!chartRef.current) return;

    let disposed = false;
    let chart: ECharts | null = null;

    async function init() {
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
        // @ts-expect-error ECharts registerMap accepts GeoJSON-like objects at runtime
        echarts.registerMap("china", geoJson);

        chart = echarts.init(chartRef.current!, undefined, {
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
        const handleResize = () => chart!.resize();
        window.addEventListener("resize", handleResize);

        if (!disposed) {
          setLoading(false);
        }

        return () => {
          window.removeEventListener("resize", handleResize);
          chart!.dispose();
        };
      } catch (err) {
        if (!disposed) {
          setError(err instanceof Error ? err.message : "地图加载失败");
          setLoading(false);
        }
      }
    }

    const cleanupPromise = init();

    return () => {
      disposed = true;
      chartInstanceRef.current = null;
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, [hikingData, visitedProvinces, router, topLoader]);

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
            <IconSpinner />
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
