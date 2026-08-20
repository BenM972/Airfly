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

// Cache des documents HTML.
//
// Next pose de lui-meme `Cache-Control: s-maxage=31536000` sur les pages
// prerendues : un an de cache partage. Il ecrit cela en supposant que la
// plateforme purge son cache a chaque deploiement, ce que fait Vercel. Un
// hebergement classique, non. Or chaque build renomme les fichiers CSS et JS
// et supprime les precedents : un cache qui continue de servir l'ancien HTML
// reclame des fichiers qui n'existent plus, et la page s'affiche sans aucun
// style. C'est exactement ce symptome qui a ete observe en local.
//
// On borne donc la fraicheur des documents a zero seconde, cache partage
// compris. Le navigateur revalide alors avec l'ETag que Next fournit deja, ce
// qui coute un 304 vide et non un rechargement complet.
//
// La regle ne vise QUE les documents publics. Sont exclus :
//   - `_next/`, dont les fichiers versionnes gardent leur cache d'un an, sans
//     danger puisque leur nom change avec leur contenu ;
//   - tout chemin comportant un point, c'est-a-dire les fichiers de /public ;
//   - `api/` et `admin`, ou Next pose de lui-meme `private, no-cache,
//     no-store`. Une premiere version de cette regle les englobait et
//     remplacait ce `private, no-store` par un `public` : les reponses du back
//     office et du formulaire de reservation, qui portent des donnees
//     personnelles, devenaient stockables par un cache partage.
const cacheDocuments = [
  { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
];

const nextConfig = {
  experimental: {
    // Nombre de processus de generation statique.
    //
    // Next en lance autant que la machine a de coeurs : sept sur le poste de
    // developpement, trente-trois sur le serveur de build d'Hostinger. Or
    // chaque processus interroge WooCommerce en parallele, et le WordPress est
    // sur un hebergement mutualise qui repond 500 sous la charge. Une limite
    // posee par processus ne borne donc rien : elle se multiplie par un nombre
    // de workers qu'on ne choisit pas.
    //
    // En figeant les workers ici, le plafond devient absolu :
    // cpus x SIMULTANES_MAX appels simultanes, la meme valeur partout.
    cpus: 4,
  },
  images: {
    // AVIF en premier : ~20 a 30 % de moins que le WebP, repli automatique
    // pour les navigateurs qui ne l'annoncent pas.
    formats: ["image/avif", "image/webp"],
    remotePatterns: imageHosts.map((hostname) => ({ protocol: "https", hostname })),
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Documents HTML publics uniquement — voir cacheDocuments.
      { source: "/((?!_next/|api/|admin|.*\\.).*)", headers: cacheDocuments },
    ];
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
