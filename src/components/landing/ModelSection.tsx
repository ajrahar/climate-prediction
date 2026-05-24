import { Cpu, GitBranch, Target } from "lucide-react";

const pipeline = [
  "Download NASA POWER → CSV per kota",
  "Feature engineering (lag, rolling, sin/cos)",
  "MinMax scaling & windowing (14 hari)",
  "Training BigLSTM · BigGRU · Transformer",
  "Weighted ensemble & evaluasi metrik",
];

export default function ModelSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mt-4 text-muted leading-relaxed">
              Hasil ketiga model digabungkan melalui weighted ensemble yang
              dioptimalkan berdasarkan performa validasi per kota.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { icon: Cpu, title: "Window Size", desc: "14 hari historis → prediksi 1 hari ke depan" },
                { icon: GitBranch, title: "Hyperparameter", desc: "Batch 64 · LR 3e-4 · Early stopping patience 80" },
                { icon: Target, title: "Metrik Evaluasi", desc: "RMSE · MAE · R² · MAPE · Improvement vs baseline" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <p className="mb-4 text-sm font-medium uppercase tracking-wider text-accent">
              Pipeline Training
            </p>
            <ol className="space-y-3">
              {pipeline.map((step, i) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-accent">
                    {i + 1}
                  </span>
                  <span className="text-sm text-muted pt-0.5">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-card-border pt-6">
              {["BigLSTM", "BigGRU", "Transformer"].map((m) => (
                <div key={m} className="rounded-lg bg-card px-3 py-2 text-center text-sm font-medium ring-1 ring-card-border">
                  {m}
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-muted">→ Weighted Ensemble → Prediksi Suhu</p>
          </div>
        </div>
      </div>
    </section>
  );
}
