import EcoleHero from "@/components/ecole/EcoleHero";
import EcoleIntro from "@/components/ecole/EcoleIntro";
import EcoleTarifs from "@/components/ecole/EcoleTarifs";
import EcoleAvis from "@/components/ecole/EcoleAvis";
import EcoleReservation from "@/components/ecole/EcoleReservation";

import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { schoolServiceSchema } from "@/lib/schema";

// Titre court : le suffixe "| Airfly Martinique" vient du template de layout.tsx
const title = "École de glisse — Cours de kitesurf, wingfoil et kitefoil";
const description =
  "Apprenez le kitesurf, le wingfoil et le kitefoil à Pointe Faula, Le Vauclin. Moniteurs diplômés FFVL/FFV, 3 élèves maximum, bateau de sécurité et matériel fourni.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/ecole" },
  openGraph: { title, description, url: "/ecole", type: "website" },
};

export default function EcolePage() {
  return (
    <main>
      <JsonLd data={schoolServiceSchema()} />
      <EcoleHero />
      <EcoleIntro />
      <EcoleTarifs />
      <EcoleAvis />
      <EcoleReservation />
    </main>
  );
}
