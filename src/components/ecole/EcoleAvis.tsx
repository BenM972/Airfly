"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const avis = [
  {
    name: "Marie L.",
    note: 5,
    texte: "Moniteur exceptionnel, très pédagogue et rassurant. J'ai progressé en une seule session bien plus que je ne l'aurais cru. Le spot est magnifique, l'eau chaude, les conditions parfaites. Je recommande à 100% !",
  },
  {
    name: "Thomas G.",
    note: 5,
    texte: "Encadrement au top, très professionnel et humain à la fois. Le fait d'être maximum 3 élèves change vraiment tout. On se sent suivi, accompagné, jamais livré à soi-même. Merci Airfly !",
  },
  {
    name: "Sophie R.",
    note: 5,
    texte: "Une expérience inoubliable à Pointe Faula. Le moniteur est bienveillant, généreux en conseils, et surtout très motivant. L'eau est incroyablement plate et peu profonde — idéal pour débuter en confiance.",
  },
  {
    name: "Julien M.",
    note: 5,
    texte: "Cours de wingfoil en duo, vraiment top. Matériel récent, pédagogie irréprochable, ambiance détendue. On repart avec l'envie de revenir dès le lendemain. Le bateau de sécurité est très rassurant aussi.",
  },
  {
    name: "Camille D.",
    note: 5,
    texte: "Je recommande les yeux fermés. Pas besoin d'être sportif, le moniteur adapte parfaitement son enseignement. Pointe Faula est un spot de rêve, et Airfly en tire le meilleur parti.",
  },
  {
    name: "Antoine V.",
    note: 5,
    texte: "Airfly c'est sérieux, professionnel, et passionné. Le suivi radio pendant les sessions est un vrai plus — on se sent guidé en permanence. Le meilleur endroit pour apprendre le kitesurf en Martinique.",
  },
];

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5 justify-center">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="text-[#FF0080] text-sm">★</span>
      ))}
    </div>
  );
}

export default function EcoleAvis() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [current, setCurrent] = useState(0);
  const direction = useRef(1);

  useEffect(() => {
    const interval = setInterval(() => {
      direction.current = 1;
      setCurrent((c) => (c + 1) % avis.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const variants = {
    enter: () => ({ opacity: 0, x: direction.current > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: () => ({ opacity: 0, x: direction.current > 0 ? -60 : 60 }),
  };

  return (
    <section className="bg-[#f5f0e8] py-24 px-6 md:px-16" ref={ref}>
      <div className="max-w-3xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Card */}
          <div className="relative overflow-hidden min-h-[220px] flex items-center">
            <button
              onClick={() => { direction.current = -1; setCurrent((c) => (c === 0 ? avis.length - 1 : c - 1)); }}
              className="absolute left-0 z-10 h-full px-2 text-gray-400 hover:text-[#FF0080] transition-colors duration-300"
              aria-label="Précédent"
            >
              ‹
            </button>
            <button
              onClick={() => { direction.current = 1; setCurrent((c) => (c + 1) % avis.length); }}
              className="absolute right-0 z-10 h-full px-2 text-gray-400 hover:text-[#FF0080] transition-colors duration-300"
              aria-label="Suivant"
            >
              ›
            </button>
            <AnimatePresence mode="wait" custom={direction.current}>
              <motion.div
                key={current}
                custom={direction.current}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full bg-white px-16 py-10 shadow-sm text-center"
              >
                <Stars n={avis[current].note} />
                <p
                  className="text-gray-600 text-lg leading-relaxed mt-6 mb-6 italic"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  "{avis[current].texte}"
                </p>
                <p
                  className="text-gray-900 uppercase tracking-widest text-xs"
                  style={{ fontFamily: "Mirloanne, serif" }}
                >
                  {avis[current].name}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

        </motion.div>

      </div>
    </section>
  );
}
