"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import SectionTitle from "../SectionTitle";
import Link from "next/link";

const tabs = ["Kitesurf", "Wingfoil", "Kitefoil"] as const;
type Tab = typeof tabs[number];

const tarifs: Record<Tab, { label: string; detail: string; price: string; badge?: string; note?: string }[]> = {
  Kitesurf: [
    { label: "Cours collectif", detail: "3h · 3 eleves max", price: "115 €", badge: "Populaire" },
    { label: "Navigation integree", detail: "Session sur le spot · meme creneau que le cours collectif", price: "85 €", note: "Prestation distincte du cours collectif — les deux se deroulent sur le meme creneau." },
    { label: "Cours solo", detail: "2h · encadrement exclusif", price: "200 €" },
    { label: "Cours duo", detail: "2h · groupe constitue uniquement", price: "135 € / pers.", note: "Uniquement pour un groupe deja forme — deux personnes seules ne peuvent pas composer un duo." },
    { label: "Tracte / Simulateur", detail: "Waterstart & equilibre en traction douce sans gestion du kite", price: "Sur demande", note: "Ideal pour progresser rapidement ou s'entrainer sans vent. Tracte par bateau ou simulateur a terre." },
  ],
  Wingfoil: [
    { label: "Cours collectif", detail: "2h · 2 eleves max · inscription individuelle", price: "135 € / pers.", badge: "Populaire", note: "Pas besoin de venir a deux — les places sont ouvertes a tous." },
    { label: "Cours trio", detail: "3h · groupe constitue uniquement", price: "100 € / pers.", note: "Session reservee a un groupe deja forme de 3 personnes." },
    { label: "Initiation wing", detail: "1h30 · paddle avec une aile de wing · tous niveaux", price: "90 € / pers." },
    { label: "Tracte / Simulateur", detail: "Foil tracte derriere bateau — equilibre sans gestion de l'aile", price: "Sur demande", note: "Progresser sur le foil en conditions controlees, vent ou pas. Ideal en debut de formation." },
  ],
  Kitefoil: [
    { label: "Cours solo", detail: "2h · encadrement exclusif", price: "150 €", badge: "Recommande" },
    { label: "Cours duo", detail: "2h · 2 eleves", price: "135 € / pers." },
    { label: "Tracte / Simulateur", detail: "Foil tracte bateau · simulateur mast fixe · apprentissage accelere", price: "Sur demande", note: "La methode la plus rapide pour apprendre le kitefoil : simulateur mast fixe sur bateau ou traction douce — concentration totale sur l'equilibre et le pilotage." },
  ],
};

const kiteLoyaltyRates = [
  { label: "Cours collectif", before: "115 €", after: "100 €" },
  { label: "Cours solo", before: "200 €", after: "175 €" },
  { label: "Cours duo", before: "135 € / pers.", after: "115 € / pers." },
];

const options = [
  { label: "Navigation integree", detail: "Session accompagnee sur le spot", price: "85 €", note: "Incluse avec le cours collectif" },
  { label: "Depart de plage", detail: "Technique de lancement autonome", price: "85 €" },
  { label: "Coaching perfection", detail: "Tricks & progression avancee" },
];

