"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

const categories = [
  {
    title: "Kitesurf",
    items: "Ailes, barres, twin-tips, foils, harnais",
  },
  {
    title: "Wingfoil",
    items: "Wings, foils, casques, equipements de securite",
  },
  {
    title: "Surf & SUP",
    items: "Planches, pagaies, accessoires",
  },
  {
    title: "Textile technique",
    items: "Combinaisons, shorties, lycras, chaussons",
  },
  {
    title: "Lifestyle",
    items: "Boardshorts, bikinis, ponchos, lunettes, protection solaire",
  },
  {
    title: "Sur commande",
    items: "Tout article hors stock commande sous quelques jours",
  },
];

const arguments_ = [
  {
    heading: "Des prix au plus pres de la metropole",
    body:
      "On travaille en direct avec nos fournisseurs pour vous proposer des tarifs alignes sur ceux pratiques en France metropolitaine. Fini la double peine : ici, equiper sa session ne coute pas plus cher qu'ailleurs.",
  },
  {
    heading: "Des delais d'appro ultra-maittrises",
    body:
      "Grâce a nos relations privilegiees avec les marques, les delais d'approvisionnement sont aujourd'hui tres raisonnables. Une commande passee aujourd'hui, c'est un produit entre vos mains rapidement — sans attendre des semaines.",
  },
  {
    heading: "Un stock vivant, une boutique qui grandit",
    body:
      "La boutique est en plein developpement. Chaque semaine, de nouveaux produits rejoignent le catalogue. Si vous ne trouvez pas ce que vous cherchez, on le trouve pour vous.",
  },
];

export default function ShopSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="bg-gray-950 py-28 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-16">
          <motion.p
            className="uppercase tracking-widest text-xs text-sky-400 mb-6"
            style={{ fontFamily: "Mirloanne, serif" }}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            La boutique
          </motion.p>

          <motion.h2
            className="text-4xl md:text-5xl font-light text-white leading-tight mb-6"
            style={{ fontFamily: "Mirloanne, serif" }}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Tout le matos,<br />au juste prix.
          </motion.h2>

          <motion.div
            className="w-12 h-px bg-sky-400"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ originX: 0 }}
          />
        </div>

        {/* Arguments */}
        <div className="grid md:grid-cols-3 gap-10 mb-20">
          {arguments_.map((arg, i) => (
            <motion.div
              key={arg.heading}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.12 }}
            >
              <div className="w-8 h-px bg-sky-400 mb-5" />
              <h3
                className="text-white text-lg font-light mb-3 leading-snug"
                style={{ fontFamily: "Mirloanne, serif" }}
              >
                {arg.heading}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{arg.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Grille catégories */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 gap-px bg-gray-800 border border-gray-800 mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="bg-gray-950 px-6 py-8 hover:bg-gray-900 transition-colors duration-300 group"
            >
              <p
                className="text-white text-base font-light mb-2 group-hover:text-sky-400 transition-colors duration-300"
                style={{ fontFamily: "Mirloanne, serif" }}
              >
                {cat.title}
              </p>
              <p className="text-gray-500 text-xs leading-relaxed">{cat.items}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Link
            href="/shop"
            className="border border-white text-white uppercase tracking-widest text-sm px-10 py-4 hover:bg-white hover:text-black transition-colors duration-300"
            style={{ fontFamily: "Mirloanne, serif" }}
          >
            Voir le shop
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
