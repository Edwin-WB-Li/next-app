"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { cache } from "react";

export type Difficulty = "休闲" | "进阶" | "硬核";

export interface HikingRoute {
  id: string;
  name: string;
  date: string;
  days: number;
  distance: number;
  maxAltitude: number;
  difficulty: Difficulty;
  season: string;
  tags: string[];
  photos: string[];
  notesFile?: string;
}

export interface ProvinceData {
  code: string;
  name: string;
  routes: HikingRoute[];
}

export interface HikingData {
  provinces: ProvinceData[];
}

export interface RouteFormData {
  name: string;
  date: string;
  days: number;
  distance: number;
  maxAltitude: number;
  difficulty: Difficulty;
  season: string;
  tags: string[];
  photos: string[];
  notesContent?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const HIKING_FILE = path.join(DATA_DIR, "hiking.json");
const HIKING_DIR = path.join(DATA_DIR, "hiking");

const readHikingData = cache(async (): Promise<HikingData> => {
  try {
    const raw = await fs.readFile(HIKING_FILE, "utf-8");
    return JSON.parse(raw) as HikingData;
  } catch {
    return { provinces: [] };
  }
});

async function writeHikingData(data: HikingData) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(HIKING_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function ensureHikingDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(HIKING_DIR, { recursive: true });
}

export async function getHikingData(): Promise<HikingData> {
  return readHikingData();
}

export async function getProvinceData(code: string): Promise<ProvinceData | null> {
  const data = await readHikingData();
  const provinceMap = new Map(data.provinces.map((p) => [p.code, p]));
  return provinceMap.get(code) ?? null;
}

export async function getProvinceByName(name: string): Promise<ProvinceData | null> {
  const data = await readHikingData();
  const provinceMap = new Map(data.provinces.map((p) => [p.name, p]));
  return provinceMap.get(name) ?? null;
}

export async function getAllRoutes(): Promise<
  (HikingRoute & { provinceName: string; provinceCode: string })[]
> {
  const data = await readHikingData();
  return data.provinces.flatMap((p) =>
    p.routes.map((r) => ({
      ...r,
      provinceName: p.name,
      provinceCode: p.code,
    }))
  );
}

export async function getRouteNotes(notesFile?: string): Promise<string> {
  if (!notesFile) return "";
  try {
    const content = await fs.readFile(path.join(HIKING_DIR, notesFile), "utf-8");
    return content;
  } catch {
    return "";
  }
}

export interface HikingStats {
  provinceCount: number;
  totalDistance: number;
  totalRoutes: number;
  maxAltitude: number;
  totalDays: number;
}

export async function getHikingStats(): Promise<HikingStats> {
  const data = await readHikingData();
  const routes = data.provinces.flatMap((p) => p.routes);

  return {
    provinceCount: data.provinces.length,
    totalDistance: routes.reduce((sum, r) => sum + r.distance, 0),
    totalRoutes: routes.length,
    maxAltitude: routes.length > 0 ? Math.max(...routes.map((r) => r.maxAltitude)) : 0,
    totalDays: routes.reduce((sum, r) => sum + r.days, 0),
  };
}

export async function getRouteById(
  routeId: string
): Promise<(HikingRoute & { provinceCode: string; provinceName: string }) | null> {
  const data = await readHikingData();
  const routeMap = new Map<
    string,
    { route: HikingRoute; provinceCode: string; provinceName: string }
  >();
  for (const province of data.provinces) {
    for (const route of province.routes) {
      routeMap.set(route.id, {
        route,
        provinceCode: province.code,
        provinceName: province.name,
      });
    }
  }
  const found = routeMap.get(routeId);
  return found
    ? { ...found.route, provinceCode: found.provinceCode, provinceName: found.provinceName }
    : null;
}

export async function createProvince(name: string, code: string) {
  const data = await readHikingData();
  if (data.provinces.some((p) => p.code === code)) {
    throw new Error("省份编码已存在");
  }
  if (data.provinces.some((p) => p.name === name)) {
    throw new Error("省份名称已存在");
  }
  data.provinces.push({ name, code, routes: [] });
  await writeHikingData(data);
  revalidatePath("/hiking");
}

export async function createRoute(provinceCode: string, formData: RouteFormData) {
  const data = await readHikingData();
  const province = data.provinces.find((p) => p.code === provinceCode);
  if (!province) {
    throw new Error("省份不存在");
  }
  if (province.routes.some((r) => r.name === formData.name)) {
    throw new Error("该省份下已存在同名路线");
  }

  const id = crypto.randomUUID();
  const newRoute: HikingRoute = {
    id,
    name: formData.name,
    date: formData.date,
    days: formData.days,
    distance: formData.distance,
    maxAltitude: formData.maxAltitude,
    difficulty: formData.difficulty,
    season: formData.season,
    tags: formData.tags,
    photos: formData.photos,
  };

  if (formData.notesContent && formData.notesContent.trim()) {
    const notesFile = `${id}.md`;
    await ensureHikingDirs();
    await fs.writeFile(path.join(HIKING_DIR, notesFile), formData.notesContent, "utf-8");
    newRoute.notesFile = notesFile;
  }

  province.routes.push(newRoute);
  await writeHikingData(data);

  revalidatePath("/hiking");
  revalidatePath(`/hiking/${provinceCode}`);
  return newRoute;
}

export async function updateRoute(
  routeId: string,
  formData: RouteFormData & { provinceCode?: string }
) {
  const data = await readHikingData();

  // 找到路线所在省份
  let sourceProvinceIndex = -1;
  let routeIndex = -1;
  for (let i = 0; i < data.provinces.length; i++) {
    const idx = data.provinces[i].routes.findIndex((r) => r.id === routeId);
    if (idx !== -1) {
      sourceProvinceIndex = i;
      routeIndex = idx;
      break;
    }
  }

  if (sourceProvinceIndex === -1 || routeIndex === -1) {
    throw new Error("路线不存在");
  }

  const sourceProvince = data.provinces[sourceProvinceIndex];
  const route = sourceProvince.routes[routeIndex];

  // 检查同省份下名称重复（排除自身）
  const targetProvinceCode = formData.provinceCode || sourceProvince.code;
  const targetProvince = data.provinces.find((p) => p.code === targetProvinceCode);
  if (!targetProvince) {
    throw new Error("目标省份不存在");
  }
  if (targetProvince.routes.some((r) => r.name === formData.name && r.id !== routeId)) {
    throw new Error("目标省份下已存在同名路线");
  }

  // 更新路线数据
  const updatedRoute: HikingRoute = {
    ...route,
    name: formData.name,
    date: formData.date,
    days: formData.days,
    distance: formData.distance,
    maxAltitude: formData.maxAltitude,
    difficulty: formData.difficulty,
    season: formData.season,
    tags: formData.tags,
    photos: formData.photos,
  };

  // 处理随笔
  if (formData.notesContent !== undefined) {
    if (formData.notesContent.trim()) {
      const notesFile = route.notesFile || `${routeId}.md`;
      await ensureHikingDirs();
      await fs.writeFile(path.join(HIKING_DIR, notesFile), formData.notesContent, "utf-8");
      updatedRoute.notesFile = notesFile;
    } else if (route.notesFile) {
      // 清空内容时删除文件
      try {
        await fs.unlink(path.join(HIKING_DIR, route.notesFile));
      } catch {
        // ignore
      }
      delete updatedRoute.notesFile;
    }
  }

  // 如果更换省份，先从原省份移除，再添加到新省份
  if (targetProvinceCode !== sourceProvince.code) {
    sourceProvince.routes.splice(routeIndex, 1);
    targetProvince.routes.push(updatedRoute);
  } else {
    sourceProvince.routes[routeIndex] = updatedRoute;
  }

  await writeHikingData(data);

  revalidatePath("/hiking");
  revalidatePath(`/hiking/${sourceProvince.code}`);
  if (targetProvinceCode !== sourceProvince.code) {
    revalidatePath(`/hiking/${targetProvinceCode}`);
  }
  return updatedRoute;
}

export async function deleteRoute(routeId: string) {
  const data = await readHikingData();

  for (const province of data.provinces) {
    const index = province.routes.findIndex((r) => r.id === routeId);
    if (index !== -1) {
      const route = province.routes[index];
      // 删除关联的随笔文件
      if (route.notesFile) {
        try {
          await fs.unlink(path.join(HIKING_DIR, route.notesFile));
        } catch {
          // ignore
        }
      }
      province.routes.splice(index, 1);
      await writeHikingData(data);

      revalidatePath("/hiking");
      revalidatePath(`/hiking/${province.code}`);
      return;
    }
  }

  throw new Error("路线不存在");
}
