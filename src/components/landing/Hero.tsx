import Link from "next/link";
import { ArrowRight, Thermometer, MapPin, Brain, Layers, Cpu, LineChart } from "lucide-react";
import JavaMap from "@/components/JavaMap";
import type { CityInfo, CityName } from "@/lib/types";

const quickLinks = [
  {
    href: "/fitur",
    icon: Layers,
    title: "Fitur",
    desc: "Pipeline data, validasi, dan EDA",
  },
  {
    href: "/eda",
    icon: LineChart,
    title: "EDA",
    desc: "Analisis eksplorasi data cuaca",
  },
  {
    href: "/model",
    icon: Cpu,
    title: "Model",
    desc: "LSTM · GRU · Transformer ensemble",
  },
  {
    href: "/kota",
    icon: MapPin,
    title: "Kota",
    desc: "6 stasiun cuaca di Pulau Jawa",
  },
];

interface HeroProps {
  cities?: Record<CityName, CityInfo>;
}

export default function Hero({ cities }: HeroProps) {
  return (
    <section className="hero-glow relative overflow-hidden px-6 pb-16 pt-12 md:pt-20">
      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-sm text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              NASA POWER · 6 Kota · Deep Learning Ensemble
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Prediksi Suhu Harian{" "}
              <span className="gradient-text">Pulau Jawa</span>{" "}
              dengan AI
            </h1>

            <p className="mt-5 text-lg text-muted leading-relaxed">
              Sistem prediksi iklim multi-stasiun berbasis deep learning.
              Menganalisis data cuaca 26 tahun dari 6 kota besar di Pulau Jawa.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent-light"
              >
                Lihat Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/kota"
                className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-white px-6 py-3 font-medium transition hover:border-accent/40"
              >
                Jelajahi Kota
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Thermometer, label: "Target", value: "Suhu Harian" },
                { icon: MapPin, label: "Cakupan", value: "6 Kota" },
                { icon: Brain, label: "Model", value: "Ensemble DL" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="glass card-hover rounded-xl p-4">
                  <Icon className="mb-2 h-4 w-4 text-accent" />
                  <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
                  <p className="mt-0.5 text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <JavaMap linkToKota cities={cities} />
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {quickLinks.map(({ href, icon: Icon, title, desc }) => (
            <Link
              key={href}
              href={href}
              className="glass card-hover group flex items-start gap-4 rounded-2xl p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold group-hover:text-accent">{title}</p>
                <p className="mt-1 text-sm text-muted">{desc}</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted transition group-hover:text-accent" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
