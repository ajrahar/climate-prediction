"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CityName } from "@/lib/types";

interface PredictionPoint {
  date: string;
  actual: number;
  ensemble: number;
  lstm: number;
  gru: number;
  transformer: number;
}

type PredictionsData = Record<string, Record<string, PredictionPoint[]>>;

interface Props {
  selectedCity: CityName;
  selectedSplit: string;
  cityColor: string;
}

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#0f172a",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

type ModelKey = "ensemble" | "lstm" | "gru" | "transformer";

const MODEL_COLORS: Record<ModelKey, string> = {
  ensemble: "#e41a1c",
  lstm: "#06b6d4",
  gru: "#8b5cf6",
  transformer: "#f97316",
};

export default function PredictionChart({ selectedCity, selectedSplit, cityColor }: Props) {
  const [data, setData] = useState<PredictionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleModels, setVisibleModels] = useState<Record<string, boolean>>({
    actual: true,
    ensemble: true,
    lstm: false,
    gru: false,
    transformer: false,
  });

  useEffect(() => {
    fetch("/data/predictions.json")
      .then((r) => {
        if (!r.ok) throw new Error("Gagal memuat data prediksi");
        return r.json();
      })
      .then((d: PredictionsData) => {
        setData(d);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const toggleModel = (model: string) => {
    setVisibleModels((prev) => ({ ...prev, [model]: !prev[model] }));
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-5">
        <h3 className="font-semibold">Suhu Aktual vs Prediksi</h3>
        <p className="mb-4 text-xs text-muted">Memuat data...</p>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass rounded-2xl p-5">
        <h3 className="font-semibold">Suhu Aktual vs Prediksi</h3>
        <p className="mb-4 text-xs text-muted text-red-500">
          {error ?? "Data tidak tersedia"}
        </p>
      </div>
    );
  }

  const cityData = data[selectedCity];
  const splitData = cityData?.[selectedSplit] ?? [];

  if (splitData.length === 0) {
    return (
      <div className="glass rounded-2xl p-5">
        <h3 className="font-semibold">Suhu Aktual vs Prediksi</h3>
        <p className="mb-4 text-xs text-muted">
          {selectedCity} · Split {selectedSplit} · Data test set
        </p>
        <div className="flex h-64 items-center justify-center text-muted text-sm">
          Data tidak tersedia untuk kombinasi ini
        </div>
      </div>
    );
  }

  // Compute residuals for scatter-like insight
  const avgError =
    splitData.reduce((sum, d) => sum + Math.abs(d.actual - d.ensemble), 0) /
    splitData.length;

  const modelEntries: { key: ModelKey; label: string; color: string }[] = [
    { key: "ensemble", label: "Ensemble", color: cityColor },
    { key: "lstm", label: "LSTM", color: MODEL_COLORS.lstm },
    { key: "gru", label: "GRU", color: MODEL_COLORS.gru },
    { key: "transformer", label: "Transformer", color: MODEL_COLORS.transformer },
  ];

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">Suhu Aktual vs Prediksi</h3>
          <p className="text-xs text-muted">
            {selectedCity} · Split {selectedSplit} · Data test set
          </p>
        </div>
        <div className="text-right text-xs text-muted">
          <span className="font-medium text-foreground">MAE rata-rata: </span>
          <span className="font-bold" style={{ color: cityColor }}>
            {avgError.toFixed(3)}°C
          </span>
        </div>
      </div>

      {/* Toggle buttons */}
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          onClick={() => toggleModel("actual")}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition ring-1 ${
            visibleModels.actual
              ? "bg-slate-700 text-white ring-slate-700"
              : "bg-card text-muted ring-card-border"
          }`}
        >
          Aktual
        </button>
        {modelEntries.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => toggleModel(key)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ring-1 ${
              visibleModels[key] ? "text-white ring-transparent" : "bg-card text-muted ring-card-border"
            }`}
            style={visibleModels[key] ? { backgroundColor: color } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={splitData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#94a3b8", fontSize: 9 }}
            tickFormatter={(v: string) => v.slice(0, 7)}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            domain={["auto", "auto"]}
            tickFormatter={(v: number) => `${v}°`}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: "#0f172a", fontWeight: 600 }}
            formatter={(value, name) => [
              typeof value === "number" ? `${value.toFixed(2)}°C` : String(value ?? ""),
              String(name ?? ""),
            ]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />

          {visibleModels.actual && (
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#334155"
              strokeWidth={1.5}
              dot={false}
              name="Aktual"
              strokeDasharray="4 2"
            />
          )}
          {modelEntries.map(({ key, label, color }) =>
            visibleModels[key] ? (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={key === "ensemble" ? cityColor : color}
                strokeWidth={key === "ensemble" ? 2 : 1.2}
                dot={false}
                name={label}
                opacity={key === "ensemble" ? 1 : 0.75}
              />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Error band summary */}
      <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs">
        {[
          {
            label: "Titik data",
            value: splitData.length.toLocaleString(),
            unit: "",
          },
          {
            label: "Error maks",
            value: Math.max(...splitData.map((d) => Math.abs(d.actual - d.ensemble))).toFixed(2),
            unit: "°C",
          },
          {
            label: "Error min",
            value: Math.min(...splitData.map((d) => Math.abs(d.actual - d.ensemble))).toFixed(2),
            unit: "°C",
          },
        ].map(({ label, value, unit }) => (
          <div key={label} className="rounded-lg bg-slate-50 px-2 py-2 dark:bg-slate-800/40">
            <p className="text-muted">{label}</p>
            <p className="mt-0.5 font-semibold text-foreground">
              {value}
              {unit && <span className="ml-0.5 font-normal text-muted">{unit}</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
