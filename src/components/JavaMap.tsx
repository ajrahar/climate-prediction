"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  MarkerTooltip,
} from "@/components/ui/map";
import { CITY_MAP_POINTS } from "@/lib/constants";
import type { CityInfo, CityName } from "@/lib/types";

interface Props {
  showLegend?: boolean;
  linkToKota?: boolean;
  className?: string;
  cities?: Record<CityName, CityInfo>;
  /** Controlled: kota yang sedang aktif (dari luar) */
  activeCity?: CityName | null;
  /** Controlled: callback saat user klik marker */
  onCityChange?: (city: CityName) => void;
}

export default function JavaMap({
  showLegend = true,
  linkToKota = false,
  className = "",
  cities,
  activeCity,
  onCityChange,
}: Props) {
  // Jika activeCity diberikan dari luar, gunakan controlled mode
  const isControlled = activeCity !== undefined;
  const [internalActive, setInternalActive] = useState<string | null>(null);

  const active = isControlled ? activeCity : internalActive;

  function handleClick(name: CityName) {
    if (isControlled) {
      onCityChange?.(name);
    } else {
      setInternalActive(name);
    }
  }

  function handleMouseEnter(name: CityName) {
    if (!isControlled) setInternalActive(name);
  }

  function handleMouseLeave() {
    if (!isControlled) setInternalActive(null);
  }

  return (
    <div className={`glass rounded-2xl p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Peta Pulau Jawa</h3>
          <p className="text-xs text-muted">6 stasiun cuaca · NASA POWER</p>
        </div>
        {linkToKota && (
          <Link href="/kota" className="text-xs font-medium text-accent hover:text-accent-light">
            Detail kota →
          </Link>
        )}
      </div>

      <div className="h-[380px] overflow-hidden rounded-xl border border-card-border">
        <Map center={[110.4, -7.3]} zoom={6.8} theme="light" className="h-full w-full">
          <MapControls position="bottom-right" showZoom showCompass={false} />

          {CITY_MAP_POINTS.map((city) => {
            const info = cities?.[city.name];
            const isActive = active === city.name;

            return (
              <MapMarker
                key={city.name}
                longitude={city.lon}
                latitude={city.lat}
                onClick={() => handleClick(city.name)}
                onMouseEnter={() => handleMouseEnter(city.name)}
                onMouseLeave={handleMouseLeave}
              >
                <MarkerContent>
                  <div
                    className="relative flex items-center justify-center transition-transform"
                    style={{ transform: isActive ? "scale(1.2)" : "scale(1)" }}
                  >
                    <span
                      className="absolute h-6 w-6 rounded-full opacity-20"
                      style={{ backgroundColor: city.color }}
                    />
                    <span
                      className="relative h-3.5 w-3.5 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: city.color }}
                    />
                  </div>
                  <MarkerLabel className="text-[11px] font-semibold text-foreground">
                    {city.name}
                  </MarkerLabel>
                </MarkerContent>

                <MarkerTooltip className="rounded-lg bg-white px-2 py-1 text-xs font-medium shadow-md">
                  {city.name} · {city.zone}
                </MarkerTooltip>

                <MarkerPopup closeButton className="rounded-xl bg-white p-3 text-sm shadow-lg">
                  <p className="font-semibold" style={{ color: city.color }}>
                    {city.name}
                  </p>
                  <p className="text-xs text-muted">
                    {city.zone} · {city.elev}m dpl
                  </p>
                  {info && (
                    <div className="mt-2 space-y-1 text-xs">
                      <p>
                        Suhu rata-rata:{" "}
                        <span className="font-medium">{info.stats.meanTemp}°C</span>
                      </p>
                      <p>
                        Range: {info.stats.minTemp}°C – {info.stats.maxTemp}°C
                      </p>
                      <p className="text-muted">
                        {info.stats.dataPoints.toLocaleString()} titik data
                      </p>
                    </div>
                  )}
                </MarkerPopup>
              </MapMarker>
            );
          })}
        </Map>
      </div>

      {showLegend && active && (
        <div className="mt-4 rounded-xl border border-card-border bg-card px-4 py-3 text-sm">
          {CITY_MAP_POINTS.filter((c) => c.name === active).map((c) => {
            const info = cities?.[c.name];
            return (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted">· {c.zone}</span>
                </div>
                <span className="text-muted">
                  {info ? `${info.stats.meanTemp}°C · ` : ""}
                  {c.elev}m dpl
                </span>
              </div>
            );
          })}
        </div>
      )}

      {showLegend && !active && (
        <p className="mt-3 text-center text-xs text-muted">
          Klik atau arahkan kursor ke marker kota untuk detail
        </p>
      )}
    </div>
  );
}
