/** @type {import('next').NextConfig} */

// Hote WooCommerce, deduit de WC_URL quand la variable est disponible au build.
// Le repli couvre le cas ou elle ne l'est pas (build sans .env sur l'hebergeur).
const wcHostname = (() => {
  try {
    return process.env.WC_URL ? new URL(process.env.WC_URL).hostname : null;
  } catch {
    return null;
  }
})();

const imageHosts = [
  wcHostname,
  "yellow-swan-973770.hostingersite.com",
  "airfly972.com",
  "www.airfly972.com",
].filter((h, i, all) => h && all.indexOf(h) === i);

// Pas de Content-Security-Policy ici : le site charge le widget Windguru
// (www.windguru.cz) et utilise des styles inline un peu partout (style={{...}}
// et framer-motion). Une CSP merite une passe dediee avec test de chaque page,
// sous peine de casser la meteo et les animations.
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // includeSubDomains volontairement absent : a ajouter une fois verifie que
  // tous les sous-domaines de airfly972.com sont bien en HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig = {
  images: {
    remotePatterns: imageHosts.map((hostname) => ({ protocol: "https", hostname })),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    if (!process.env.NEXT_PUBLIC_SITE_URL?.includes("airfly972.com")) return [];
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.airfly972.com" }],
        destination: "https://airfly972.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
