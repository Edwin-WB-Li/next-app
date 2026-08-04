import { getHikingData, createProvince, createRoute } from "@/lib/hiking";
import type { RouteFormData } from "@/lib/hiking";
import RouteForm from "@/components/route-form";

export const metadata = {
  title: "新增路线 | 我的博客",
};

export default async function NewRoutePage() {
  const data = await getHikingData();

  async function handleSubmit(submitData: {
    provinceCode: string;
    newProvinceName?: string;
    routeData: RouteFormData;
  }) {
    "use server";
    if (submitData.newProvinceName) {
      await createProvince(submitData.newProvinceName, submitData.provinceCode);
    }
    await createRoute(submitData.provinceCode, submitData.routeData);
    return {};
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">新增路线</h1>
        <p className="mt-1 text-sm text-muted-foreground">记录一段新的徒步经历</p>
      </div>
      <RouteForm provinces={data.provinces} onSubmit={handleSubmit} />
    </main>
  );
}
