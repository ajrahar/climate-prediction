import fs from "fs";
import path from "path";
import type { DashboardData } from "./types";

export function getDashboardData(): DashboardData {
  const file = path.join(process.cwd(), "public/data/dashboard.json");
  return JSON.parse(fs.readFileSync(file, "utf-8")) as DashboardData;
}