export default function EcoleTarifs() {
  const [activeTab, setActiveTab] = useState<Tab>("Kitesurf");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="bg-gray-950 py-24 px-6 md:px-16" ref={ref}>
      <div className="max-w-4xl mx-auto">

        <SectionTitle title="Tarifs" className="mb-12 [&_h2]:text-white [&_span]:text-white" />

        {/* Onglets */}
        <motion.div
          className="flex justify-center gap-2 mb-10 flex-wrap"
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`uppercase tracking-widest text-sm px-6 py-2.5 border transition-colors duration-300 ${
                activeTab === tab
                  ? "bg-[#FF0080] border-[#FF0080] text-white"
                  : "border-white/30 text-white/50 hover:border-white/60 hover:text-white"
              }`}
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Grille tarifaire */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="grid gap-4 mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            {tarifs[activeTab].map((t) => (
              <div
                key={t.label}
                className="bg-gray-900 px-6 py-5 border border-gray-800 hover:border-[#FF0080]/40 transition-colors duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p
                        className="text-white uppercase tracking-widest text-sm"
                        style={{ fontFamily: "Mirloanne, serif" }}
                      >
                        {t.label}
                      </p>
                      {t.badge && (
                        <span
                          className="text-[10px] uppercase tracking-widest bg-[#FF0080] text-white px-2 py-0.5"
                          style={{ fontFamily: "Mirloanne, serif" }}
                        >
                          {t.badge}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-gray-400 text-sm"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {t.detail}
                    </p>
                  </div>
                  <p
                    className={`text-xl font-light whitespace-nowrap ml-6 ${t.price === "Sur demande" ? "text-[#FF0080]/80 text-base italic" : "text-white"}`}
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {t.price}
                  </p>
                </div>
                {t.note && (
                  <p
                    className="mt-3 text-gray-500 text-xs border-t border-gray-800 pt-3 italic"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {t.note}
                  </p>
                )}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bloc fidelite Kitesurf */}
        <AnimatePresence>
          {activeTab === "Kitesurf" && (
            <motion.div
              key="fidelite"
              className="mb-10 border border-[#FF0080]/20 bg-gray-900/60 px-6 py-5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[#FF0080] text-xs">◆</span>
                <p
                  className="uppercase tracking-widest text-xs text-[#FF0080]"
                  style={{ fontFamily: "Mirloanne, serif" }}
                >
                  Tarifs fidelite — a partir du 4eme cours
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {kiteLoyaltyRates.map((r) => (
                  <div key={r.label} className="flex flex-col gap-1">
                    <p
                      className="text-gray-400 text-xs uppercase tracking-widest"
                      style={{ fontFamily: "Mirloanne, serif" }}
                    >
                      {r.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-white text-lg" style={{ fontFamily: "var(--font-cormorant)" }}>
                        {r.after}
                      </p>
                      <p className="text-gray-600 text-sm line-through" style={{ fontFamily: "var(--font-cormorant)" }}>
                        {r.before}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Options perfectionnement */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p
            className="uppercase tracking-widest text-xs text-[#FF0080] mb-4"
            style={{ fontFamily: "Mirloanne, serif" }}
          >
            Options & perfectionnement
          </p>
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {options.map((o) => (
              <div key={o.label} className="bg-gray-900 px-5 py-4 border border-gray-800">
                <p
                  className="text-white uppercase tracking-widest text-xs mb-1"
                  style={{ fontFamily: "Mirloanne, serif" }}
                >
                  {o.label}
                </p>
                <p
                  className="text-gray-400 text-sm mb-2"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {o.detail}
                </p>
                {"price" in o && o.price ? (
                  <p className="text-[#FF0080] text-lg" style={{ fontFamily: "var(--font-cormorant)" }}>
                    {o.price}
                  </p>
                ) : o.note ? (
                  <p className="text-[#FF0080]/70 text-xs italic" style={{ fontFamily: "var(--font-cormorant)" }}>
                    {o.note}
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm italic" style={{ fontFamily: "var(--font-cormorant)" }}>
                    Prix sur demande
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Note assurance */}
        <p
          className="text-gray-600 text-xs text-center mb-10"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          * Licence FFVL ou FFV requise (assurance RC incluse). Une assurance personnelle couvrant la pratique du kitesurf est également acceptée. Renseignez-vous lors de votre réservation.
        </p>

        {/* CTA */}
        <div className="flex justify-center">
          <Link
            href="#reservation"
            className="border border-white text-white uppercase tracking-widest text-sm px-10 py-4 hover:bg-white hover:text-black transition-colors duration-300"
            style={{ fontFamily: "Mirloanne, serif" }}
          >
            Reserver un cours
          </Link>
        </div>

      </div>
    </section>
  );
}
