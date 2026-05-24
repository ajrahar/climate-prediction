"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Droplets,
  Gauge,
  MapPin,
  Thermometer,
  TrendingUp,
  Wind,
} from "lucide-react";
import type { CityName, DashboardData } from "@/lib/types";
import { CITY_NAMES, SPLITS } from "@/lib/constants";
import JavaMap from "@/components/JavaMap";
import PredictionChart from "@/components/dashboard/PredictionChart";

interface Props {
  data: DashboardData;
}

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#0f172a",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

export default function DashboardClient({ data }: Props) {
  const [selectedCity, setSelectedCity] = useState<CityName>("Jakarta");
  const [selectedSplit, setSelectedSplit] = useState<string>(data.bestSplit);

  const city = data.cities[selectedCity];
  const cityMetrics = useMemo(
    () => data.metrics.filter((m) => m.kota === selectedCity),
    [data.metrics, selectedCity]
  );
  const currentMetric = cityMetrics.find((m) => m.split === selectedSplit);

  const rmseComparison = useMemo(
    () =>
      data.summary.map((s) => ({
        city: s.city,
        rmse: s.rmse,
        r2: s.r2,
        color: s.color,
      })),
    [data.summary]
  );

  const modelComparison = currentMetric
    ? [
        { model: "Baseline", rmse: currentMetric.rmseBaseline },
        { model: "LSTM", rmse: currentMetric.rmseLstm },
        { model: "GRU", rmse: currentMetric.rmseGru },
        { model: "Transformer", rmse: currentMetric.rmseTransformer },
        { model: "Ensemble", rmse: currentMetric.rmseEnsemble },
      ]
    : [];

  const splitTrend = cityMetrics.map((m) => ({
    split: m.split,
    ensemble: m.rmseEnsemble,
    baseline: m.rmseBaseline,
    r2: m.r2,
  }));

  const valLossData = SPLITS.map((split) => {
    const entry = data.valLoss[selectedCity][split];
    return {
      split,
      LSTM: entry?.lstm ?? 0,
      GRU: entry?.gru ?? 0,
      Transformer: entry?.tr ?? 0,
    };
  });

  const monthlyChart = city.monthly.filter((_, i) => i % 3 === 0);
  const recentTemp = city.stats.recent.filter((_, i) => i % 7 === 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {CITY_NAMES.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedCity(name)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                selectedCity === name
                  ? "bg-accent text-slate-950"
                  : "bg-card text-muted hover:text-foreground ring-1 ring-card-border"
              }`}
              style={
                selectedCity === name
                  ? { backgroundColor: data.cities[name].color, color: "#fff" }
                  : undefined
              }
            >
              {name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {SPLITS.map((split) => (
            <button
              key={split}
              onClick={() => setSelectedSplit(split)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                selectedSplit === split
                  ? "ring-2 ring-accent bg-cyan-50 text-accent"
                  : "bg-card text-muted ring-1 ring-card-border hover:text-foreground"
              }`}
            >
              {split}
            </button>
          ))}
        </div>
      </div>

      {/* Peta Pulau Jawa — auto-select sesuai kota yang dipilih */}
      <div className="mb-8">
        <JavaMap
          cities={data.cities}
          activeCity={selectedCity}
          onCityChange={setSelectedCity}
          showLegend
          linkToKota
        />
      </div>

      {currentMetric && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          {[
            { icon: Thermometer, label: "RMSE Ensemble", value: currentMetric.rmseEnsemble, unit: "°C" },
            { icon: Gauge, label: "R² Score", value: currentMetric.r2, unit: "" },
            { icon: Activity, label: "MAE", value: currentMetric.mae, unit: "°C" },
            { icon: TrendingUp, label: "MAPE", value: currentMetric.mape, unit: "%" },
            { icon: TrendingUp, label: "Improvement", value: currentMetric.improvement, unit: "%", highlight: true },
            { icon: MapPin, label: "Elevasi", value: city.elev, unit: "m dpl" },
          ].map(({ icon: Icon, label, value, unit, highlight }) => (
            <div key={label} className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted">
                <Icon className="h-4 w-4" />
                <span className="text-xs">{label}</span>
              </div>
              <p className={`mt-2 text-2xl font-bold ${highlight ? "text-emerald-600" : ""}`}>
                {value}
                <span className="ml-1 text-sm font-normal text-muted">{unit}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Tren Suhu Bulanan" subtitle={`${selectedCity} · 2000–2026`}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyChart}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={city.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={city.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} tickFormatter={(v) => v.slice(0, 4)} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "#0f172a" }} />
              <Area type="monotone" dataKey="temperature" stroke={city.color} fill="url(#tempGrad)" strokeWidth={2} name="Suhu (°C)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Perbandingan RMSE Model" subtitle={`Split ${selectedSplit}`}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={modelComparison} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <YAxis type="category" dataKey="model" tick={{ fill: "#94a3b8", fontSize: 11 }} width={90} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="rmse" name="RMSE (°C)" radius={[0, 4, 4, 0]}>
                {modelComparison.map((entry, i) => (
                  <Cell
                    key={entry.model}
                    fill={
                      entry.model === "Ensemble"
                        ? city.color
                        : entry.model === "Baseline"
                          ? "#64748b"
                          : `hsl(${190 + i * 15}, 70%, 50%)`
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Visualisasi Aktual vs Prediksi */}
      <div className="mb-6">
        <PredictionChart
          selectedCity={selectedCity}
          selectedSplit={selectedSplit}
          cityColor={city.color}
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">        <ChartCard title="RMSE per Split" subtitle={selectedCity}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={splitTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="split" tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="ensemble" stroke={city.color} strokeWidth={2} name="Ensemble" dot />
              <Line type="monotone" dataKey="baseline" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" name="Baseline" dot />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Validation Loss" subtitle="Per model & split">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={valLossData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="split" tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="LSTM" fill="#06b6d4" radius={[2, 2, 0, 0]} />
              <Bar dataKey="GRU" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Transformer" fill="#f97316" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Perbandingan Kota" subtitle={`RMSE Ensemble · Split ${data.bestSplit}`}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={rmseComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="city" tick={{ fill: "#94a3b8", fontSize: 9 }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="rmse" name="RMSE (°C)" radius={[4, 4, 0, 0]}>
                {rmseComparison.map((entry) => (
                  <Cell key={entry.city} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Suhu 1 Tahun Terakhir" subtitle="Sampling mingguan">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={recentTemp}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 9 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="temperature" stroke={city.color} strokeWidth={2} dot={false} name="Suhu (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Kelembapan & Curah Hujan" subtitle="Rata-rata bulanan">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyChart.slice(-60)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 9 }} tickFormatter={(v) => v.slice(2, 7)} />
              <YAxis yAxisId="left" tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="left" type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={2} dot={false} name="Kelembapan (%)" />
              <Line yAxisId="right" type="monotone" dataKey="precipitation" stroke="#f97316" strokeWidth={2} dot={false} name="Curah Hujan (mm)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {currentMetric && (
        <div className="mt-8 glass rounded-2xl p-6">
          <h3 className="mb-4 text-lg font-semibold">
            Detail Metrik — {selectedCity} ({selectedSplit})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border text-left text-muted">
                  <th className="pb-3 pr-4">Metrik</th>
                  <th className="pb-3 pr-4">Baseline</th>
                  <th className="pb-3 pr-4">LSTM</th>
                  <th className="pb-3 pr-4">GRU</th>
                  <th className="pb-3 pr-4">Transformer</th>
                  <th className="pb-3 pr-4">Ensemble</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-card-border/50">
                  <td className="py-3 pr-4 font-medium">RMSE (°C)</td>
                  <td className="py-3 pr-4 text-muted">{currentMetric.rmseBaseline}</td>
                  <td className="py-3 pr-4">{currentMetric.rmseLstm}</td>
                  <td className="py-3 pr-4">{currentMetric.rmseGru}</td>
                  <td className="py-3 pr-4">{currentMetric.rmseTransformer}</td>
                  <td className="py-3 pr-4 font-bold" style={{ color: city.color }}>
                    {currentMetric.rmseEnsemble}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-medium">Bobot Ensemble</td>
                  <td className="py-3 pr-4 text-muted">—</td>
                  <td className="py-3 pr-4">{currentMetric.weights.lstm}</td>
                  <td className="py-3 pr-4">{currentMetric.weights.gru}</td>
                  <td className="py-3 pr-4">{currentMetric.weights.transformer}</td>
                  <td className="py-3 pr-4 text-muted">—</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap gap-6 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <Thermometer className="h-3.5 w-3.5" /> Min: {city.stats.minTemp}°C
            </span>
            <span className="flex items-center gap-1.5">
              <Thermometer className="h-3.5 w-3.5" /> Max: {city.stats.maxTemp}°C
            </span>
            <span className="flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5" /> Rata-rata: {city.stats.meanTemp}°C
            </span>
            <span className="flex items-center gap-1.5">
              <Wind className="h-3.5 w-3.5" /> {city.stats.dataPoints.toLocaleString()} data points
            </span>
            <span>
              {city.stats.dateRange.start} → {city.stats.dateRange.end}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mb-4 text-xs text-muted">{subtitle}</p>
      {children}
    </div>
  );
}
