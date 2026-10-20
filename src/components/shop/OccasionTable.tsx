"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { WCProduct } from "@/lib/woocommerce";
import PhotoSurDemande, { WHATSAPP } from "./PhotoSurDemande";

// Vue tableau de la rubrique Occasion.
//
// Les pieces d'occasion sont des ailes qui se ressemblent toutes en vignette :
// le client compare un modele, une taille et un prix, pas une photo. Une ligne
// par piece se lit d'un coup d'oeil la ou la grille obligeait a defiler.

type Tri = "modele" | "taille" | "prix";

type Props = {
  /** Pieces deja filtrees par le catalogue (onglet et sous-categorie actifs). */
  products: WCProduct[];
};

/** "Aile de Kitesurf Dice SLS 2025 12m | Duotone" -> "Dice SLS 2025" */
function modele(p: WCProduct): string {
  return p.name
    .replace(/\s*\|.*$/, "")
    .replace(/^Aile de Kitesurf\s+/i, "")
    .replace(/\s+\d+(?:[.,]\d+)?\s*m$/i, "")
    .trim();
}

function marque(p: WCProduct): string {
  return p.brands?.[0]?.name ?? p.name.split("|")[1]?.trim() ?? "";
}

function attribut(p: WCProduct, nom: string): string | null {
  return p.attributes.find((a) => a.name === nom)?.options[0] ?? null;
}

/** "14M" et "14m" -> "14 m" ; toute autre ecriture est laissee telle quelle. */
function taille(p: WCProduct): string {
  const brut = attribut(p, "Taille");
  if (!brut) return "—";
  const m = brut.trim().match(/^(\d+(?:[.,]\d+)?)\s*m$/i);
  return m ? `${m[1]} m` : brut;
}

function prix(p: WCProduct): { affiche: string | null; barre: string | null } {
  const enPromo = p.on_sale && !!p.sale_price;
  return {
    affiche: enPromo ? p.sale_price : p.regular_price || p.price || null,
    barre: enPromo ? p.regular_price : null,
  };
}

const euros = (v: string) =>
  `${parseFloat(v).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`;

const comparer: Record<Tri, (a: WCProduct, b: WCProduct) => number> = {
  modele: (a, b) => modele(a).localeCompare(modele(b), "fr"),
  taille: (a, b) =>
    (parseFloat(attribut(a, "Taille") ?? "") || 0) - (parseFloat(attribut(b, "Taille") ?? "") || 0),
  prix: (a, b) =>
    (parseFloat(prix(a).affiche ?? "") || 0) - (parseFloat(prix(b).affiche ?? "") || 0),
};

export default function OccasionTable({ products }: Props) {
  const [tri, setTri] = useState<Tri>("modele");
  const [croissant, setCroissant] = useState(true);

  const lignes = [...products].sort((a, b) => (croissant ? 1 : -1) * comparer[tri](a, b));

  const trier = (t: Tri) => {
    if (t === tri) setCroissant(!croissant);
    else {
      setTri(t);
      setCroissant(true);
    }
  };

  const entete = (t: Tri, libelle: string, className = "") => (
    <th
      scope="col"
      aria-sort={tri === t ? (croissant ? "ascending" : "descending") : "none"}
      className={`py-3 font-normal ${className}`}
    >
      <button
        onClick={() => trier(t)}
        className={`uppercase tracking-widest text-[10px] md:text-xs inline-flex items-center gap-1 transition-colors duration-200 ${
          tri === t ? "text-gray-900" : "text-gray-400 hover:text-gray-700"
        }`}
        style={{ fontFamily: "Mirloanne, serif" }}
      >
        {libelle}
        <span aria-hidden className={tri === t ? "opacity-100" : "opacity-0"}>
          {croissant ? "↑" : "↓"}
        </span>
      </button>
    </th>
  );

  return (
    // Largeur bornee : cinq colonnes etalees sur toute la zone du catalogue
    // laissaient un grand vide entre le modele et le prix.
    <div className="max-w-3xl">
    <p className="text-sm text-gray-500 mb-4" style={{ fontFamily: "var(--font-cormorant)" }}>
      Photos sur demande :{" "}
      <a
        href={WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-900 underline underline-offset-2 hover:text-[#FF0080] transition-colors duration-200"
      >
        écrivez-nous sur WhatsApp
      </a>
      .
    </p>
    <table className="w-full border-collapse">
      <caption className="sr-only">Matériel d&apos;occasion et fins de série disponibles au shop</caption>
      <thead>
        <tr className="border-b border-gray-900 text-left">
          <th scope="col" className="w-14 md:w-20 py-3">
            <span className="sr-only">Photo</span>
          </th>
          {/* Mirloanne n a pas de glyphes accentues : "Modele", comme "Decouvrir" ailleurs */}
          {entete("modele", "Modele", "pl-3 md:pl-5")}
          <th
            scope="col"
            className="hidden sm:table-cell py-3 font-normal uppercase tracking-widest text-xs text-gray-400"
            style={{ fontFamily: "Mirloanne, serif" }}
          >
            Marque
          </th>
          {entete("taille", "Taille")}
          {entete("prix", "Prix", "text-right")}
        </tr>
      </thead>
      <tbody>
        {lignes.map((p) => {
          const image = p.images?.[0];
          const couleur = attribut(p, "Couleur");
          const { affiche, barre } = prix(p);
          return (
            // La ligne entiere est cliquable : le lien du modele s'etend sur
            // elle par un pseudo-element, sans imbriquer un <a> autour d'un <tr>.
            <tr
              key={p.id}
              className="relative group border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="py-3">
                <div className="relative w-14 h-[4.5rem] md:w-20 md:h-[6.5rem] bg-white">
                  {image ? (
                    <Image
                      src={image.src}
                      alt={image.alt || p.name}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  ) : (
                    <PhotoSurDemande />
                  )}
                </div>
              </td>
              <td className="py-3 pl-3 md:pl-5">
                {/* Un brouillon n'a pas de fiche : un lien menerait a une 404 */}
                {p.status && p.status !== "publish" ? (
                  <span
                    className="text-gray-900 text-base md:text-lg leading-snug"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {modele(p)}
                  </span>
                ) : (
                  <Link
                    href={`/shop/${p.slug}`}
                    className="text-gray-900 text-base md:text-lg leading-snug after:absolute after:inset-0 group-hover:text-[#FF0080] transition-colors duration-200"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {modele(p)}
                  </Link>
                )}
                {/* Marque sous le modele sur telephone, ou sa colonne est masquee */}
                <p className="sm:hidden text-xs text-gray-400 mt-0.5" style={{ fontFamily: "var(--font-cormorant)" }}>
                  {marque(p)}
                </p>
                {couleur && !modele(p).includes(couleur) && (
                  <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: "var(--font-cormorant)" }}>
                    {couleur}
                  </p>
                )}
              </td>
              <td
                className="hidden sm:table-cell py-3 text-gray-500 text-base"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {marque(p)}
              </td>
              <td
                className="py-3 text-gray-900 text-sm whitespace-nowrap"
                style={{ fontFamily: "Mirloanne, serif" }}
              >
                {taille(p)}
              </td>
              <td className="py-3 text-right text-sm whitespace-nowrap" style={{ fontFamily: "Mirloanne, serif" }}>
                {barre && <span className="block text-gray-400 line-through text-xs">{euros(barre)}</span>}
                {affiche && <span className={barre ? "text-[#FF0080]" : "text-gray-900"}>{euros(affiche)}</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
    </div>
  );
}
