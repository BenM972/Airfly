import EcoleHero from "@/components/ecole/EcoleHero";
import EcoleIntro from "@/components/ecole/EcoleIntro";
import EcoleTarifs from "@/components/ecole/EcoleTarifs";
import EcoleAvis from "@/components/ecole/EcoleAvis";
import EcoleReservation from "@/components/ecole/EcoleReservation";

export const metadata = {
  title: "École de Glisse — Airfly Martinique",
  description: "Apprenez le kitesurf, wingfoil et kitefoil à Pointe Faula, Vauclin. Moniteurs diplômés, petits groupes, bateau de sécurité.",
};

export default function EcolePage() {
  return (
    <main>
      <EcoleHero />
      <EcoleIntro />
      <EcoleTarifs />
      <EcoleAvis />
      <EcoleReservation />
    </main>
  );
}
