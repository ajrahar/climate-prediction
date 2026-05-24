import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import CitiesPreview from "@/components/landing/CitiesPreview";
import JavaMap from "@/components/JavaMap";
import { getDashboardData } from "@/lib/data";

export const metadata = {
  title: "Kota | ClimatePredict",
  description: "6 kota di Pulau Jawa dengan data cuaca dan performa model prediksi suhu",
};

export default function KotaPage() {
  const data = getDashboardData();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHeader
          title="Kota di Pulau Jawa"
          description="Enam stasiun cuaca dengan zona geografis berbeda — pesisir utara, dataran tengah, dan dataran tinggi."
        />
        <section className="px-6 pb-8">
          <div className="mx-auto max-w-6xl">
            <JavaMap showLegend cities={data.cities} />
          </div>
        </section>
        <CitiesPreview summary={data.summary} />
      </main>
      <Footer />
    </>
  );
}
