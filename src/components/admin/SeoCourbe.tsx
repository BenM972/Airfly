"use client";

import { useId, useState } from "react";

/**
 * Courbe d'evolution sur 28 jours, une mesure par graphique.
 *
 * Deliberement PAS de double axe : les clics se comptent en dizaines et les
 * impressions en milliers, et superposer deux echelles sur un meme cadre
 * fabrique des croisements qui ne veulent rien dire. Deux petits graphiques
 * empiles, partageant la meme plage de dates, disent la meme chose sans mentir.
 *
 * Une seule serie par graphique, donc pas de legende : le titre la nomme.
 */

export type Point = { date: string; valeur: number };

const L = 44;  // marge gauche, pour les etiquettes de valeur
const R = 10;
const H_HAUT = 12;
const H_BAS = 22; // marge basse, pour les dates
const W = 640;
const H = 150;

function joli(n: number): string {
  return n >= 10000 ? `${Math.round(n / 1000)} k` : n.toLocaleString("fr-FR");
}

function dateCourte(iso: string): string {
  const [, m, j] = iso.split("-");
  return `${j}/${m}`;
}

export default function SeoCourbe({
  titre,
  points,
  couleur,
}: {
  titre: string;
  points: Point[];
  couleur: string;
}) {
  const id = useId();
  const [survol, setSurvol] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <div className="bg-gray-900 border border-gray-800 p-6">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-3" style={{ fontFamily: "Mirloanne, serif" }}>
          {titre}
        </p>
        <p className="text-gray-600 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>
          Pas encore assez de jours pour tracer une courbe.
        </p>
      </div>
    );
  }

  // Echelle : le maximum reel, jamais un zero qui ecraserait tout sur la ligne.
  const max = Math.max(...points.map((p) => p.valeur), 1);
  const x = (i: number) => L + (i / (points.length - 1)) * (W - L - R);
  const y = (v: number) => H_HAUT + (1 - v / max) * (H - H_HAUT - H_BAS);

  const ligne = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.valeur).toFixed(1)}`).join(" ");
  const aire = `${ligne} L${x(points.length - 1).toFixed(1)},${(H - H_BAS).toFixed(1)} L${L},${(H - H_BAS).toFixed(1)} Z`;

  const dernier = points[points.length - 1];
  const actif = survol !== null ? points[survol] : null;

  // Trois graduations suffisent : zero, milieu, maximum.
  const graduations = [0, max / 2, max];

  return (
    <div className="bg-gray-900 border border-gray-800 p-5 relative">
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-gray-400 text-xs uppercase tracking-widest" style={{ fontFamily: "Mirloanne, serif" }}>
          {titre}
        </p>
        <p
          className="text-sm tabular-nums"
          style={{ fontFamily: "var(--font-cormorant)", color: couleur }}
        >
          {actif ? `${joli(actif.valeur)} le ${dateCourte(actif.date)}` : `${joli(dernier.valeur)} le ${dateCourte(dernier.date)}`}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`${titre} sur 28 jours, de ${dateCourte(points[0].date)} a ${dateCourte(dernier.date)}`}
        onPointerLeave={() => setSurvol(null)}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          const i = Math.round(((px - L) / (W - L - R)) * (points.length - 1));
          setSurvol(Math.min(points.length - 1, Math.max(0, i)));
        }}
      >
        <defs>
          <linearGradient id={`degrade-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={couleur} stopOpacity="0.28" />
            <stop offset="100%" stopColor={couleur} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grille discrete : elle situe, elle ne se regarde pas. */}
        {graduations.map((v) => (
          <g key={v}>
            <line x1={L} y1={y(v)} x2={W - R} y2={y(v)} stroke="#1f2937" strokeWidth="1" fill="none" />
            <text
              x={L - 8}
              y={y(v) + 3.5}
              textAnchor="end"
              fontSize="10"
              fill="#6b7280"
              fontFamily="var(--font-cormorant), serif"
            >
              {joli(Math.round(v))}
            </text>
          </g>
        ))}

        <path d={aire} fill={`url(#degrade-${id})`} stroke="none" />
        <path d={ligne} fill="none" stroke={couleur} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Extremite mise en avant : c'est la valeur qu'on lit en premier. */}
        <circle cx={x(points.length - 1)} cy={y(dernier.valeur)} r="4" fill={couleur} stroke="#111827" strokeWidth="2" />

        {actif && survol !== null && (
          <g>
            <line x1={x(survol)} y1={H_HAUT} x2={x(survol)} y2={H - H_BAS} stroke="#374151" strokeWidth="1" fill="none" />
            <circle cx={x(survol)} cy={y(actif.valeur)} r="4.5" fill={couleur} stroke="#111827" strokeWidth="2" />
          </g>
        )}

        {/* Premiere et derniere date seulement : 28 etiquettes se chevaucheraient. */}
        <text x={L} y={H - 6} fontSize="10" fill="#6b7280" fontFamily="var(--font-cormorant), serif">
          {dateCourte(points[0].date)}
        </text>
        <text x={W - R} y={H - 6} textAnchor="end" fontSize="10" fill="#6b7280" fontFamily="var(--font-cormorant), serif">
          {dateCourte(dernier.date)}
        </text>
      </svg>
    </div>
  );
}
