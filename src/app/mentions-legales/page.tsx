import type { Metadata } from "next";
import PageLegale from "@/components/legal/PageLegale";

const title = "Mentions légales";
const description =
  "Mentions légales du site airfly972.com — éditeur, directeur de publication, hébergeur et conditions d'utilisation.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/mentions-legales" },
  // Page de service : utile aux visiteurs, sans interet dans les resultats de recherche.
  robots: { index: false, follow: true },
};

export default function MentionsLegales() {
  return (
    <PageLegale titre="Mentions legales" maj="18 août 2026">
      <h2>Éditeur du site</h2>
      <dl>
        <dt>Dénomination sociale</dt>
        <dd>AIRFLY</dd>
        <dt>Forme juridique</dt>
        <dd>Société à responsabilité limitée (SARL)</dd>
        <dt>Siège social</dt>
        <dd>Pointe Faula, 97280 Le Vauclin, Martinique</dd>
        <dt>SIRET</dt>
        <dd>490 460 375 00010</dd>
        <dt>RCS</dt>
        <dd>Fort-de-France 490 460 375</dd>
        <dt>TVA intracommunautaire</dt>
        <dd>FR68 490 460 375</dd>
        <dt>Code APE</dt>
        <dd>9329Z — Autres activités récréatives et de loisirs</dd>
        <dt>Téléphone</dt>
        <dd>+596 596 76 25 31</dd>
        <dt>Courriel</dt>
        <dd>
          <a href="mailto:info@airfly972.com">info@airfly972.com</a>
        </dd>
      </dl>

      <h2>Directeur de la publication</h2>
      <p>Yves Maisonneuve, gérant de la société AIRFLY.</p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par Hostinger International Ltd., 61 Lordou Vironos Street, 6023 Larnaca,
        Chypre. Site : <a href="https://www.hostinger.fr" target="_blank" rel="noopener noreferrer">hostinger.fr</a>
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus du site — textes, photographies, logos, éléments graphiques et
        structure — est protégé par le droit de la propriété intellectuelle. Toute reproduction ou
        représentation, totale ou partielle, sans autorisation écrite préalable d&apos;AIRFLY est
        interdite.
      </p>
      <p>
        Les photographies et le logo de Salty Lodge, présentés dans la section Partenaires, restent la
        propriété de leur titulaire et sont utilisés avec son accord.
      </p>

      <h2>Responsabilité</h2>
      <p>
        AIRFLY s&apos;efforce de maintenir les informations du site exactes et à jour. Les tarifs, les
        disponibilités et les caractéristiques des produits sont donnés à titre indicatif et peuvent
        évoluer. Ils ne constituent pas une offre contractuelle : toute réservation ou commande fait
        l&apos;objet d&apos;une confirmation.
      </p>
      <p>
        Les articles présentés dans la boutique sont réservables en retrait sur place, sans
        prépaiement en ligne. La disponibilité est confirmée par AIRFLY avant le retrait. Le stock
        présenté en magasin peut différer de celui du site.
      </p>

      <h2>Liens hypertextes</h2>
      <p>
        Le site comporte des liens vers des sites tiers, notamment celui de notre partenaire
        hébergement et nos pages sur les réseaux sociaux. AIRFLY n&apos;exerce aucun contrôle sur ces
        sites et décline toute responsabilité quant à leur contenu.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Le traitement des données personnelles est décrit dans notre{" "}
        <a href="/politique-de-confidentialite">politique de confidentialité</a>.
      </p>

      <h2>Droit applicable</h2>
      <p>
        Les présentes mentions sont soumises au droit français. En cas de litige, et à défaut de
        résolution amiable, les tribunaux compétents sont ceux du ressort de Fort-de-France.
      </p>
    </PageLegale>
  );
}
