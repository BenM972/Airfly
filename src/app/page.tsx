import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import SpotSection from "@/components/SpotSection";
import PartnersSection from "@/components/PartnersSection";
import MeteoSection from "@/components/MeteoSection";
import JsonLd from "@/components/JsonLd";
import { localBusinessSchema } from "@/lib/schema";

export default function Home() {
  return (
    <main>
      <JsonLd data={localBusinessSchema()} />
      <Hero />
      <AboutSection />
      <SpotSection />
      <PartnersSection />
      <MeteoSection />
    </main>
  );
}
