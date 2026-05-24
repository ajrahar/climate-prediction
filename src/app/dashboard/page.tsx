import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { getDashboardData } from "@/lib/data";
import { BarChart3 } from "lucide-react";

export const metadata = {
  title: "Dashboard Analisis | ClimatePredict",
  description: "Dashboard interaktif analisis prediksi suhu multi-kota Pulau Jawa",
};

export default function DashboardPage() {
  const data = getDashboardData();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="border-b border-card-border bg-card px-6 py-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">
                <BarChart3 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">Dashboard Analisis</h1>
                <p className="text-sm text-muted">
                  Visualisasi data cuaca, performa model, dan perbandingan antar kota
                </p>
              </div>
            </div>
          </div>
        </div>
        <DashboardClient data={data} />
      </main>
      <Footer />
    </>
  );
}
