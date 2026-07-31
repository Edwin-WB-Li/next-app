import Link from "next/link";
import { notFound } from "next/navigation";
import { getProvinceData, getRouteNotes } from "@/lib/hiking";
import RouteCard from "@/components/route-card";
import PhotoGallery from "@/components/photo-gallery";
import MarkdownRenderer from "@/components/markdown-renderer";
import ScrollToTop from "@/components/scroll-to-top";

interface ProvincePageProps {
  params: Promise<{ provinceCode: string }>;
}

export async function generateMetadata({ params }: ProvincePageProps) {
  const { provinceCode } = await params;
  const province = await getProvinceData(provinceCode);
  if (!province) {
    return { title: "未找到 | 我的博客" };
  }
  return {
    title: `${province.name}旅行足迹 | 我的博客`,
    description: `记录我在${province.name}的${province.routes.length}条徒步路线`,
  };
}

export default async function ProvincePage({ params }: ProvincePageProps) {
  const { provinceCode } = await params;
  const province = await getProvinceData(provinceCode);

  if (!province) {
    notFound();
  }

  const totalDistance = province.routes.reduce((sum, r) => sum + r.distance, 0);
  const totalDays = province.routes.reduce((sum, r) => sum + r.days, 0);
  const maxAltitude = Math.max(...province.routes.map((r) => r.maxAltitude));

  // 并行获取所有路线的随笔
  const notesMap = new Map<string, string>();
  await Promise.all(
    province.routes.map(async (route) => {
      if (route.notesFile) {
        const notes = await getRouteNotes(route.notesFile);
        notesMap.set(route.id, notes);
      }
    })
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 返回导航 */}
      <div className="mb-6">
        <Link
          href="/hiking"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          返回旅行足迹
        </Link>
      </div>

      {/* 省份头部 */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {province.name}
            </h1>
            <p className="mt-2 text-muted-foreground">
              共 {province.routes.length} 条徒步路线 · 累计{" "}
              {totalDistance} km · {totalDays} 天
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* <Link
              href="/hiking/admin"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
              管理
            </Link> */}
            <div className="flex gap-3">
              <div className="rounded-xl border border-border bg-card px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">最高海拔</p>
                <p className="text-xl font-bold text-[var(--hiking-primary)]">
                  {maxAltitude}
                  <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                    m
                  </span>
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">总里程</p>
                <p className="text-xl font-bold text-[var(--hiking-primary)]">
                  {totalDistance}
                  <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                    km
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 路线列表 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          徒步路线
        </h2>
        <div className="space-y-4">
          {province.routes.map((route, index) => (
              <div key={route.id} className="space-y-4">
                <RouteCard route={route} index={index} />

                {/* 展开时才显示的内容放在这里 */}
                {/* 实际上 RouteCard 有自己的展开状态，所以我们把图片和随笔放在 RouteCard 外部 */}
                {/* 更好的方式是重构 RouteCard 让它接收 children */}
              </div>
          ))}
        </div>
      </section>

      <ScrollToTop />

      {/* 各路线详情（图片 + 随笔） */}
      <section className="mt-8 space-y-10">
        {province.routes.map((route, index) => {
          const notes = notesMap.get(route.id) || "";
          return (
            <article
              key={route.id}
              id={route.id}
              className="rounded-xl border border-border bg-card p-5 sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--hiking-primary-light)] text-sm font-bold text-[var(--hiking-primary)]">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">
                    {route.name}
                  </h3>
                </div>
                <Link
                  href={`/hiking/admin/edit/${route.id}`}
                  className="rounded-md px-2 py-1 text-xs text-[var(--hiking-primary)] hover:bg-[var(--hiking-muted)]"
                >
                  编辑
                </Link>
              </div>

              {/* 图片画廊 */}
              {route.photos.length > 0 && (
                <div className="mb-6">
                  <PhotoGallery photos={route.photos} title="路线实拍" />
                </div>
              )}

              {/* 徒步随笔 */}
              {notes && (
                <div className="prose-hiking">
                  <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                    徒步随笔
                  </h4>
                  <div className="rounded-lg border border-border bg-muted/30 p-4 sm:p-5">
                    <MarkdownRenderer content={notes} />
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
