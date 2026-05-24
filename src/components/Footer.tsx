import { CloudSun } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-card-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted">
          <CloudSun className="h-4 w-4 text-accent" />
          <span>ClimatePredict — Prediksi Suhu Multi-Kota Jawa</span>
        </div>
        <p className="text-xs text-muted">
          Data: NASA POWER (2000–2026) · Model: LSTM · GRU · Transformer Ensemble
        </p>
      </div>
    </footer>
  );
}
