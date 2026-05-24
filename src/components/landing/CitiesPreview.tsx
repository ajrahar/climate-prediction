import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SummaryRow } from "@/lib/types";

interface Props {
  summary: SummaryRow[];
}

export default function CitiesPreview({ summary }: Props) {
  return (
    <section className="px-6 pb-20 pt-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-2xl font-bold">Performa per Kota</h2>
            <p className="mt-2 text-sm text-muted">
              Ensemble terbaik pada split 80/20 — bandingkan akurasi antar kota
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent transition hover:text-accent-light"
          >
            Analisis lengkap <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summary.map((city) => (
            <div
              key={city.city}
              className="glass card-hover rounded-2xl p-5"
              style={{ borderLeftColor: city.color, borderLeftWidth: 3 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{city.city}</h3>
                  <p className="text-xs text-muted">{city.zoneLabel} · {city.elev}m dpl</p>
                </div>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: `${city.color}18`, color: city.color }}
                >
                  R² {city.r2.toFixed(2)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-card p-2">
                  <p className="text-lg font-bold" style={{ color: city.color }}>
                    {city.meanTemp}°
                  </p>
                  <p className="text-[10px] text-muted uppercase">Rata-rata</p>
                </div>
                <div className="rounded-lg bg-card p-2">
                  <p className="text-lg font-bold">{city.rmse}</p>
                  <p className="text-[10px] text-muted uppercase">RMSE</p>
                </div>
                <div className="rounded-lg bg-card p-2">
                  <p className="text-lg font-bold text-emerald-600">+{city.improvement}%</p>
                  <p className="text-[10px] text-muted uppercase">vs Baseline</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
