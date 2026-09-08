import EcoleHero from "@/components/ecole/EcoleHero";
import EcoleIntro from "@/components/ecole/EcoleIntro";
import EcoleTarifs from "@/components/ecole/EcoleTarifs";
import EcoleAvis from "@/components/ecole/EcoleAvis";
import EcoleReservation from "@/components/ecole/EcoleReservation";

import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { schoolServiceSchema } from "@/lib/schema";

// Le suffixe " — Airfly Martinique" ajoute par le template de layout.tsx coute
// vingt caracteres. Avec "École de glisse — " en tete, le titre servi faisait
// 77 caracteres et Google le tronquait vers 60. "Cours de" dit deja qu'il
// s'agit d'une ecole : le prefixe etait redondant, et aucun mot-cle n'est perdu.
const title = "Cours de kitesurf, wingfoil et kitefoil";
const description =
  "Apprenez le kitesurf, le wingfoil et le kitefoil à Pointe Faula, Le Vauclin. Moniteurs diplômés FFVL/FFV, 3 élèves maximum, bateau de sécurité et matériel fourni.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/ecole" },
  // Sans `images`, la page n'herite pas de l'image Open Graph du layout :
  // Next fusionne `openGraph` a plat, un objet enfant remplace celui du parent.
  // /ecole et /shop partageaient ce defaut et n'avaient aucun apercu social.
  openGraph: {
    title,
    description,
    url: "/ecole",
    type: "website",
    images: [{ url: "/hero_ecole.jpg", width: 1200, height: 630, alt: "Cours de kitesurf a Pointe Faula, Martinique" }],
  },
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
