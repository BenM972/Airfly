"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export default function CarteMartinique({ className = "" }: { className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <Image
        src="/carte-mq.webp"
        alt="Carte Martinique"
        width={370}
        height={370}
        className="object-contain"
      />
    </motion.div>
  );
}
