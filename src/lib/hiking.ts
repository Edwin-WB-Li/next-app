"use server";

import fs from "fs/promises";
import path from "path";

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

const DATA_DIR = path.join(process.cwd(), "data");
const HIKING_FILE = path.join(DATA_DIR, "hiking.json");
const HIKING_DIR = path.join(DATA_DIR, "hiking");

async function readHikingData(): Promise<HikingData> {
  try {
    const raw = await fs.readFile(HIKING_FILE, "utf-8");
    return JSON.parse(raw) as HikingData;
  } catch {
    return { provinces: [] };
  }
}

export async function getHikingData(): Promise<HikingData> {
  return readHikingData();
}

export async function getProvinceData(
  code: string
): Promise<ProvinceData | null> {
  const data = await readHikingData();
  return data.provinces.find((p) => p.code === code) ?? null;
}

export async function getProvinceByName(
  name: string
): Promise<ProvinceData | null> {
  const data = await readHikingData();
  return data.provinces.find((p) => p.name === name) ?? null;
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

export async function getRouteNotes(
  notesFile?: string
): Promise<string> {
  if (!notesFile) return "";
  try {
    const content = await fs.readFile(
      path.join(HIKING_DIR, notesFile),
      "utf-8"
    );
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
