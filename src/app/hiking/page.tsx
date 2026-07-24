import Link from "next/link";
import { getHikingData, getHikingStats } from "@/lib/hiking";
import HikingStats from "@/components/hiking-stats";
import ChinaMap from "@/components/china-map";

function IconSliders() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export const metadata = {
  title: "旅行足迹 | 我的博客",
  description: "记录我的户外徒步足迹，可视化展示全国各省徒步行程",
};

export default async function HikingPage() {
  const [stats, hikingData] = await Promise.all([
    getHikingStats(),
    getHikingData(),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              徒步足迹
            </h1>
            <p className="mt-2 text-muted-foreground">
              用双脚丈量山河，记录每一次出发与抵达
            </p>
          </div>
          <Link
            href="/hiking/admin"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <IconSliders />
            管理行程
          </Link>
        </div>
      </div>

      {/* 统计面板 */}
      <section className="mb-8">
        <HikingStats stats={stats} />
      </section>

      {/* 交互地图 */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            全国徒步地图
          </h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-[var(--hiking-primary)]" />
              <span>已打卡</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-gray-300" />
              <span>未到访</span>
            </div>
          </div>
        </div>
        <ChinaMap hikingData={hikingData} />
      </section>

      {/* 已打卡省份列表 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          已打卡省份
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hikingData.provinces.map((province) => (
            <a
              key={province.code}
              href={`/hiking/${province.code}`}
              className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-[var(--hiking-primary)] hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-foreground group-hover:text-[var(--hiking-primary)]">
                    {province.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {province.routes.length} 条路线 ·{" "}
                    {province.routes.reduce((sum, r) => sum + r.distance, 0)} km
                  </p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--hiking-primary-light)] text-[var(--hiking-primary)] transition-colors group-hover:bg-[var(--hiking-primary)] group-hover:text-white">
                  <IconChevronRight />
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {province.routes.map((route) => (
                  <span
                    key={route.id}
                    className="inline-flex items-center rounded-md bg-[var(--hiking-muted)] px-2 py-0.5 text-xs text-[var(--hiking-primary)]"
                  >
                    {route.name}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
