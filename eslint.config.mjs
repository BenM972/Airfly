import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// ESLint 9 exige ce fichier : sans lui, `npm run lint` echouait et n'avait
// donc jamais tourne sur ce projet.
// eslint-config-next 16 expose directement du flat config, pas besoin de FlatCompat.
const config = [
  { ignores: [".next/**", "node_modules/**", "public/**", "scripts/**"] },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // Apostrophes et guillemets dans la copie francaise. Le rendu est correct,
      // c'est une passe de relecture editoriale, pas une correction de code :
      // en avertissement pour que les vraies erreurs restent visibles.
      "react/no-unescaped-entities": "warn",

      // Regle du React Compiler. Les cas restants sont l'idiome standard de
      // synchronisation avec une API navigateur (localStorage, sessionStorage)
      // ou avec une prop d'URL. A traiter au cas par cas, pas a bloquer.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default config;
