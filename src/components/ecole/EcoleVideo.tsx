"use client";

import { useState } from "react";
import Image from "next/image";
import { videoEcole as v } from "@/data/video";

/**
 * Video de presentation, chargee au clic.
 *
 * L'iframe YouTube n'est pas montee au rendu initial. Une iframe de lecture
 * pese plusieurs centaines de kilo-octets et une dizaine de requetes tierces,
 * et elle serait devenue le plus grand element peint de la page — donc son LCP.
 * L'audit du 17 septembre venait justement de ramener /ecole de 5 356 a
 * 1 264 ms : monter une iframe ici l'aurait annule.
 *
 * Ce qui est servi, c'est la miniature optimisee et le texte. Le visiteur qui
 * clique recoit l'iframe avec `autoplay`, donc un seul clic en tout. Le
 * balisage `VideoObject` accompagne la page dans les deux cas : la video est
 * bien sur la page, ce que Google demande pour la declarer.
 */
export default function EcoleVideo() {
  const [lecture, setLecture] = useState(false);

  return (
    <section className="bg-[#f5f0e8] py-24 px-6 md:px-16">
      <div className="max-w-4xl mx-auto">

        <h2
          className="text-gray-900 uppercase tracking-widest text-sm text-center mb-12"
          style={{ fontFamily: "Mirloanne, serif" }}
        >
          En video
        </h2>

        <div className="relative aspect-video overflow-hidden bg-black">
          {lecture ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
              title={v.titre}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setLecture(true)}
              className="group absolute inset-0 h-full w-full cursor-pointer"
              aria-label={`Lire la video : ${v.legende}`}
            >
              <Image
                src={v.miniature}
                alt={v.legende}
                width={v.miniatureLargeur}
                height={v.miniatureHauteur}
                sizes="(max-width: 896px) 100vw, 896px"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/10" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FF0080] transition-transform duration-300 group-hover:scale-110">
                  {/* Triangle de lecture, legerement decale a droite pour
                      compenser son centre de gravite optique. */}
                  <span className="ml-1 block h-0 w-0 border-y-[12px] border-l-[20px] border-y-transparent border-l-white" />
                </span>
              </span>
            </button>
          )}
        </div>

        <p
          className="mt-5 text-center text-base text-gray-600"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {v.legende}
        </p>

      </div>
    </section>
  );
}
