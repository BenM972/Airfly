"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import SectionTitle from "../SectionTitle";

const atouts = [
  { icon: "◆", title: "3 élèves max", desc: "Chaque session est limitée pour garantir un suivi personnalisé et une sécurité optimale." },
  { icon: "◆", title: "Bateau de sécurité", desc: "Un bateau accompagne chaque cours. Vous n'êtes jamais seul sur l'eau." },
  { icon: "◆", title: "Moniteurs diplômés", desc: "Bienveillants, pédagogues, rassurants — ils construisent votre confiance dès la première session." },
  { icon: "◆", title: "Radio & équipement", desc: "Casque radio, gilet, chaussons, planche et aile fournis. Vous arrivez, on s'occupe du reste." },
];

export default function EcoleIntro() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="bg-[#f5f0e8] py-24 px-6 md:px-16" ref={ref}>
      <div className="max-w-6xl mx-auto">

        {/* Texte intro */}
        <motion.div
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p
            className="text-gray-700 text-lg leading-relaxed mb-5"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Pas besoin d'être un athlète. Le kitesurf, le wingfoil et le kitefoil sont des sports de finesse
            avant tout — pas de force. Chez Airfly, on vous le prouve dès la première session.
          </p>
          <p
            className="text-gray-700 text-lg leading-relaxed"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Notre école évolue sur les hauts fonds de Massy Massy, un spot exceptionnel : eau plate,
            fond sableux, alizés réguliers entre 12 et 20 nœuds. Les conditions idéales pour apprendre
            vite, progresser sereinement et, surtout, <strong className="text-gray-900">prendre du plaisir</strong>.
          </p>
        </motion.div>

        {/* Atouts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {atouts.map((a, i) => (
            <motion.div
              key={a.title}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
            >
              <p className="text-[#FF0080] text-lg mb-3">{a.icon}</p>
              <p
                className="text-gray-900 uppercase tracking-widest text-sm mb-2"
                style={{ fontFamily: "Mirloanne, serif" }}
              >
                {a.title}
              </p>
              <p
                className="text-gray-500 text-base leading-relaxed"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {a.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
