import { fermeture } from "@/data/fermeture";
import { disciplines, tarifs, options } from "@/data/tarifs";

/**
 * /llms.txt — resume du site a destination des moteurs conversationnels.
 *
 * A prendre pour ce que c'est : une convention proposee, pas une norme. Google
 * Search l'ignore, et aucun moteur ne s'engage a la lire. L'audit du
 * 8 septembre 2026 la classait "a faire sans en attendre de miracle" ; ce
 * fichier coute quelques kilo-octets et se maintient tout seul, donc il vaut le
 * coup, mais il ne remplace ni le contenu de la page ni le JSON-LD.
 *
 * Le contenu est genere depuis les memes donnees que la page /ecole, pour la
 * meme raison qu'ailleurs : une liste de prix recopiee a la main finit toujours
 * par diverger de celle qui est affichee.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://airfly972.com";

export const revalidate = 3600;

function grille(): string {
  return disciplines
    .map((d) => {
      const lignes = tarifs[d].map((t) => `- ${t.label} — ${t.detail} — ${t.price}`).join("\n");
      return `### ${d}\n\n${lignes}`;
    })
    .join("\n\n");
}

export function GET() {
  const fermetureBloc = fermeture
    ? `\n> Fermeture en cours jusqu'au ${fermeture.jusquAu}. Les cours et la boutique reprennent a cette date.\n`
    : "";

  const corps = `# Airfly — ecole de glisse et surf shop, Pointe Faula, Le Vauclin (Martinique)

> Ecole de kitesurf, wingfoil et kitefoil, et surf shop, sur la plage de Pointe
> Faula au Vauclin, en Martinique. Moniteurs diplomes FFVL/FFV, trois eleves au
> maximum par cours collectif, bateau de securite et materiel fourni. La
> boutique fonctionne en retrait sur place, sans prepaiement.
${fermetureBloc}
## Coordonnees

- Adresse : Plage de Pointe Faula, 97280 Le Vauclin, Martinique
- Telephone : +596 596 76 25 31
- Email : info@airfly972.com
- Coordonnees GPS : 14.541923, -60.829817

## Pages

- [Accueil](${SITE_URL}/) : presentation de l'ecole, du spot et de la boutique.
- [Ecole de glisse](${SITE_URL}/ecole) : cours de kitesurf, wingfoil et kitefoil, tarifs, reservation.
- [Surf shop](${SITE_URL}/shop) : materiel de kitesurf et de wingfoil, textile de glisse, soins solaires.

## Tarifs des cours

${grille()}

### Options et perfectionnement

${options.map((o) => `- ${o.label} — ${o.detail}${o.price ? ` — ${o.price}` : " — prix sur demande"}`).join("\n")}

Une licence FFVL ou FFV est requise (assurance RC incluse). Une assurance
personnelle couvrant la pratique du kitesurf est egalement acceptee.

## Le spot

L'ecole evolue sur le spot de la Pointe Faula, plus precisement sur les hauts
fonds de Massy Massy. L'eau est chaude toute l'annee — on navigue en short et
lycra, sans combinaison. La barriere de corail au large cree une eau plate, sans
vague, et le banc de sable permet d'avoir pied sur une grande partie de la zone
ecole. Le vent souffle regulierement entre 12 et 20 noeuds, avec une saison
forte de novembre a mai. Un bateau de securite est present a chaque session, et
les zones de navigation sont balisees par arrete prefectoral.

## Modalites d'achat

Les articles de la boutique se reglent et se retirent sur place : il n'y a ni
vente en ligne ni prepaiement. Une demande passee depuis le site est une
reservation d'article, que la boutique confirme.
`;

  return new Response(corps, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
