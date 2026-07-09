import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "A propos", href: "/#apropos" },
  { label: "Shop", href: "/shop" },
  { label: "Ecole", href: "/ecole" },
  { label: "Meteo", href: "/#meteo" },
];

const hours = [
  { day: "Mercredi & Dimanche", time: "9h — 13h" },
  { day: "Jeudi — Samedi", time: "9h — 12h30 / 13h45 — 18h" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white">

      {/* Mobile footer */}
      <div className="md:hidden px-6 py-12">
        {/* Logo + tagline */}
        <div className="text-center mb-8">
          <Image src="/logo-airfly.webp" alt="Airfly" width={80} height={32} className="object-contain mx-auto" />
          <p className="text-gray-400 text-base mt-4 leading-relaxed" style={{ fontFamily: "var(--font-cormorant)" }}>
            Ecole de glisse & surf shop<br />Pointe Faula, Vauclin, Martinique
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/ecole#reservation"
          className="block w-full text-center bg-[#FF0080] text-white uppercase tracking-widest text-sm py-3.5 mb-10 transition-colors duration-300"
          style={{ fontFamily: "Mirloanne, serif" }}
        >
          Reserver un cours
        </Link>

        <div className="space-y-8">
          {/* Navigation */}
          <div>
            <p className="uppercase tracking-widest text-xs text-[#FF0080] mb-4" style={{ fontFamily: "Mirloanne, serif" }}>Navigation</p>
            <div className="grid grid-cols-2 gap-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200 uppercase tracking-widest text-sm"
                  style={{ fontFamily: "Mirloanne, serif" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Horaires */}
          <div>
            <p className="uppercase tracking-widest text-xs text-[#FF0080] mb-4" style={{ fontFamily: "Mirloanne, serif" }}>Horaires</p>
            <div className="space-y-3">
              {hours.map((h) => (
                <div key={h.day}>
                  <p className="text-white text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>{h.day}</p>
                  <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>{h.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="uppercase tracking-widest text-xs text-[#FF0080] mb-4" style={{ fontFamily: "Mirloanne, serif" }}>Contact</p>
            <div className="space-y-2.5">
              <a href="tel:+596596762531" className="block text-gray-400 hover:text-white transition-colors duration-200 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>
                +596 596 76 25 31
              </a>
              <a href="mailto:info@airfly972.com" className="block text-gray-400 hover:text-white transition-colors duration-200 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>
                info@airfly972.com
              </a>
              <a href="https://wa.me/596696416727" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white transition-colors duration-200 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>
                WhatsApp
              </a>
              <p className="text-gray-500 text-sm pt-1" style={{ fontFamily: "var(--font-cormorant)" }}>
                Plage de Pointe Faula, Le Vauclin
              </p>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=14.541922560749377,-60.82981741961289"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[#FF0080] transition-colors duration-200 text-xs uppercase tracking-widest pt-1"
                style={{ fontFamily: "Mirloanne, serif" }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Itineraire
              </a>
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="flex justify-center gap-6 mt-10 pb-8 border-b border-gray-800">
          <a href="https://www.instagram.com/airfly972" target="_blank" rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200 text-sm uppercase tracking-widest"
            style={{ fontFamily: "Mirloanne, serif" }}>Instagram</a>
          <a href="https://www.facebook.com/airfly972" target="_blank" rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200 text-sm uppercase tracking-widest"
            style={{ fontFamily: "Mirloanne, serif" }}>Facebook</a>
          <a href="https://wa.me/596696416727" target="_blank" rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200 text-sm uppercase tracking-widest"
            style={{ fontFamily: "Mirloanne, serif" }}>WhatsApp</a>
        </div>

        {/* Copyright */}
        <div className="pt-6 text-center space-y-2">
          <p className="text-gray-600 text-xs uppercase tracking-widest" style={{ fontFamily: "Mirloanne, serif" }}>
            © {new Date().getFullYear()} Airfly
          </p>
          <a href="https://www.bmconsultingfwi.fr" target="_blank" rel="noopener noreferrer"
            className="text-gray-700 hover:text-white transition-colors duration-200 text-xs"
            style={{ fontFamily: "var(--font-cormorant)" }}>
            Développé avec ♥️ par BM Consulting FWI
          </a>
        </div>
      </div>

      {/* Desktop footer — inchangé */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-16 py-20 grid grid-cols-4 gap-12">

          <div className="flex flex-col gap-6">
            <Image src="/logo-airfly.webp" alt="Airfly Surf Shop" width={90} height={36} className="object-contain" />
            <p className="text-gray-400 text-base leading-relaxed" style={{ fontFamily: "var(--font-cormorant)" }}>
              Ecole de glisse & surf shop à Pointe Faula, Vauclin, Martinique.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/airfly972" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm uppercase tracking-widest"
                style={{ fontFamily: "Mirloanne, serif" }}>Instagram</a>
              <a href="https://www.facebook.com/airfly972" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm uppercase tracking-widest"
                style={{ fontFamily: "Mirloanne, serif" }}>Facebook</a>
            </div>
          </div>

          <div>
            <p className="uppercase tracking-widest text-xs text-[#FF0080] mb-6" style={{ fontFamily: "Mirloanne, serif" }}>Navigation</p>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors duration-200 uppercase tracking-widest text-sm" style={{ fontFamily: "Mirloanne, serif" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/ecole#reservation" className="text-[#FF0080] hover:text-white transition-colors duration-200 uppercase tracking-widest text-sm" style={{ fontFamily: "Mirloanne, serif" }}>
                  Reserver un cours
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="uppercase tracking-widest text-xs text-[#FF0080] mb-6" style={{ fontFamily: "Mirloanne, serif" }}>Horaires</p>
            <ul className="space-y-4">
              {hours.map((h) => (
                <li key={h.day}>
                  <p className="text-white text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>{h.day}</p>
                  <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>{h.time}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="uppercase tracking-widest text-xs text-[#FF0080] mb-6" style={{ fontFamily: "Mirloanne, serif" }}>Contact</p>
            <ul className="space-y-3">
              <li><a href="tel:+596596762531" className="text-gray-400 hover:text-white transition-colors duration-200" style={{ fontFamily: "var(--font-cormorant)" }}>+596 596 76 25 31</a></li>
              <li><a href="mailto:info@airfly972.com" className="text-gray-400 hover:text-white transition-colors duration-200" style={{ fontFamily: "var(--font-cormorant)" }}>info@airfly972.com</a></li>
              <li><a href="https://wa.me/596696416727" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200" style={{ fontFamily: "var(--font-cormorant)" }}>WhatsApp</a></li>
              <li className="pt-2">
                <p className="text-gray-500 text-sm leading-relaxed mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>Plage de Pointe Faula<br />Le Vauclin, Martinique</p>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=14.541922560749377,-60.82981741961289"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-gray-600 hover:text-[#FF0080] transition-colors duration-200 text-xs uppercase tracking-widest"
                  style={{ fontFamily: "Mirloanne, serif" }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  Itineraire
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-16 py-6 flex items-center justify-between">
            <p className="text-gray-600 text-xs uppercase tracking-widest" style={{ fontFamily: "Mirloanne, serif" }}>
              © {new Date().getFullYear()} Airfly — Tous droits reserves
            </p>
            <a href="https://www.bmconsultingfwi.fr" target="_blank" rel="noopener noreferrer"
              className="text-gray-600 hover:text-white transition-colors duration-200 text-xs"
              style={{ fontFamily: "var(--font-cormorant)" }}>
              Développé avec ♥️ par BM Consulting FWI aux Antilles 🌴
            </a>
          </div>
        </div>
      </div>

    </footer>
  );
}
