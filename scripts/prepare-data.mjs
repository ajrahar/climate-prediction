import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CLIMATE = path.join(ROOT, "climate_we");
const OUT = path.join(__dirname, "../public/data");

const CITIES = {
  Jakarta: { lat: -6.2088, lon: 106.8456, elev: 8, zone: "pesisir_utara", color: "#e41a1c" },
  Bandung: { lat: -6.9175, lon: 107.6191, elev: 768, zone: "dataran_tinggi", color: "#377eb8" },
  Semarang: { lat: -6.9932, lon: 110.4203, elev: 5, zone: "pesisir_utara", color: "#4daf4a" },
  Yogyakarta: { lat: -7.7956, lon: 110.3695, elev: 114, zone: "dataran_tengah", color: "#984ea3" },
  Surabaya: { lat: -7.2575, lon: 112.7521, elev: 6, zone: "pesisir_utara", color: "#ff7f00" },
  Malang: { lat: -7.9797, lon: 112.6304, elev: 445, zone: "dataran_tinggi", color: "#a65628" },
};

const ZONE_LABELS = {
  pesisir_utara: "Pesisir Utara",
  dataran_tinggi: "Dataran Tinggi",
  dataran_tengah: "Dataran Tengah",
};

const CORR_COLS = [
  "TEMPERATURE",
  "PRECIPITATION",
  "HUMIDITY",
  "WIND_SPEED",
  "TEMP_LAG1",
  "TEMP_LAG3",
  "TEMP_LAG7",
  "TEMP_ROLL7",
];

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function quantile(sorted, q) {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

function descriptiveStats(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return {
    mean: +mean.toFixed(2),
    std: +Math.sqrt(variance).toFixed(2),
    min: +sorted[0].toFixed(2),
    max: +sorted[sorted.length - 1].toFixed(2),
    q1: +quantile(sorted, 0.25).toFixed(2),
    median: +quantile(sorted, 0.5).toFixed(2),
    q3: +quantile(sorted, 0.75).toFixed(2),
  };
}

function pearsonCorr(x, y) {
  const n = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - mx) * (y[i] - my);
    dx += (x[i] - mx) ** 2;
    dy += (y[i] - my) ** 2;
  }
  if (dx === 0 || dy === 0) return 0;
  return +((num / Math.sqrt(dx * dy)).toFixed(3));
}

function correlationMatrix(rows, cols) {
  const data = Object.fromEntries(cols.map((col) => [col, rows.map((r) => parseFloat(r[col]))]));
  const matrix = {};
  for (const a of cols) {
    matrix[a] = {};
    for (const b of cols) {
      matrix[a][b] = a === b ? 1 : pearsonCorr(data[a], data[b]);
    }
  }
  return matrix;
}

function seasonalPattern(rows) {
  const months = Array.from({ length: 12 }, () => ({
    temps: [],
    precips: [],
    humidities: [],
  }));
  for (const row of rows) {
    const m = parseInt(row.DATE.slice(5, 7), 10) - 1;
    months[m].temps.push(parseFloat(row.TEMPERATURE));
    months[m].precips.push(parseFloat(row.PRECIPITATION));
    months[m].humidities.push(parseFloat(row.HUMIDITY));
  }
  return months.map((bucket, i) => ({
    month: i + 1,
    label: MONTH_LABELS[i],
    temperature: +(bucket.temps.reduce((a, b) => a + b, 0) / bucket.temps.length).toFixed(2),
    precipitation: +(bucket.precips.reduce((a, b) => a + b, 0) / bucket.precips.length).toFixed(2),
    humidity: +(bucket.humidities.reduce((a, b) => a + b, 0) / bucket.humidities.length).toFixed(2),
  }));
}

function yearlyTrend(rows) {
  const buckets = {};
  for (const row of rows) {
    const year = row.DATE.slice(0, 4);
    if (!buckets[year]) buckets[year] = [];
    buckets[year].push(parseFloat(row.TEMPERATURE));
  }
  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, temps]) => ({
      year: parseInt(year, 10),
      temperature: +(temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2),
    }));
}

