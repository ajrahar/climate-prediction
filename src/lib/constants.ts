import type { CityName } from "./types";

export const CITY_NAMES: CityName[] = [
  "Jakarta",
  "Bandung",
  "Semarang",
  "Yogyakarta",
  "Surabaya",
  "Malang",
];

export const SPLITS = ["90/10", "80/20", "70/30", "60/40", "50/50"] as const;

export const CITY_MAP_POINTS = [
  { name: "Jakarta" as CityName, lat: -6.2088, lon: 106.8456, color: "#e41a1c", zone: "Pesisir Utara", elev: 8 },
  { name: "Bandung" as CityName, lat: -6.9175, lon: 107.6191, color: "#377eb8", zone: "Dataran Tinggi", elev: 768 },
  { name: "Semarang" as CityName, lat: -6.9932, lon: 110.4203, color: "#4daf4a", zone: "Pesisir Utara", elev: 5 },
  { name: "Yogyakarta" as CityName, lat: -7.7956, lon: 110.3695, color: "#984ea3", zone: "Dataran Tengah", elev: 114 },
  { name: "Surabaya" as CityName, lat: -7.2575, lon: 112.7521, color: "#ff7f00", zone: "Pesisir Utara", elev: 6 },
  { name: "Malang" as CityName, lat: -7.9797, lon: 112.6304, color: "#a65628", zone: "Dataran Tinggi", elev: 445 },
] as const;

export function formatZone(zone: string): string {
  const labels: Record<string, string> = {
    pesisir_utara: "Pesisir Utara",
    dataran_tinggi: "Dataran Tinggi",
    dataran_tengah: "Dataran Tengah",
  };
  return labels[zone] ?? zone;
}

export function projectToMap(lat: number, lon: number, width = 520, height = 380) {
  const pad = 36;
  const minLon = 105.0;
  const maxLon = 114.8;
  const minLat = -8.85;
  const maxLat = -5.35;

  const x = pad + ((lon - minLon) / (maxLon - minLon)) * (width - pad * 2);
  const y = pad + ((maxLat - lat) / (maxLat - minLat)) * (height - pad * 2);

  return { x, y };
}

/** Siluet Pulau Jawa (lon, lat) — disederhanakan untuk visualisasi */
export const JAVA_OUTLINE: [number, number][] = [
  [105.25, -6.15],
  [105.65, -5.55],
  [106.4, -5.38],
  [107.8, -5.55],
  [109.2, -5.75],
  [110.8, -5.95],
  [112.2, -6.05],
  [113.6, -6.45],
  [114.35, -7.15],
  [114.55, -7.85],
  [114.2, -8.35],
  [113.2, -8.65],
  [112.1, -8.55],
  [111.0, -8.35],
  [109.8, -8.15],
  [108.6, -7.95],
  [107.5, -7.75],
  [106.5, -7.45],
  [105.8, -7.05],
  [105.35, -6.55],
  [105.25, -6.15],
];
