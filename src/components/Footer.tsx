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

      {/* Corps */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-20 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Logo + baseline */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <Image
            src="/logo-airfly.webp"
            alt="Airfly Surf Shop"
            width={90}
            height={36}
            className="object-contain"
          />
          <p
            className="text-gray-400 text-base leading-relaxed"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Ecole de glisse & surf shop à Pointe Faula, Vauclin, Martinique.
          </p>
          {/* Réseaux */}
          <div className="flex gap-4">
            <a
              href="https://www.instagram.com/airfly972"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors duration-200 text-sm uppercase tracking-widest"
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              Instagram
            </a>
            <a
              href="https://www.facebook.com/airfly972"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors duration-200 text-sm uppercase tracking-widest"
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              Facebook
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <p
            className="uppercase tracking-widest text-xs text-[#FF0080] mb-6"
            style={{ fontFamily: "Mirloanne, serif" }}
          >
            Navigation
          </p>
          <ul className="space-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200 uppercase tracking-widest text-sm"
                  style={{ fontFamily: "Mirloanne, serif" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/ecole#reservation"
                className="text-[#FF0080] hover:text-white transition-colors duration-200 uppercase tracking-widest text-sm"
                style={{ fontFamily: "Mirloanne, serif" }}
              >
                Reserver un cours
              </Link>
            </li>
          </ul>
        </div>

        {/* Horaires */}
        <div>
          <p
            className="uppercase tracking-widest text-xs text-[#FF0080] mb-6"
            style={{ fontFamily: "Mirloanne, serif" }}
          >
            Horaires
          </p>
          <ul className="space-y-4">
            {hours.map((h) => (
              <li key={h.day}>
                <p
                  className="text-white text-sm"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {h.day}
                </p>
                <p
                  className="text-gray-400 text-sm"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {h.time}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p
            className="uppercase tracking-widest text-xs text-[#FF0080] mb-6"
            style={{ fontFamily: "Mirloanne, serif" }}
          >
            Contact
          </p>
          <ul className="space-y-3">
            <li>
              <a
                href="tel:+596596762531"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                +596 596 76 25 31
              </a>
            </li>
            <li>
              <a
                href="mailto:info@airfly972.com"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                info@airfly972.com
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/596596762531"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                WhatsApp
              </a>
            </li>
            <li className="pt-2">
              <p
                className="text-gray-500 text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Plage de Pointe Faula<br />
                Le Vauclin, Martinique
              </p>
            </li>
          </ul>
        </div>

      </div>

      {/* Bas de footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className="text-gray-600 text-xs uppercase tracking-widest"
            style={{ fontFamily: "Mirloanne, serif" }}
          >
            © {new Date().getFullYear()} Airfly — Tous droits réservés
          </p>
          <a
            href="https://www.bmconsultingfwi.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-white transition-colors duration-200 text-xs"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Développé avec ♥️ par BM Consulting FWI aux Antilles 🌴
          </a>
        </div>
      </div>

    </footer>
  );
}
