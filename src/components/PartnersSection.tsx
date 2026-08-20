import SectionTitle from "./SectionTitle";
import PartnerCard from "./PartnerCard";
import PartnerCardCompacte from "./PartnerCardCompacte";
import { partners } from "@/data/partners";

/**
 * Composant serveur : contenu statique, indexable, sans etat.
 * Ne rend rien tant qu'aucun partenaire n'est renseigne, ce qui permet de
 * livrer le code avant de disposer des visuels.
 *
 * Deux niveaux d'affichage, decides par le champ `niveau` de chaque entree et
 * non par l'ordre du tableau : grande carte pour les partenaires principaux,
 * carte compacte regroupee en dessous pour les autres.
 */
export default function PartnersSection() {
  if (partners.length === 0) return null;

  const principaux = partners.filter((p) => p.niveau !== "secondaire");
  const secondaires = partners.filter((p) => p.niveau === "secondaire");

  return (
    <section id="partenaires" className="bg-[#f5f0e8] py-24 px-10 md:px-16">
      <div className="max-w-7xl mx-auto">
        <SectionTitle title="Partenaires" className="mb-12" />

        {principaux.length > 0 && (
          <div className="space-y-20">
            {principaux.map((partner, i) => (
              <PartnerCard key={partner.slug} partner={partner} index={i} />
            ))}
          </div>
        )}

        {/* Un seul partenaire secondaire : on borne le bloc entier, filet
            compris. Un filet pleine largeur au-dessus d'une carte a mi-largeur
            donnait un ensemble bancal. */}
        {secondaires.length > 0 && (
          <div
            className={`${principaux.length > 0 ? "mt-20" : ""} ${
              secondaires.length > 1 ? "" : "md:max-w-3xl"
            }`}
          >
            {/* Intitule discret, encadre d'un filet : il annonce un changement
                de registre sans reprendre le poids d'un titre de section. */}
            <div className="mb-8 flex items-center gap-4">
              <span className="text-[8px] text-[#FF0080]" aria-hidden="true">◆</span>
              <p
                className="shrink-0 text-xs uppercase tracking-[0.25em] text-gray-500"
                style={{ fontFamily: "Mirloanne, serif" }}
              >
                Aussi partenaires
              </p>
              <span className="h-px flex-1 bg-gray-300" aria-hidden="true" />
            </div>
            {/* Une colonne tant qu'ils sont peu nombreux, deux des qu'il y en
                a assez pour qu'une ligne unique paraisse etiree. */}
            <div className={`grid gap-4 ${secondaires.length > 1 ? "md:grid-cols-2" : ""}`}>
              {secondaires.map((partner) => (
                <PartnerCardCompacte key={partner.slug} partner={partner} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
