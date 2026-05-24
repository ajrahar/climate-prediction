export type CityName =
  | "Jakarta"
  | "Bandung"
  | "Semarang"
  | "Yogyakarta"
  | "Surabaya"
  | "Malang";

export interface MonthlyData {
  month: string;
  temperature: number;
  precipitation: number;
  humidity: number;
}

export interface CityStats {
  meanTemp: number;
  minTemp: number;
  maxTemp: number;
  dataPoints: number;
  dateRange: { start: string; end: string };
  recent: {
    date: string;
    temperature: number;
    precipitation: number;
    humidity: number;
  }[];
}

export interface CityInfo {
  lat: number;
  lon: number;
  elev: number;
  zone: string;
  zoneLabel: string;
  color: string;
  monthly: MonthlyData[];
  stats: CityStats;
}

export interface MetricRow {
  kota: string;
  zone: string;
  elevasi: number;
  split: string;
  nTrain: number;
  nTest: number;
  rmseBaseline: number;
  rmseEnsemble: number;
  rmseLstm: number;
  rmseGru: number;
  rmseTransformer: number;
  mae: number;
  r2: number;
  mape: number;
  improvement: number;
  weights: { lstm: number; gru: number; transformer: number };
}

export interface ValLossEntry {
  lstm: number;
  gru: number;
  tr: number;
}

export interface SummaryRow {
  city: CityName;
  lat: number;
  lon: number;
  elev: number;
  zone: string;
  zoneLabel: string;
  color: string;
  rmse: number;
  r2: number;
  mape: number;
  improvement: number;
  meanTemp: number;
}

export interface DescriptiveStats {
  mean: number;
  std: number;
  min: number;
  max: number;
  q1: number;
  median: number;
  q3: number;
}

export interface SeasonalPoint {
  month: number;
  label: string;
  temperature: number;
  precipitation: number;
  humidity: number;
}

export interface OutlierStats {
  q1: number;
  q3: number;
  iqr: number;
  lower: number;
  upper: number;
  count: number;
  pct: number;
  zScoreCount: number;
}

export interface HistogramBin {
  bin: string;
  mid: number;
  count: number;
}

export interface ScatterPoint {
  temperature: number;
  humidity: number;
  precipitation: number;
}

export interface BoxplotEntry {
  city: string;
  color: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

export interface CityEda {
  descriptive: {
    temperature: DescriptiveStats;
    precipitation: DescriptiveStats;
    humidity: DescriptiveStats;
    windSpeed: DescriptiveStats;
  };
  seasonal: SeasonalPoint[];
  correlation: Record<string, Record<string, number>>;
  yearlyTrend: { year: number; temperature: number }[];
  outliers: OutlierStats;
  missing: Record<string, number>;
  histogram: HistogramBin[];
  scatter: ScatterPoint[];
}

export interface EdaData {
  corrColumns: string[];
  dataQuality: { allClean: boolean; totalRows: number };
  perCity: Record<CityName, CityEda>;
  comparison: {
    boxplot: BoxplotEntry[];
    seasonalAll: Array<{ month: string } & Record<string, number | string>>;
  };
}

export interface DashboardData {
  generatedAt: string;
  bestSplit: string;
  cities: Record<CityName, CityInfo>;
  metrics: MetricRow[];
  valLoss: Record<CityName, Record<string, ValLossEntry>>;
  summary: SummaryRow[];
  eda: EdaData;
}
