import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import ModelSection from "@/components/landing/ModelSection";
import BigModelNaming from "@/components/landing/BigModelNaming";

export const metadata = {
  title: "Model | ClimatePredict",
  description: "Arsitektur deep learning LSTM, GRU, dan Transformer ensemble",
};

export default function ModelPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHeader
          title="Arsitektur Model"
          description="Setiap kota dilatih independen dengan BigLSTM, BigGRU, dan Transformer, lalu digabungkan melalui weighted ensemble."
        />
        <ModelSection />
        <BigModelNaming />
      </main>
      <Footer />
    </>
  );
}
