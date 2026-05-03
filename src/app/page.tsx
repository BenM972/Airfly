import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import SpotSection from "@/components/SpotSection";
import MeteoSection from "@/components/MeteoSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <AboutSection />
      <SpotSection />
      <MeteoSection />
    </main>
  );
}
