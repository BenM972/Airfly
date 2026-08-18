import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/shop/CartDrawer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://airfly972.com";

const TITLE = "Airfly — École de kitesurf & wingfoil, Pointe Faula, Martinique";
const DESCRIPTION =
  "École de glisse et surf shop à Pointe Faula, Le Vauclin (Martinique). Cours de kitesurf, wingfoil et kitefoil avec moniteurs diplômés, matériel et textile en boutique.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    // Tiret et non pipe : plusieurs noms de produits WooCommerce contiennent
    // deja un "|" ("Harnais Apex 2025 | Ion"), ce qui donnait un double separateur.
    template: "%s — Airfly Martinique",
  },
  description: DESCRIPTION,
  applicationName: "Airfly",
  alternates: { canonical: "/" },
  icons: { icon: "/logo-airfly.webp" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Airfly",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    images: [{ url: "/hero_ecole.jpg", width: 1200, height: 630, alt: "Airfly, école de glisse à Pointe Faula, Martinique" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/hero_ecole.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={cormorant.variable}>
      <head>
        {/* Mirloanne porte tous les titres : la precharger evite le saut de
            rendu que provoquait sa decouverte tardive via la feuille de style. */}
        <link rel="preload" href="/Mirloanne.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <CartProvider>
          <Preloader />
          <Navbar />
          <CartDrawer />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
