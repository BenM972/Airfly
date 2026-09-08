import Link from "next/link";
import type { Metadata } from "next";

/**
 * Page 404.
 *
 * Jusqu'ici le site servait celle de Next : « 404: This page could not be
 * found. » — en anglais, sur un site francais, sans aucune indication de ce
 * qu'il faut faire ensuite. Elle rendait bien la navigation et le pied de page,
 * donc ce n'etait pas une impasse, mais elle n'orientait personne.
 *
 * Elle compte doublement ici. Le domaine a porte quatre generations de site
 * depuis 2005, et 76 anciennes URLs ont ete relevees en 404 le 8 septembre
 * 2026. Celles qui ont un equivalent sont redirigees (voir
 * redirections-anciennes-urls.mjs) ; les autres aboutissent volontairement ici,
 * parce qu'une 404 franche vaut mieux qu'une redirection vers une page sans
 * rapport. Autant que cette page fasse son travail.
 *
 * `notFound()` renvoie bien un vrai statut 404 : c'est ce que Google doit lire.
 */

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: true },
};

const pistes = [
  { href: "/ecole", titre: "École de glisse", texte: "Cours de kitesurf, wingfoil et kitefoil, tarifs et réservation." },
  { href: "/shop", titre: "Surf shop", texte: "Matériel, textile et soins solaires, à retirer en boutique." },
  { href: "/#spot", titre: "Le spot", texte: "Pointe Faula, Le Vauclin : conditions, vent et saison." },
  { href: "/#hebergement", titre: "Hébergement", texte: "Nos partenaires à deux pas du lagon." },
];

export default function NotFound() {
  return (
    <main className="bg-[#f5f0e8] min-h-[70vh] px-6 md:px-16 py-24">
      <div className="max-w-3xl mx-auto">
        <p
          className="text-[#FF0080] uppercase tracking-widest text-xs mb-4"
          style={{ fontFamily: "Mirloanne, serif" }}
        >
          Erreur 404
        </p>

        <h1
          className="text-gray-900 text-3xl md:text-4xl font-light mb-6 leading-tight"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Cette page n&apos;existe pas, ou plus
        </h1>

        <p
          className="text-gray-600 text-lg leading-relaxed mb-12"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Le site a changé plusieurs fois depuis 2005, et certaines adresses
          d&apos;époque n&apos;ont pas d&apos;équivalent aujourd&apos;hui. Si
          vous arrivez d&apos;un lien ou d&apos;un favori ancien, voici où
          retrouver ce que vous cherchiez.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {pistes.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="block bg-white border border-gray-200 px-6 py-5 hover:border-[#FF0080]/50 transition-colors duration-300"
            >
              <p
                className="text-gray-900 uppercase tracking-widest text-sm mb-2"
                style={{ fontFamily: "Mirloanne, serif" }}
              >
                {p.titre}
              </p>
              <p
                className="text-gray-500 text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {p.texte}
              </p>
            </Link>
          ))}
        </div>

        <p
          className="text-gray-500 text-sm"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Vous ne trouvez pas ?{" "}
          <a href="tel:+596596762531" className="text-[#FF0080] hover:underline">
            +596 596 76 25 31
          </a>{" "}
          ou{" "}
          <a href="mailto:info@airfly972.com" className="text-[#FF0080] hover:underline">
            info@airfly972.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
