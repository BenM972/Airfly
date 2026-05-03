"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "A propos", href: "/#apropos" },
  { label: "Shop", href: "/shop" },
  { label: "Ecole", href: "/ecole" },
  { label: "Meteo", href: "/#meteo" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const hasHero = pathname === "/" || pathname === "/ecole" || pathname === "/shop";
  const solidNav = !hasHero || scrolled;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          solidNav
            ? "bg-black/80 backdrop-blur-md"
            : "bg-transparent backdrop-blur-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo-airfly.webp"
              alt="Airfly Surf Shop"
              width={55}
              height={22}
              className="object-contain"
              priority
            />
          </Link>

          {/* Liens desktop */}
          <nav className="hidden md:flex items-center gap-10">
            {links.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          {/* Réseaux sociaux desktop */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://www.instagram.com/airfly972/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors duration-200"
              aria-label="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/Airfly972"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white transition-colors duration-200"
              aria-label="Facebook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
          </div>

          {/* CTA desktop */}
          <div className="hidden md:block">
            <Link
              href="/ecole#reservation"
              className="border border-white text-white uppercase tracking-widest text-base px-5 py-2.5 whitespace-nowrap hover:bg-white hover:text-black transition-colors duration-300"
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              Reserver un cours
            </Link>
          </div>

          {/* Hamburger mobile */}
          <button
            className="md:hidden flex flex-col justify-center items-center gap-1.5 w-8 h-8 z-[70]"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            <motion.span
              className="block w-6 h-px bg-white origin-center"
              animate={menuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="block w-6 h-px bg-white"
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="block w-6 h-px bg-white origin-center"
              animate={menuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
            />
          </button>
        </div>
      </header>

      {/* Menu mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center gap-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            {links.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.3 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 px-6 text-white uppercase tracking-widest text-2xl"
                  style={{ fontFamily: "Mirloanne, serif" }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * links.length, duration: 0.3 }}
            >
              <Link
                href="/ecole#reservation"
                onClick={() => setMenuOpen(false)}
                className="border border-white text-white uppercase tracking-widest text-sm px-8 py-3 hover:bg-white hover:text-black transition-colors duration-300"
                style={{ fontFamily: "Mirloanne, serif" }}
              >
                Reserver un cours
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      className="relative flex flex-col items-center gap-0.5 group"
      style={{ fontFamily: "Mirloanne, serif" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.span
        className="uppercase tracking-widest text-base"
        animate={{ color: hovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.7)", y: hovered ? -2 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.span>
      <motion.span
        className="block h-px bg-white w-full"
        animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
        initial={{ scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        style={{ originX: 0 }}
      />
    </Link>
  );
}
