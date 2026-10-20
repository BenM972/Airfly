"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FIN_HALLOWEEN as FIN } from "@/data/halloween";

/**
 * Habillage Halloween : chauves-souris, araignee suspendue a la navbar et
 * toile dans un coin. Purement decoratif.
 *
 * Il disparait seul le 1er novembre 2026 a 6 h, heure de Martinique (UTC-4,
 * sans heure d'ete). La date est lue dans le navigateur, et non au rendu
 * serveur : les pages sont mises en cache (CDN, revalidation), un HTML genere
 * le 31 au soir aurait sinon garde l'habillage jusqu'a sa prochaine
 * regeneration. Une page restee ouverte le retire aussi a l'heure dite.
 *
 * Rien n'est rendu cote serveur : aucun effet sur le HTML indexe ni sur le
 * LCP, et tous les elements sont `fixed` — aucun decalage de mise en page.
 *
 * Apres l'echeance : supprimer ce fichier, data/halloween.ts, app/halloween.css
 * et leurs lignes dans app/layout.tsx (import, police Creepster, script).
 */

// Toile en quart de cercle, ancree au coin inferieur gauche (0,100).
// Rayons tous les 15 degres, fils concentriques legerement creuses vers le coin.
const TOILE = (() => {
  const angles = [0, 15, 30, 45, 60, 75, 90].map((d) => (d * Math.PI) / 180);
  const pt = (r: number, a: number) => [r * Math.cos(a), 100 - r * Math.sin(a)] as const;
  const rayons = angles.map((a) => {
    const [x, y] = pt(100, a);
    return `M0 100L${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  const fils = [22, 40, 58, 76, 94].map((r) => {
    let d = "";
    angles.forEach((a, i) => {
      const [x, y] = pt(r, a);
      if (i === 0) d += `M${x.toFixed(1)} ${y.toFixed(1)}`;
      else {
        const m = (angles[i - 1] + a) / 2;
        const [cx, cy] = pt(r * 0.86, m);
        d += `Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    });
    return d;
  });
  return [...rayons, ...fils].join("");
})();

const CHAUVE_SOURIS =
  "M32 9c-1-2-2.5-3.5-2.5-3.5L28.6 9C23 4.5 15 3 7 5c4.5 2 7 5 7 9.5-3.5-2-8-2.2-12-.2 3.5 1.2 6 4.5 6 8.5 4.5-3.5 10.5-4.5 15.5-2 2.3 1.1 4.2 3 5.4 5.2h6c1.2-2.2 3.1-4.1 5.4-5.2 5-2.5 11-1.5 15.5 2 0-4 2.5-7.3 6-8.5-4-2-8.5-1.8-12 .2 0-4.5 2.5-7.5 7-9.5-8-2-16-.5-21.6 4L34.5 5.5S33 7 32 9z";

// Trajectoires : hauteur de depart, duree du cycle, retard, taille
const VOLS = [
  { top: "18%", duree: 16, retard: 1, taille: "w-10 md:w-14" },
  { top: "34%", duree: 21, retard: 7, taille: "w-7 md:w-10" },
  { top: "12%", duree: 26, retard: 13, taille: "w-8 md:w-12" },
];

export default function HalloweenHabillage() {
  const pathname = usePathname();
  const [actif, setActif] = useState(false);

  useEffect(() => {
    const reste = FIN - Date.now();
    if (reste <= 0) return;
    // Lancement differe d'un tick : l'etat ne change pas pendant l'effet lui-meme
    const debut = setTimeout(() => setActif(true), 0);
    // setTimeout plafonne a ~24,8 jours ; au-dela, la page sera rechargee d'ici la
    // A l'echeance, le theme (couleurs, police) part avec les decors
    const fin =
      reste < 2 ** 31 - 1
        ? setTimeout(() => {
            setActif(false);
            document.documentElement.classList.remove("halloween");
          }, reste)
        : undefined;
    return () => {
      clearTimeout(debut);
      if (fin) clearTimeout(fin);
    };
  }, []);

  if (!actif || pathname.startsWith("/admin")) return null;

  return (
    <div aria-hidden="true" className="halloween pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <style>{`
        @keyframes halloween-vol {
          0%   { transform: translate(-15vw, 0); }
          12%  { transform: translate(15vw, -6vh); }
          24%  { transform: translate(45vw, 4vh); }
          36%  { transform: translate(75vw, -5vh); }
          48%  { transform: translate(115vw, 2vh); }
          100% { transform: translate(115vw, 2vh); }
        }
        @keyframes halloween-ailes {
          from { transform: scaleY(1); }
          to   { transform: scaleY(0.45); }
        }
        @keyframes halloween-fil {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(28px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .halloween * { animation: none !important; }
          .halloween .vol { display: none; }
        }
      `}</style>

      {/* Chauves-souris : traversent l'ecran puis attendent leur tour */}
      {VOLS.map((v, i) => (
        <div
          key={i}
          className="vol absolute left-0"
          style={{
            top: v.top,
            transform: "translate(-15vw, 0)",
            animation: `halloween-vol ${v.duree}s ease-in-out ${v.retard}s infinite`,
          }}
        >
          <svg
            viewBox="0 0 64 32"
            className={`${v.taille} h-auto text-gray-900/85 drop-shadow-[0_0_6px_rgba(255,122,0,0.55)]`}
            style={{ animation: `halloween-ailes ${0.18 + i * 0.03}s ease-in-out infinite alternate` }}
          >
            <path d={CHAUVE_SOURIS} fill="currentColor" />
          </svg>
        </div>
      ))}

      {/* Araignee suspendue sous la navbar, a droite. Le halo blanc la detache
          des photos sombres, sur lesquelles une silhouette noire disparaissait. */}
      <div
        className="absolute top-0 right-5 md:right-12 flex flex-col items-center"
        style={{ animation: "halloween-fil 5s ease-in-out infinite" }}
      >
        <div className="w-px h-24 md:h-32 bg-white/80 shadow-[0_0_2px_rgba(0,0,0,0.6)]" />
        <svg viewBox="0 0 40 40" className="w-8 md:w-10 -mt-1 text-gray-900 drop-shadow-[0_0_5px_rgba(255,255,255,0.9)]">
          <g stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round">
            <path d="M16 18 8 10 4 14M16 21 6 18 2 23M16 24 7 27 4 33M17 26 11 33 10 38" />
            <path d="M24 18 32 10 36 14M24 21 34 18 38 23M24 24 33 27 36 33M23 26 29 33 30 38" />
          </g>
          <ellipse cx="20" cy="17" rx="4" ry="3.6" fill="currentColor" />
          <ellipse cx="20" cy="25" rx="5.5" ry="6.5" fill="currentColor" />
          <circle cx="18.6" cy="16.4" r="0.9" fill="#FF7A00" />
          <circle cx="21.4" cy="16.4" r="0.9" fill="#FF7A00" />
        </svg>
      </div>

      {/* Toile dans le coin inferieur gauche, a l'oppose du chatbot. Reduite et
          plus discrete sur telephone, ou elle recouvrait le texte. */}
      <svg
        viewBox="0 0 100 100"
        className="absolute bottom-0 left-0 w-16 sm:w-28 md:w-48 h-auto text-white/50 md:text-white/75 drop-shadow-[0_0_1.5px_rgba(0,0,0,0.7)]"
      >
        <path d={TOILE} stroke="currentColor" strokeWidth="0.8" fill="none" />
      </svg>
    </div>
  );
}
