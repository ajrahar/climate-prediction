import { Database, LineChart, Layers, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Database,
    title: "Data NASA POWER",
    description:
      "Dataset cuaca harian 2000–2026 dengan 12 fitur: suhu, curah hujan, kelembapan, angin, dan fitur temporal (lag & rolling).",
  },
  {
    icon: Layers,
    title: "Multi-Split Validation",
    description:
      "Evaluasi pada 5 konfigurasi train/test split (90/10 hingga 50/50) untuk memastikan generalisasi model yang robust.",
  },
  {
    icon: LineChart,
    title: "EDA Komprehensif",
    description:
      "Analisis time series, korelasi fitur, missing value, outlier detection, dan tren musiman per kota secara independen.",
  },
  {
    icon: ShieldCheck,
    title: "Ensemble Terbobot",
    description:
      "Kombinasi LSTM, GRU, dan Transformer dengan bobot optimal per kota — mengungguli baseline persistence hingga 15%.",
  },
];

export default function Features() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="glass card-hover rounded-2xl p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
