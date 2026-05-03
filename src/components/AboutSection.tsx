"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import SectionTitle from "./SectionTitle";

export default function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="apropos" className="bg-[#f5f0e8] px-10 py-20 md:px-16 md:py-24" ref={ref}>
      <div className="max-w-7xl mx-auto">

        <SectionTitle title="A propos" className="mb-12" />

        {/* Split : paragraphes gauche / photo droite */}
        <div className="md:grid md:grid-cols-2 md:gap-16 items-center">

          {/* Paragraphes */}
          <motion.div
            className="space-y-5 text-gray-700 text-base leading-relaxed"
            style={{ fontFamily: "var(--font-cormorant)" }}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p>
              Airfly, c'est avant tout une histoire d'amour avec l'océan. Installés à Pointe Faula, l'un
              des plus beaux spots de Martinique, nous avons fait le choix délibéré de rester une
              structure à taille humaine — parce que la qualité ne se dilue pas dans la masse.
            </p>
            <p>
              Ici, les cours ne dépassent jamais 3 élèves. Chaque session est encadrée par un
              moniteur diplômé, accompagné d'un bateau de sécurité. Vous évoluez sur des eaux peu
              profondes, protégés par un récif coralien, portés par des alizés constants — les
              conditions idéales pour progresser sereinement, quel que soit votre niveau.
            </p>
            <p>
              Notre engagement, c'est votre tranquillité d'esprit. On répond présent — par
              téléphone, par WhatsApp, dans les heures qui suivent. On s'adapte à vos disponibilités,
              on anticipe vos besoins, et on reste à vos côtés bien après votre première session.
            </p>
            <p>
              Notre boutique, c'est le même état d'esprit : des prix au plus près de ceux pratiqués
              en métropole, des délais d'approvisionnement sérieux, et une gamme qui s'étoffe
              semaine après semaine. Si vous ne trouvez pas ce qu'il vous faut en stock, on le
              commande pour vous. Sans surcoût insulaire, sans mauvaise surprise.
            </p>
            <p className="text-gray-900 font-medium text-2xl">
              La mer vous attend. On est là.
            </p>
          </motion.div>

          {/* Photo — même hauteur que le bloc texte */}
          <div className="hidden md:flex items-start justify-center pt-1">
          <div className="relative w-[90%] min-h-[500px] shadow-xl overflow-hidden">
            {/* Image avec zoom Ken Burns */}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.1 }}
              animate={inView ? { scale: 1 } : {}}
              transition={{ duration: 1.4, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <Image
                src="/about-placeholder.jpg"
                alt="Airfly — ambiance"
                fill
                className="object-cover"
                sizes="50vw"
              />
            </motion.div>
            {/* Volet de révélation qui glisse vers le haut */}
            <motion.div
              className="absolute inset-0 bg-[#f5f0e8] origin-bottom z-10"
              initial={{ scaleY: 1 }}
              animate={inView ? { scaleY: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
          </div>

        </div>


      </div>
    </section>
  );
}