function outlierStats(rows) {
  const temps = rows.map((r) => parseFloat(r.TEMPERATURE)).sort((a, b) => a - b);
  const q1 = quantile(temps, 0.25);
  const q3 = quantile(temps, 0.75);
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;
  const count = temps.filter((t) => t < lower || t > upper).length;
  const mean = temps.reduce((a, b) => a + b, 0) / temps.length;
  const std = Math.sqrt(temps.reduce((a, b) => a + (b - mean) ** 2, 0) / temps.length);
  const zScoreCount = temps.filter((t) => Math.abs((t - mean) / std) > 3).length;
  return {
    q1: +q1.toFixed(2),
    q3: +q3.toFixed(2),
    iqr: +iqr.toFixed(2),
    lower: +lower.toFixed(2),
    upper: +upper.toFixed(2),
    count,
    pct: +((count / temps.length) * 100).toFixed(2),
    zScoreCount,
  };
}

function missingValues(rows, cols) {
  return Object.fromEntries(
    cols.map((col) => [
      col,
      rows.filter((r) => !r[col] || r[col].trim() === "" || r[col] === "NaN").length,
    ]),
  );
}

function temperatureHistogram(rows, bins = 18) {
  const temps = rows.map((r) => parseFloat(r.TEMPERATURE));
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const step = (max - min) / bins;
  const counts = Array(bins).fill(0);
  for (const t of temps) {
    const idx = Math.min(bins - 1, Math.floor((t - min) / step));
    counts[idx]++;
  }
  return counts.map((count, i) => ({
    bin: `${(min + i * step).toFixed(1)}–${(min + (i + 1) * step).toFixed(1)}`,
    mid: +((min + (i + 0.5) * step).toFixed(2)),
    count,
  }));
}

function scatterSample(rows, step = 25) {
  return rows
    .filter((_, i) => i % step === 0)
    .map((r) => ({
      temperature: parseFloat(r.TEMPERATURE),
      humidity: parseFloat(r.HUMIDITY),
      precipitation: parseFloat(r.PRECIPITATION),
    }));
}

function boxplotEntry(city, color, rows) {
  const temps = rows.map((r) => parseFloat(r.TEMPERATURE)).sort((a, b) => a - b);
  return {
    city,
    color,
    min: +temps[0].toFixed(2),
    q1: +quantile(temps, 0.25).toFixed(2),
    median: +quantile(temps, 0.5).toFixed(2),
    q3: +quantile(temps, 0.75).toFixed(2),
    max: +temps[temps.length - 1].toFixed(2),
  };
}

function buildEda(cityRows) {
  const perCity = {};
  const boxplot = [];
  let totalMissing = 0;

  for (const [city, meta] of Object.entries(CITIES)) {
    const rows = cityRows[city];
    const temps = rows.map((r) => parseFloat(r.TEMPERATURE));
    const precips = rows.map((r) => parseFloat(r.PRECIPITATION));
    const humidities = rows.map((r) => parseFloat(r.HUMIDITY));
    const winds = rows.map((r) => parseFloat(r.WIND_SPEED));
    const missing = missingValues(rows, CORR_COLS);
    totalMissing += Object.values(missing).reduce((a, b) => a + b, 0);

    perCity[city] = {
      descriptive: {
        temperature: descriptiveStats(temps),
        precipitation: descriptiveStats(precips),
        humidity: descriptiveStats(humidities),
        windSpeed: descriptiveStats(winds),
      },
      seasonal: seasonalPattern(rows),
      correlation: correlationMatrix(rows, CORR_COLS),
      yearlyTrend: yearlyTrend(rows),
      outliers: outlierStats(rows),
      missing,
      histogram: temperatureHistogram(rows),
      scatter: scatterSample(rows),
    };
    boxplot.push(boxplotEntry(city, meta.color, rows));
  }

  const seasonalAll = MONTH_LABELS.map((label, i) => {
    const entry = { month: label };
    for (const city of Object.keys(CITIES)) {
      entry[city] = perCity[city].seasonal[i].temperature;
    }
    return entry;
  });

  return {
    corrColumns: CORR_COLS,
    dataQuality: {
      allClean: totalMissing === 0,
      totalRows: Object.values(cityRows).reduce((sum, rows) => sum + rows.length, 0),
    },
    perCity,
    comparison: { boxplot, seasonalAll },
  };
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
  });
}

function readCityCSV(city) {
  const file = path.join(CLIMATE, "data_kota", `${city.toLowerCase()}.csv`);
  return parseCSV(fs.readFileSync(file, "utf-8"));
}

