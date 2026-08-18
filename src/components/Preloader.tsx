"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// 1800 ms masquaient le site plus longtemps que le rendu complet ne prend,
// et plafonnaient le LCP d'autant. 600 ms conservent l'effet de marque.
const DURATION_MS = 600;

export default function Preloader() {
  // Visible des le rendu serveur : le masquer par defaut ferait apparaitre le
  // contenu avant que le calque ne le recouvre a l'hydratation.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] bg-[#f5f0e8] flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/logo-airfly.webp"
              alt="Airfly"
              width={120}
              height={120}
              className="object-contain"
              priority
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
