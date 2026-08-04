import { notFound } from "next/navigation";
import { getHikingData, getRouteById, getRouteNotes, updateRoute } from "@/lib/hiking";
import type { RouteFormData } from "@/lib/hiking";
import RouteForm from "@/components/route-form";

interface EditRoutePageProps {
  params: Promise<{ routeId: string }>;
}

export async function generateMetadata({ params }: EditRoutePageProps) {
  const { routeId } = await params;
  const route = await getRouteById(routeId);
  return {
    title: route ? `编辑：${route.name} | 我的博客` : "编辑路线 | 我的博客",
  };
}

export default async function EditRoutePage({ params }: EditRoutePageProps) {
  const { routeId } = await params;
  const [route, hikingData] = await Promise.all([getRouteById(routeId), getHikingData()]);

  if (!route) {
    notFound();
  }

  const notes = await getRouteNotes(route.notesFile);

  async function handleSubmit(submitData: {
    provinceCode: string;
    newProvinceName?: string;
    routeData: RouteFormData;
  }) {
    "use server";
    const newProvinceName = submitData.newProvinceName;
    if (newProvinceName) {
      await import("@/lib/hiking").then((mod) =>
        mod.createProvince(newProvinceName, submitData.provinceCode)
      );
    }
    await updateRoute(routeId, {
      ...submitData.routeData,
      provinceCode: submitData.provinceCode,
    });
    return {};
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">编辑路线</h1>
        <p className="mt-1 text-sm text-muted-foreground">修改「{route.name}」的信息</p>
      </div>
      <RouteForm
        provinces={hikingData.provinces}
        initialData={{
          name: route.name,
          date: route.date,
          days: route.days,
          distance: route.distance,
          maxAltitude: route.maxAltitude,
          difficulty: route.difficulty,
          season: route.season,
          tags: route.tags,
          photos: route.photos,
          notesContent: notes,
          provinceCode: route.provinceCode,
        }}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
