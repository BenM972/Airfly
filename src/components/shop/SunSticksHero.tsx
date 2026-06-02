"use client";

import { motion } from "framer-motion";

type Props = {
  onShopSoins: () => void;
};

const STICKS = [
  { name: "The Original", color: "#F5F0E8", border: "#D4C9B0", label: "Blanc" },
  { name: "Ocean Blue",   color: "#1B4F6A", border: "#1B4F6A", label: "Ocean Blue" },
  { name: "Sunset",       color: "#F4827A", border: "#F4827A", label: "Sunset" },
  { name: "Pacha Mama",   color: "#C4924A", border: "#C4924A", label: "Pacha Mama" },
];

const BADGES = [
  { icon: "🇫🇷", text: "Made in France" },
  { icon: "🌿", text: "80–100% Naturel" },
  { icon: "🌊", text: "1% for the Planet" },
  { icon: "⭐", text: "Noté Excellent Yuka" },
];

export default function SunSticksHero({ onShopSoins }: Props) {
  return (
    <section className="relative overflow-hidden bg-[#FFF060] min-h-[50vh] flex items-center px-6 md:px-16 py-10">

      {/* Cercle décoratif fond */}
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #FF6B35 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #FF0080 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">

          {/* ── Gauche : Sticks visuels ── */}
          <motion.div
            className="flex-1 flex flex-col items-center"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Logo SeventyOne stylisé */}
            <p
              className="text-xs uppercase tracking-[0.3em] text-black/50 mb-8"
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              seventy — one percent
            </p>

            {/* Sticks */}
            <div className="flex gap-4 items-end mb-8">
              {STICKS.map((stick, i) => (
                <motion.div
                  key={stick.name}
                  className="flex flex-col items-center gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                >
                  {/* Stick visuel */}
                  <div className="relative">
                    {/* Corps du stick */}
                    <div
                      className="w-10 md:w-12 rounded-[20px] border-2 shadow-lg"
                      style={{
                        height: 100 + i * 8,
                        backgroundColor: stick.color,
                        borderColor: stick.border,
                      }}
                    />
                    {/* Cap arrondi */}
                    <div
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 md:w-10 h-4 rounded-full border-2"
                      style={{ backgroundColor: stick.color, borderColor: stick.border }}
                    />
                  </div>
                  <span
                    className="text-[9px] uppercase tracking-widest text-black/60 text-center leading-tight"
                    style={{ fontFamily: "Mirloanne, serif" }}
                  >
                    {stick.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* SPF badge */}
            <motion.div
              className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full text-sm"
              style={{ fontFamily: "Mirloanne, serif" }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <span className="text-[#FFF060] font-bold">SPF 50+</span>
              <span className="w-px h-4 bg-white/30" />
              <span className="text-white/70 text-xs">UVA · UVB</span>
              <span className="w-px h-4 bg-white/30" />
              <span className="text-white/70 text-xs">Water Resistant</span>
            </motion.div>
          </motion.div>

          {/* ── Droite : Copy ── */}
          <motion.div
            className="flex-1 max-w-xl"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <motion.p
              className="text-black/50 text-xs uppercase tracking-[0.3em] mb-3"
              style={{ fontFamily: "Mirloanne, serif" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Soins solaires haute performance
            </motion.p>

            <motion.h2
              className="text-black text-4xl md:text-6xl font-light leading-[1.05] mb-6"
              style={{ fontFamily: "Mirloanne, serif" }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              Sun<br />Sticks
            </motion.h2>

            <motion.p
              className="text-black/70 text-base md:text-lg leading-relaxed mb-8"
              style={{ fontFamily: "var(--font-cormorant)" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
            >
              Nomade et ultra-pratique, le stick solaire SPF 50+ de SeventyOne
              Percent protège les zones sensibles du visage en toutes
              conditions — vague, vent, sel. 4 teintes, 1 formule clean
              validée Eco Label, encensée par{" "}
              <em>ELLE</em> et <em>Vogue</em>.
            </motion.p>

            {/* Badges */}
            <motion.div
              className="grid grid-cols-2 gap-3 mb-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              {BADGES.map((b) => (
                <div
                  key={b.text}
                  className="flex items-center gap-2 bg-black/5 rounded-lg px-3 py-2"
                >
                  <span className="text-base">{b.icon}</span>
                  <span
                    className="text-xs text-black/70 uppercase tracking-wide"
                    style={{ fontFamily: "Mirloanne, serif" }}
                  >
                    {b.text}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.button
              onClick={onShopSoins}
              className="group inline-flex items-center gap-3 bg-black text-[#FFF060] uppercase tracking-widest text-xs px-8 py-4 hover:bg-[#FF0080] hover:text-white transition-colors duration-300"
              style={{ fontFamily: "Mirloanne, serif" }}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Découvrir la gamme
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </motion.button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
