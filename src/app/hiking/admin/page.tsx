import Link from "next/link";
import { getAllRoutes } from "@/lib/hiking";
import DeleteRouteButton from "@/components/delete-route-button";

export const metadata = {
  title: "行程管理 | 我的博客",
};

export default async function AdminPage() {
  const routes = await getAllRoutes();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 头部 */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">行程管理</h1>
          <p className="text-muted-foreground mt-1 text-sm">共 {routes.length} 条徒步路线</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/hiking"
            className="border-border bg-background text-foreground hover:bg-muted rounded-md border px-4 py-2 text-sm font-medium transition-colors"
          >
            返回地图
          </Link>
          <Link
            href="/hiking/admin/new"
            className="rounded-md bg-[var(--hiking-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          >
            新增路线
          </Link>
        </div>
      </div>

      {/* 路线列表 */}
      {routes.length === 0 ? (
        <div className="border-border bg-card flex flex-col items-center justify-center rounded-xl border py-16">
          <p className="text-muted-foreground">暂无徒步路线</p>
          <Link
            href="/hiking/admin/new"
            className="mt-3 text-sm text-[var(--hiking-primary)] hover:underline"
          >
            添加第一条路线
          </Link>
        </div>
      ) : (
        <div className="border-border overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-foreground px-4 py-3 text-left font-medium">路线名称</th>
                <th className="text-foreground hidden px-4 py-3 text-left font-medium sm:table-cell">
                  省份
                </th>
                <th className="text-foreground hidden px-4 py-3 text-left font-medium md:table-cell">
                  日期
                </th>
                <th className="text-foreground hidden px-4 py-3 text-left font-medium md:table-cell">
                  难度
                </th>
                <th className="text-foreground hidden px-4 py-3 text-left font-medium lg:table-cell">
                  距离
                </th>
                <th className="text-foreground px-4 py-3 text-right font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {routes.map((route) => (
                <tr key={route.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/hiking/${route.provinceCode}#${route.id}`}
                      className="text-foreground font-medium hover:text-[var(--hiking-primary)]"
                    >
                      {route.name}
                    </Link>
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-3 sm:table-cell">
                    {route.provinceName}
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-3 md:table-cell">
                    {route.date}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        route.difficulty === "休闲"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : route.difficulty === "进阶"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                            : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                      }`}
                    >
                      {route.difficulty}
                    </span>
                  </td>
                  <td className="text-muted-foreground hidden px-4 py-3 lg:table-cell">
                    {route.distance} km
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/hiking/admin/edit/${route.id}`}
                        className="rounded px-2 py-1 text-xs text-[var(--hiking-primary)] hover:bg-[var(--hiking-muted)]"
                      >
                        编辑
                      </Link>
                      <DeleteRouteButton routeId={route.id} routeName={route.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
