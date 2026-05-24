import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import Features from "@/components/landing/Features";

export const metadata = {
  title: "Fitur | ClimatePredict",
  description: "Fitur utama pipeline prediksi suhu multi-kota Pulau Jawa",
};

export default function FiturPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHeader
          title="Fitur Utama"
          description="Pipeline machine learning end-to-end dari pengumpulan data NASA POWER hingga visualisasi hasil prediksi suhu."
        />
        <Features />
      </main>
      <Footer />
    </>
  );
}
