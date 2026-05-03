"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import SectionTitle from "../SectionTitle";
import Link from "next/link";

const tabs = ["Kitesurf", "Wingfoil", "Kitefoil"] as const;
type Tab = typeof tabs[number];

const tarifs: Record<Tab, { label: string; detail: string; price: string; badge?: string }[]> = {
  Kitesurf: [
    { label: "Cours en groupe", detail: "3h · 3 élèves max", price: "115 €", badge: "Populaire" },
    { label: "Cours solo", detail: "2h · encadrement exclusif", price: "200 €" },
    { label: "Cours duo", detail: "2h · 2 élèves", price: "135 € / pers." },
    { label: "À partir du 4ème cours", detail: "2h · groupe", price: "100 €" },
  ],
  Wingfoil: [
    { label: "Cours duo", detail: "2h · 2 élèves max", price: "135 € / pers.", badge: "Populaire" },
    { label: "Cours trio", detail: "3h · 3 élèves", price: "100 € / pers." },
    { label: "Initiation paddle", detail: "1h30 · tous niveaux", price: "90 € / pers." },
  ],
  Kitefoil: [
    { label: "Cours solo", detail: "2h · encadrement exclusif", price: "150 €", badge: "Recommandé" },
    { label: "Cours duo", detail: "2h · 2 élèves", price: "135 € / pers." },
  ],
};

const options = [
  { label: "Navigation guidée", detail: "Session accompagnée sur le spot", price: "85 €" },
  { label: "Départ de plage", detail: "Technique de lancement autonome", price: "85 €" },
  { label: "Coaching perfection", detail: "Tricks & progression avancée", price: "100 €" },
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
            className="grid gap-4 mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            {tarifs[activeTab].map((t) => (
              <div
                key={t.label}
                className="flex items-center justify-between bg-gray-900 px-6 py-5 border border-gray-800 hover:border-[#FF0080]/40 transition-colors duration-300"
              >
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
                  className="text-white text-xl font-light whitespace-nowrap ml-6"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {t.price}
                </p>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Options avancées */}
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
                <p
                  className="text-[#FF0080] text-lg"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {o.price}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Note assurance */}
        <p
          className="text-gray-600 text-xs text-center mb-10"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          * Licence FFVL ou FFV requise (assurance RC incluse). Renseignez-vous lors de votre réservation.
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
