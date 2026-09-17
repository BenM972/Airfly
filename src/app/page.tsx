import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import SpotSection from "@/components/SpotSection";
import PartnersSection from "@/components/PartnersSection";
import MeteoSection from "@/components/MeteoSection";
import JsonLd from "@/components/JsonLd";
import { localBusinessSchema } from "@/lib/schema";


// Pages statiques : sans revalidation, le HTML est fige au build et l'annonce de
// fermeture y resterait apres la date de reouverture. Une heure suffit — la
// bascule se fait d'elle-meme, sans redeploiement.
export const revalidate = 3600;

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