function aggregateMonthly(rows) {
  const buckets = {};
  for (const row of rows) {
    const date = row.DATE.slice(0, 7);
    if (!buckets[date]) {
      buckets[date] = { temps: [], precips: [], humidities: [] };
    }
    buckets[date].temps.push(parseFloat(row.TEMPERATURE));
    buckets[date].precips.push(parseFloat(row.PRECIPITATION));
    buckets[date].humidities.push(parseFloat(row.HUMIDITY));
  }
  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      month,
      temperature: +(v.temps.reduce((a, b) => a + b, 0) / v.temps.length).toFixed(2),
      precipitation: +(v.precips.reduce((a, b) => a + b, 0) / v.precips.length).toFixed(2),
      humidity: +(v.humidities.reduce((a, b) => a + b, 0) / v.humidities.length).toFixed(2),
    }));
}

function cityStats(rows) {
  const temps = rows.map((r) => parseFloat(r.TEMPERATURE));
  const sorted = [...temps].sort((a, b) => a - b);
  const mean = temps.reduce((a, b) => a + b, 0) / temps.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const recent = rows.slice(-365).map((r) => ({
    date: r.DATE,
    temperature: parseFloat(r.TEMPERATURE),
    precipitation: parseFloat(r.PRECIPITATION),
    humidity: parseFloat(r.HUMIDITY),
  }));
  return {
    meanTemp: +mean.toFixed(2),
    minTemp: +min.toFixed(2),
    maxTemp: +max.toFixed(2),
    dataPoints: rows.length,
    dateRange: { start: rows[0].DATE, end: rows[rows.length - 1].DATE },
    recent,
  };
}

function readMetrics() {
  const file = path.join(CLIMATE, "hasil_multi_split.csv");
  const rows = parseCSV(fs.readFileSync(file, "utf-8"));
  return rows.map((r) => ({
    kota: r.Kota,
    zone: r.Zone,
    elevasi: parseFloat(r.Elevasi_m),
    split: r.Split,
    nTrain: parseInt(r.N_Train),
    nTest: parseInt(r.N_Test),
    rmseBaseline: parseFloat(r.RMSE_Baseline),
    rmseEnsemble: parseFloat(r.RMSE_Ensemble),
    rmseLstm: parseFloat(r.RMSE_LSTM),
    rmseGru: parseFloat(r.RMSE_GRU),
    rmseTransformer: parseFloat(r.RMSE_Transformer),
    mae: parseFloat(r.MAE),
    r2: parseFloat(r.R2),
    mape: parseFloat(r.MAPE_pct),
    improvement: parseFloat(r.Improvement_pct),
    weights: {
      lstm: parseFloat(r.W_LSTM),
      gru: parseFloat(r.W_GRU),
      transformer: parseFloat(r.W_Transformer),
    },
  }));
}

function readValLoss() {
  const result = {};
  for (const city of Object.keys(CITIES)) {
    const file = path.join(CLIMATE, `val_loss_${city.toLowerCase()}.json`);
    result[city] = JSON.parse(fs.readFileSync(file, "utf-8"));
  }
  return result;
}

fs.mkdirSync(OUT, { recursive: true });

const cityRows = {};
const cityData = {};
for (const [city, meta] of Object.entries(CITIES)) {
  const rows = readCityCSV(city);
  cityRows[city] = rows;
  cityData[city] = {
    ...meta,
    zoneLabel: ZONE_LABELS[meta.zone],
    monthly: aggregateMonthly(rows),
    stats: cityStats(rows),
  };
}

const eda = buildEda(cityRows);

const metrics = readMetrics();
const valLoss = readValLoss();

const bestSplit = "80/20";
const summary = Object.keys(CITIES).map((city) => {
  const m = metrics.find((r) => r.kota === city && r.split === bestSplit);
  return {
    city,
    ...CITIES[city],
    zoneLabel: ZONE_LABELS[CITIES[city].zone],
    rmse: m?.rmseEnsemble ?? 0,
    r2: m?.r2 ?? 0,
    mape: m?.mape ?? 0,
    improvement: m?.improvement ?? 0,
    meanTemp: cityData[city].stats.meanTemp,
  };
});

const payload = {
  generatedAt: new Date().toISOString(),
  bestSplit,
  cities: cityData,
  metrics,
  valLoss,
  summary,
  eda,
};

fs.writeFileSync(path.join(OUT, "dashboard.json"), JSON.stringify(payload, null, 2));
console.log("✅ Data disimpan ke public/data/dashboard.json");
