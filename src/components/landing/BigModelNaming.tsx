import { Layers, Maximize2, Info } from "lucide-react";

const bigSpecs = [
  { label: "Jumlah layer", value: "3 (num_layers=3)", note: "Bukan 1 atau 2 layer" },
  { label: "Hidden size", value: "128", note: "Cukup besar untuk time series cuaca" },
  { label: "Dropout", value: "0.3", note: "Antar layer, untuk regularisasi" },
];

const standardSpecs = [
  { label: "Jumlah layer", value: "1–2 layer" },
  { label: "Hidden size", value: "32–64" },
  { label: "Dropout", value: "Bervariasi / lebih kecil" },
];

export default function BigModelNaming() {
  return (
    <section className="border-t border-card-border bg-card/40 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50">
            <Info className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Mengapa &quot;Big&quot;LSTM &amp; &quot;Big&quot;GRU?</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
              Nama <strong className="font-medium text-foreground">&quot;Big&quot;</strong> di{" "}
              <strong className="font-medium text-foreground">BigLSTM</strong> dan{" "}
              <strong className="font-medium text-foreground">BigGRU</strong> bukan istilah resmi
              dari literatur — ini penamaan custom di notebook proyek ini untuk membedakan
              arsitektur dari versi LSTM/GRU standar yang lebih kecil.
            </p>
          </div>
        </div>

        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted">
          Alasannya terlihat jelas dari konfigurasi arsitektur di Cell 6 notebook: versi
          &quot;Big&quot; jauh lebih dalam dan lebar dibanding baseline umum, sehingga punya
          kapasitas cukup untuk menangkap pola suhu jangka panjang dari data 26 tahun.
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass rounded-2xl p-6">
            <div className="mb-5 flex items-center gap-2">
              <Maximize2 className="h-4 w-4 text-accent" />
              <h3 className="font-semibold">BigLSTM &amp; BigGRU</h3>
              <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-accent">
                Versi proyek ini
              </span>
            </div>
            <ul className="space-y-4">
              {bigSpecs.map(({ label, value, note }) => (
                <li key={label} className="flex items-start justify-between gap-4 border-b border-card-border pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="mt-0.5 text-xs text-muted">{note}</p>
                  </div>
                  <span className="shrink-0 font-mono text-sm font-semibold text-accent">{value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="mb-5 flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted" />
              <h3 className="font-semibold">LSTM / GRU Standar</h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-muted">
                Baseline umum
              </span>
            </div>
            <ul className="space-y-4">
              {standardSpecs.map(({ label, value }) => (
                <li key={label} className="flex items-center justify-between gap-4 border-b border-card-border pb-4 last:border-0 last:pb-0">
                  <p className="text-sm font-medium">{label}</p>
                  <span className="font-mono text-sm text-muted">{value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-cyan-200 bg-cyan-50/60 px-6 py-5">
          <p className="text-sm leading-relaxed text-foreground">
            <strong>Analogi:</strong> Mirip penamaan seperti BigBird atau BigGAN di dunia ML —
            kata &quot;Big&quot; sekadar menandakan versi yang lebih besar dan dalam dari baseline
            standar, bukan nama teknis resmi.
          </p>
          <p className="mt-3 text-sm font-medium text-accent">
            Big = deep (3 layer) + wide (hidden 128)
          </p>
          <p className="mt-1 text-xs text-muted">
            Dibuat lebih besar agar kapasitas model cukup untuk pola suhu jangka panjang.
          </p>
        </div>
      </div>
    </section>
  );
}
