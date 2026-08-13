import SectionTitle from "./SectionTitle";
import PartnerCard from "./PartnerCard";
import { partners } from "@/data/partners";

/**
 * Composant serveur : contenu statique, indexable, sans etat.
 * Ne rend rien tant qu'aucun partenaire n'est renseigne, ce qui permet de
 * livrer le code avant de disposer des visuels.
 */
export default function PartnersSection() {
  if (partners.length === 0) return null;

  return (
    <section id="partenaires" className="bg-[#f5f0e8] py-24 px-10 md:px-16">
      <div className="max-w-7xl mx-auto">
        <SectionTitle title="Partenaires" className="mb-12" />

        <div className="space-y-20">
          {partners.map((partner, i) => (
            <PartnerCard key={partner.slug} partner={partner} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
