"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import SectionTitle from "../SectionTitle";

const niveaux = ["Débutant", "Intermédiaire", "Avancé"];

const prestations: Record<string, { label: string; detail: string; price: string }[]> = {
  Kitesurf: [
    { label: "Cours en groupe", detail: "3h · 3 élèves max", price: "115 €" },
    { label: "Cours solo", detail: "2h · encadrement exclusif", price: "200 €" },
    { label: "Cours duo", detail: "2h · 2 élèves", price: "135 € / pers." },
    { label: "À partir du 4ème cours", detail: "2h · groupe", price: "100 €" },
  ],
  Wingfoil: [
    { label: "Cours duo", detail: "2h · 2 élèves max", price: "135 € / pers." },
    { label: "Cours trio", detail: "3h · 3 élèves", price: "100 € / pers." },
    { label: "Initiation paddle", detail: "1h30 · tous niveaux", price: "90 € / pers." },
  ],
  Kitefoil: [
    { label: "Cours solo", detail: "2h · encadrement exclusif", price: "150 €" },
    { label: "Cours duo", detail: "2h · 2 élèves", price: "135 € / pers." },
  ],
};

const inputClass = "w-full border border-gray-200 bg-[#f5f0e8] px-4 py-3 text-gray-900 focus:outline-none focus:border-[#FF0080] transition-colors";
const labelClass = "block text-xs uppercase tracking-widest text-gray-500 mb-2";

export default function EcoleReservation() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discipline, setDiscipline] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section id="reservation" className="bg-white py-24 px-6 md:px-16" ref={ref}>
      <div className="max-w-2xl mx-auto">

        <SectionTitle title="Reserver un cours" className="mb-4" />
        <motion.p
          className="text-center text-gray-500 text-lg mb-12"
          style={{ fontFamily: "var(--font-cormorant)" }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          On vous recontacte sous 24h pour confirmer votre créneau.
        </motion.p>

        {submitted ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[#FF0080] text-4xl mb-4">◆</p>
            <p className="text-gray-900 text-2xl uppercase tracking-widest mb-3" style={{ fontFamily: "Mirloanne, serif" }}>
              Demande envoyée !
            </p>
            <p className="text-gray-500 text-lg" style={{ fontFamily: "var(--font-cormorant)" }}>
              On vous recontacte très prochainement. À bientôt sur l'eau !
            </p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Nom & Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={{ fontFamily: "Mirloanne, serif" }}>Prénom</label>
                <input required type="text" className={inputClass} style={{ fontFamily: "var(--font-cormorant)" }} />
              </div>
              <div>
                <label className={labelClass} style={{ fontFamily: "Mirloanne, serif" }}>Nom</label>
                <input required type="text" className={inputClass} style={{ fontFamily: "var(--font-cormorant)" }} />
              </div>
            </div>

            {/* Email & Téléphone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={{ fontFamily: "Mirloanne, serif" }}>Email</label>
                <input required type="email" className={inputClass} style={{ fontFamily: "var(--font-cormorant)" }} />
              </div>
              <div>
                <label className={labelClass} style={{ fontFamily: "Mirloanne, serif" }}>Téléphone</label>
                <input type="tel" className={inputClass} style={{ fontFamily: "var(--font-cormorant)" }} />
              </div>
            </div>

            {/* Discipline */}
            <div>
              <label className={labelClass} style={{ fontFamily: "Mirloanne, serif" }}>Discipline</label>
              <select
                required
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className={inputClass}
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                <option value="">Choisir...</option>
                {Object.keys(prestations).map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>

            {/* Prestation — apparaît après choix discipline */}
            <AnimatePresence>
              {discipline && (
                <motion.div
                  key={discipline}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className={labelClass} style={{ fontFamily: "Mirloanne, serif" }}>Prestation</label>
                  <div className="space-y-2">
                    {prestations[discipline].map((p) => (
                      <label
                        key={p.label}
                        className="flex items-center justify-between border border-gray-200 bg-[#f5f0e8] px-4 py-3 cursor-pointer hover:border-[#FF0080] transition-colors duration-200 has-[:checked]:border-[#FF0080]"
                      >
                        <div className="flex items-center gap-3">
                          <input type="radio" name="prestation" value={p.label} required className="accent-[#FF0080]" />
                          <div>
                            <p className="text-gray-900 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>{p.label}</p>
                            <p className="text-gray-400 text-xs" style={{ fontFamily: "var(--font-cormorant)" }}>{p.detail}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm whitespace-nowrap ml-4" style={{ fontFamily: "var(--font-cormorant)" }}>{p.price}</p>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Niveau */}
            <div>
              <label className={labelClass} style={{ fontFamily: "Mirloanne, serif" }}>Niveau</label>
              <div className="flex gap-3 flex-wrap">
                {niveaux.map((n) => (
                  <label key={n} className="flex items-center gap-2 cursor-pointer" style={{ fontFamily: "var(--font-cormorant)" }}>
                    <input type="radio" name="niveau" value={n} className="accent-[#FF0080]" />
                    <span className="text-gray-700">{n}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date souhaitée */}
            <div>
              <label className={labelClass} style={{ fontFamily: "Mirloanne, serif" }}>Date souhaitée</label>
              <input type="date" className={inputClass} style={{ fontFamily: "var(--font-cormorant)" }} />
            </div>

            {/* Message */}
            <div>
              <label className={labelClass} style={{ fontFamily: "Mirloanne, serif" }}>Message (optionnel)</label>
              <textarea rows={4} className={`${inputClass} resize-none`} style={{ fontFamily: "var(--font-cormorant)" }} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white uppercase tracking-widest text-sm py-4 hover:bg-[#FF0080] transition-colors duration-300 disabled:opacity-50"
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              {loading ? "Envoi en cours..." : "Envoyer ma demande"}
            </button>
          </motion.form>
        )}
      </div>
    </section>
  );
}
