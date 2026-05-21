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

          {/* GPS desktop */}
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=14.541922560749377,-60.82981741961289"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-200 text-xs uppercase tracking-widest"
            style={{ fontFamily: "Mirloanne, serif" }}
            aria-label="Itineraire vers le spot"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            Le spot
          </a>

          {/* WhatsApp desktop */}
          <a
            href="https://wa.me/596696416727"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center justify-center w-9 h-9 text-white/70 hover:text-[#25D366] transition-colors duration-200"
            aria-label="WhatsApp"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
          </a>

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

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * (links.length + 1), duration: 0.3 }}
            >
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=14.541922560749377,-60.82981741961289"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-white/50 uppercase tracking-widest text-sm hover:text-white transition-colors duration-200"
                style={{ fontFamily: "Mirloanne, serif" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Emmenes-moi au spot
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * (links.length + 2), duration: 0.3 }}
            >
              <a
                href="https://wa.me/596696416727"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-white/50 text-sm hover:text-[#25D366] transition-colors duration-200"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
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
