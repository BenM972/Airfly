"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface SectionTitleProps {
  title: string;
  className?: string;
}

export default function SectionTitle({ title, className = "" }: SectionTitleProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={`flex items-center justify-center gap-4 ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <span className="text-gray-900 text-sm">◆</span>
      <h2
        className="text-2xl md:text-3xl font-light text-gray-900 uppercase tracking-widest"
        style={{ fontFamily: "Mirloanne, serif" }}
      >
        {title}
      </h2>
      <span className="text-gray-900 text-sm">◆</span>
    </motion.div>
  );
}
