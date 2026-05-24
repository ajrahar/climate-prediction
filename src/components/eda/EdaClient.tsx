"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { AlertTriangle, CheckCircle2, Database, TrendingUp } from "lucide-react";
import JavaMap from "@/components/JavaMap";
import type { CityName, DashboardData } from "@/lib/types";
import { CITY_NAMES } from "@/lib/constants";

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

const CORR_LABELS: Record<string, string> = {
  TEMPERATURE: "Suhu",
  PRECIPITATION: "Hujan",
  HUMIDITY: "Kelembapan",
  WIND_SPEED: "Angin",
  TEMP_LAG1: "Lag-1",
  TEMP_LAG3: "Lag-3",
  TEMP_LAG7: "Lag-7",
  TEMP_ROLL7: "Roll-7",
};

export default function EdaClient({ data }: Props) {
  const [selectedCity, setSelectedCity] = useState<CityName>("Jakarta");
  const city = data.cities[selectedCity];
  const eda = data.eda.perCity[selectedCity];

  const seasonalLines = useMemo(
    () =>
      CITY_NAMES.map((name) => ({
        key: name,
        color: data.cities[name].color,
      })),
    [data.cities],
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <JavaMap cities={data.cities} showLegend />
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold">Ringkasan Kualitas Data</h3>
          <p className="mt-1 text-xs text-muted">Hasil EDA dari CSV mentah NASA POWER</p>
          <div className="mt-5 space-y-4">
            <QualityRow
              icon={data.eda.dataQuality.allClean ? CheckCircle2 : AlertTriangle}
              label="Missing value"
              value={data.eda.dataQuality.allClean ? "Semua data bersih" : "Ada missing value"}
              ok={data.eda.dataQuality.allClean}
            />
            <QualityRow
              icon={Database}
              label="Total baris data"
              value={`${data.eda.dataQuality.totalRows.toLocaleString()} observasi`}
              ok
            />
            <QualityRow
              icon={TrendingUp}
              label="Rentang waktu"
              value={`${city.stats.dateRange.start} → ${city.stats.dateRange.end}`}
              ok
            />
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted">
            EDA dilakukan per kota sebelum modeling — mencakup statistik deskriptif, pola musiman,
            korelasi fitur, distribusi suhu, deteksi outlier IQR, dan tren suhu tahunan.
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {CITY_NAMES.map((name) => (
          <button
            key={name}
            onClick={() => setSelectedCity(name)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              selectedCity === name
                ? "text-white"
                : "bg-card text-muted ring-1 ring-card-border hover:text-foreground"
            }`}
            style={
              selectedCity === name
                ? { backgroundColor: data.cities[name].color }
                : undefined
            }
          >
            {name}
          </button>
        ))}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Suhu rata-rata", value: eda.descriptive.temperature.mean, unit: "°C" },
          { label: "Std dev suhu", value: eda.descriptive.temperature.std, unit: "°C" },
          { label: "Outlier IQR", value: eda.outliers.pct, unit: "%" },
          { label: "Median suhu", value: eda.descriptive.temperature.median, unit: "°C" },
        ].map(({ label, value, unit }) => (
          <div key={label} className="glass rounded-xl p-4">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-2 text-2xl font-bold">
              {value}
              <span className="ml-1 text-sm font-normal text-muted">{unit}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Pola Musiman Suhu" subtitle="Rata-rata bulanan · semua kota">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.eda.comparison.seasonalAll}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {seasonalLines.map(({ key, color }) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  name={key}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribusi Suhu" subtitle={`Histogram · ${selectedCity}`}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={eda.histogram}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="mid"
                tick={{ fill: "#94a3b8", fontSize: 9 }}
                tickFormatter={(v) => `${v}°`}
              />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(v) => `${v}°C`} />
              <Bar dataKey="count" fill={city.color} radius={[2, 2, 0, 0]} name="Frekuensi" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Perbandingan Distribusi Suhu" subtitle="Boxplot antar kota">
          <div className="flex h-[280px] items-end justify-around gap-2 px-2">
            {data.eda.comparison.boxplot.map((box) => (
              <BoxplotColumn key={box.city} box={box} />
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Tren Suhu Tahunan" subtitle={selectedCity}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={eda.yearlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 9 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke={city.color}
                strokeWidth={2}
                dot={false}
                name="Suhu (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Korelasi Fitur" subtitle={`Heatmap · ${selectedCity}`}>
          <CorrelationHeatmap
            columns={data.eda.corrColumns}
            matrix={eda.correlation}
            labels={CORR_LABELS}
          />
        </ChartCard>

        <ChartCard title="Suhu vs Kelembapan" subtitle={`Scatter sample · ${selectedCity}`}>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                dataKey="temperature"
                name="Suhu"
                unit="°C"
                tick={{ fill: "#94a3b8", fontSize: 10 }}
              />
              <YAxis
                type="number"
                dataKey="humidity"
                name="Kelembapan"
                unit="%"
                tick={{ fill: "#94a3b8", fontSize: 10 }}
              />
              <ZAxis range={[20, 20]} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={eda.scatter} fill={city.color} fillOpacity={0.5} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Statistik Deskriptif" subtitle={selectedCity}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border text-left text-muted">
                  <th className="pb-2 pr-3">Variabel</th>
                  <th className="pb-2 pr-3">Mean</th>
                  <th className="pb-2 pr-3">Std</th>
                  <th className="pb-2 pr-3">Min</th>
                  <th className="pb-2 pr-3">Q1</th>
                  <th className="pb-2 pr-3">Median</th>
                  <th className="pb-2 pr-3">Q3</th>
                  <th className="pb-2">Max</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["Suhu (°C)", eda.descriptive.temperature],
                    ["Curah Hujan", eda.descriptive.precipitation],
                    ["Kelembapan (%)", eda.descriptive.humidity],
                    ["Kecepatan Angin", eda.descriptive.windSpeed],
                  ] as const
                ).map(([label, stats]) => (
                  <tr key={label} className="border-b border-card-border/50">
                    <td className="py-2 pr-3 font-medium">{label}</td>
                    <td className="py-2 pr-3">{stats.mean}</td>
                    <td className="py-2 pr-3">{stats.std}</td>
                    <td className="py-2 pr-3">{stats.min}</td>
                    <td className="py-2 pr-3">{stats.q1}</td>
                    <td className="py-2 pr-3">{stats.median}</td>
                    <td className="py-2 pr-3">{stats.q3}</td>
                    <td className="py-2">{stats.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        <ChartCard title="Outlier & Missing Value" subtitle={selectedCity}>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium">Deteksi Outlier (IQR)</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-muted">
                <span>Q1: {eda.outliers.q1}°C</span>
                <span>Q3: {eda.outliers.q3}°C</span>
                <span>IQR: {eda.outliers.iqr}°C</span>
                <span>
                  Fence: [{eda.outliers.lower}, {eda.outliers.upper}]
                </span>
                <span>
                  Outlier IQR: {eda.outliers.count} ({eda.outliers.pct}%)
                </span>
                <span>Outlier Z&gt;3: {eda.outliers.zScoreCount}</span>
              </div>
            </div>
            <div>
              <p className="font-medium">Missing Value per Kolom</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(eda.missing).map(([col, count]) => (
                  <span
                    key={col}
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      count === 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {CORR_LABELS[col] ?? col}: {count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function QualityRow({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className={`h-5 w-5 ${ok ? "text-emerald-600" : "text-amber-600"}`} />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function BoxplotColumn({
  box,
}: {
  box: {
    city: string;
    color: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
  };
}) {
  const scaleMin = 22;
  const scaleMax = 32;
  const range = scaleMax - scaleMin;
  const toPct = (v: number) => `${((v - scaleMin) / range) * 100}%`;

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="relative h-[220px] w-full max-w-[48px]">
        <div
          className="absolute left-1/2 w-px -translate-x-1/2 bg-slate-300"
          style={{ bottom: toPct(box.min), height: `calc(${toPct(box.max)} - ${toPct(box.min)})` }}
        />
        <div
          className="absolute left-1/2 w-8 -translate-x-1/2 rounded-sm border border-white/50"
          style={{
            bottom: toPct(box.q1),
            height: `calc(${toPct(box.q3)} - ${toPct(box.q1)})`,
            backgroundColor: box.color,
            opacity: 0.75,
          }}
        />
        <div
          className="absolute left-1/2 h-0.5 w-8 -translate-x-1/2 bg-slate-800"
          style={{ bottom: toPct(box.median) }}
        />
      </div>
      <p className="mt-2 text-[10px] font-medium text-muted">{box.city}</p>
    </div>
  );
}

function CorrelationHeatmap({
  columns,
  matrix,
  labels,
}: {
  columns: string[];
  matrix: Record<string, Record<string, number>>;
  labels: Record<string, string>;
}) {
  const cellColor = (value: number) => {
    if (value >= 0.7) return "bg-cyan-600 text-white";
    if (value >= 0.4) return "bg-cyan-300 text-slate-900";
    if (value >= 0) return "bg-cyan-50 text-slate-700";
    if (value >= -0.4) return "bg-orange-50 text-slate-700";
    return "bg-orange-400 text-white";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-center text-[10px]">
        <thead>
          <tr>
            <th className="p-1" />
            {columns.map((col) => (
              <th key={col} className="p-1 font-medium text-muted">
                {(labels[col] ?? col).slice(0, 5)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {columns.map((row) => (
            <tr key={row}>
              <td className="p-1 text-left font-medium text-muted">{labels[row] ?? row}</td>
              {columns.map((col) => {
                const value = matrix[row][col];
                return (
                  <td key={col} className="p-0.5">
                    <div className={`rounded px-1 py-1.5 ${cellColor(value)}`}>
                      {value.toFixed(2)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
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
