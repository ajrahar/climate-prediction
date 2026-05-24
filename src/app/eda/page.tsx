import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import EdaClient from "@/components/eda/EdaClient";
import { getDashboardData } from "@/lib/data";

export const metadata = {
  title: "EDA | ClimatePredict",
  description: "Exploratory Data Analysis data cuaca NASA POWER untuk 6 kota di Pulau Jawa",
};

export default function EdaPage() {
  const data = getDashboardData();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <PageHeader
          title="Exploratory Data Analysis"
          description="Visualisasi hasil EDA dari data CSV mentah — statistik, korelasi, distribusi, outlier, dan pola musiman."
        />
        <EdaClient data={data} />
      </main>
      <Footer />
    </>
  );
}
