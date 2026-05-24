import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/landing/Hero";
import { getDashboardData } from "@/lib/data";

export default function HomePage() {
  const data = getDashboardData();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero cities={data.cities} />
      </main>
      <Footer />
    </>
  );
}
