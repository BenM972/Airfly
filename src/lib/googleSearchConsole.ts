import { createSign } from "node:crypto";

/**
 * Acces a l'API Google Search Console, cote serveur uniquement.
 *
 * Pas de dependance `googleapis` : ce paquet pese plusieurs dizaines de
 * megaoctets pour un projet qui en compte six au total, et l'on n'a besoin que
 * de deux appels. Le flux compte de service tient en une signature RS256, que
 * le module `crypto` de Node sait faire.
 *
 * Search Console n'est PAS integrable en iframe : Google sert ses consoles avec
 * `X-Frame-Options: DENY`. On lit donc les donnees par l'API et on les affiche
 * avec la mise en forme du back office, ce qui permet au passage de ne montrer
 * que ce qui compte.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://searchconsole.googleapis.com";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

export type ConfigGSC = { email: string; cle: string; propriete: string };

/**
 * Lit la configuration, ou renvoie null si elle est absente.
 *
 * Renvoyer null plutot que de lever permet a la page d'admin d'afficher la
 * marche a suivre au lieu d'une erreur : tant que le client n'a pas cree son
 * compte de service, l'absence de configuration est l'etat NORMAL, pas une panne.
 */
/**
 * Remet une cle PEM en etat, quelle que soit la maniere dont le panneau de
 * l'hebergeur l'a abimee en la stockant.
 *
 * Cinq malformations differentes produisent la MEME erreur OpenSSL,
 * `DECODER routines::unsupported`, ce qui rend le diagnostic a l'oeil
 * impraticable — verifie en les rejouant une par une :
 *
 *   - aplatie sur une seule ligne, separateurs perdus ;
 *   - guillemets conserves autour de la valeur, parce qu'un fichier .env les
 *     retire mais qu'un champ de formulaire les garde ;
 *   - antislashs doubles, quand le panneau echappe ce qu'on lui donne ;
 *   - espaces ou retours a la ligne parasites au debut ou a la fin ;
 *   - combinaisons des precedentes.
 *
 * Aucune n'est de la faute de celui qui colle la valeur. On normalise donc au
 * lieu d'exiger une forme exacte, et on ne signale que ce qui reste vraiment
 * indechiffrable.
 */
function normaliserCle(brute: string): string {
  let cle = brute.trim();

  // Guillemets simples ou doubles conserves par le champ de saisie.
  if ((cle.startsWith('"') && cle.endsWith('"')) || (cle.startsWith("'") && cle.endsWith("'"))) {
    cle = cle.slice(1, -1).trim();
  }

  // Antislashs doubles d'abord : sinon le remplacement suivant laisse un
  // antislash orphelin devant chaque saut de ligne.
  cle = cle.replace(/\\\\n/g, "\n").replace(/\\n/g, "\n");

  // Retours chariot Windows, qu'un copier-coller depuis un panneau ramene parfois.
  cle = cle.replace(/\r/g, "");

  // Espaces en bout de ligne : le base64 du corps PEM ne les tolere pas.
  const lignes = cle
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Marqueurs disparus.
  //
  // Constate en production : le panneau Hostinger avait retire les deux lignes
  // `-----BEGIN PRIVATE KEY-----` et `-----END PRIVATE KEY-----`, ne laissant
  // que les 26 lignes de corps. Beaucoup de champs de configuration traitent
  // une ligne commencant par un tiret comme un commentaire ou une option et la
  // suppriment sans rien dire.
  //
  // Le corps seul est inexploitable, alors que l'information qu'il porte est
  // intacte : les marqueurs sont une constante, pas une donnee. On les repose
  // donc, plutot que de renvoyer l'utilisateur a une valeur de 1 700
  // caracteres en lui demandant de trouver ce qui manque.
  //
  // Uniquement si le contenu ressemble bien a du base64 : hors de question de
  // deguiser en cle privee quelque chose qui n'en est pas une.
  const aUnDebut = lignes.some((l) => l.startsWith("-----BEGIN"));
  const aUneFin = lignes.some((l) => l.startsWith("-----END"));
  const corpsSeul = lignes.filter((l) => !l.startsWith("-----"));
  const ressembleAduBase64 =
    corpsSeul.length > 0 && corpsSeul.every((l) => /^[A-Za-z0-9+/=]+$/.test(l));

  if (!aUnDebut && !aUneFin && ressembleAduBase64) {
    return ["-----BEGIN PRIVATE KEY-----", ...corpsSeul, "-----END PRIVATE KEY-----"].join("\n");
  }
  // Un seul marqueur present : on complete celui qui manque.
  if (ressembleAduBase64 && (aUnDebut !== aUneFin)) {
    return ["-----BEGIN PRIVATE KEY-----", ...corpsSeul, "-----END PRIVATE KEY-----"].join("\n");
  }

  return lignes.join("\n");
}

export function lireConfig(): ConfigGSC | null {
  const email = process.env.GSC_SERVICE_ACCOUNT_EMAIL?.trim();
  const propriete = process.env.GSC_SITE_URL?.trim();
  const brute = process.env.GSC_PRIVATE_KEY;
  if (!email || !brute || !propriete) return null;
  return { email, cle: normaliserCle(brute), propriete };
}

function base64url(donnee: string | Buffer): string {
  return Buffer.from(donnee)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Jeton d'acces, mis en cache jusqu'a une minute avant son expiration. */
let cache: { jeton: string; expire: number } | null = null;

async function jetonAcces(config: ConfigGSC): Promise<string> {
  if (cache && Date.now() < cache.expire) return cache.jeton;

  const maintenant = Math.floor(Date.now() / 1000);
  const entete = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const charge = base64url(
    JSON.stringify({
      iss: config.email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: maintenant,
      exp: maintenant + 3600,
    }),
  );

  let signature: string;
  try {
    signature = base64url(
      createSign("RSA-SHA256").update(`${entete}.${charge}`).sign(config.cle),
    );
  } catch (e) {
    // OpenSSL ne dit que "DECODER routines::unsupported", ce qui n'aide
    // personne. La cause est presque toujours la meme : la cle PEM a perdu ses
    // sauts de ligne en transitant par un panneau de variables d'environnement.
    // Un PEM sans separateurs ne se decode pas, alors que la valeur a l'air
    // parfaitement correcte a l'oeil.
    const lignes = config.cle.split("\n").filter(Boolean).length;
    if (lignes <= 1) {
      throw new Error(
        "La cle privee est sur une seule ligne : un PEM a besoin de ses sauts de ligne. " +
          "Recopiez la valeur du champ private_key du fichier JSON telle quelle, avec ses \\n " +
          "litteraux, entre guillemets doubles — le code les restaure. Certains panneaux " +
          "d'hebergeur suppriment les vrais retours a la ligne a l'enregistrement, ce qui " +
          "produit exactement ce cas.",
      );
    }
    throw new Error(
      `La cle privee n'a pas pu etre lue (${lignes} lignes). Une cle de compte de service ` +
        `Google en compte 28 : deux marqueurs et 26 lignes de corps. Si vous en comptez 26, ` +
        `les marqueurs ont ete manges par le champ de saisie — le code sait desormais les ` +
        `reposer, donc ce n'est plus la cause. Detail : ` +
        `${e instanceof Error ? e.message : String(e)}`,
    );
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${entete}.${charge}.${signature}`,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Authentification Google refusee (${res.status}) : ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cache = { jeton: data.access_token, expire: Date.now() + (data.expires_in - 60) * 1000 };
  return data.access_token;
}

export type Ligne = { cles: string[]; clics: number; impressions: number; ctr: number; position: number };

type ReponseAnalytics = {
  rows?: { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number }[];
};

/**
 * Une requete searchAnalytics.
 *
 * `dimensions` vide renvoie une ligne unique, le total de la periode — c'est ce
 * qui alimente les tuiles de synthese.
 */
async function analytics(
  config: ConfigGSC,
  corps: Record<string, unknown>,
): Promise<Ligne[]> {
  const jeton = await jetonAcces(config);
  const res = await fetch(
    `${API}/webmasters/v3/sites/${encodeURIComponent(config.propriete)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${jeton}`, "Content-Type": "application/json" },
      body: JSON.stringify(corps),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Search Console a repondu ${res.status} : ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as ReponseAnalytics;
  return (data.rows ?? []).map((r) => ({
    cles: r.keys ?? [],
    clics: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));
}

/** AAAA-MM-JJ, `decalage` jours avant aujourd'hui. */
function jour(decalage: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - decalage);
  return d.toISOString().slice(0, 10);
}

export type Totaux = { clics: number; impressions: number; ctr: number; position: number };

export type DonneesGSC = {
  propriete: string;
  periode: { debut: string; fin: string };
  actuel: Totaux;
  precedent: Totaux;
  serie: { date: string; clics: number; impressions: number }[];
  requetes: Ligne[];
  pages: Ligne[];
  pays: Ligne[];
  appareils: Ligne[];
};

const VIDE: Totaux = { clics: 0, impressions: 0, ctr: 0, position: 0 };

function total(lignes: Ligne[]): Totaux {
  return lignes[0] ? { clics: lignes[0].clics, impressions: lignes[0].impressions, ctr: lignes[0].ctr, position: lignes[0].position } : VIDE;
}

/**
 * Toutes les donnees du tableau de bord, en un aller-retour groupe.
 *
 * Search Console accuse trois jours de retard sur les donnees : la fenetre
 * commence donc a J-3 et non a aujourd'hui, sans quoi les derniers jours
 * apparaitraient vides et donneraient l'illusion d'un effondrement.
 */
export async function chargerDonnees(config: ConfigGSC): Promise<DonneesGSC> {
  const RETARD = 3;
  const fin = jour(RETARD);
  const debut = jour(RETARD + 27);
  const finPrec = jour(RETARD + 28);
  const debutPrec = jour(RETARD + 55);

  const base = { startDate: debut, endDate: fin, type: "web" as const };

  const [actuel, precedent, serie, requetes, pages, pays, appareils] = await Promise.all([
    analytics(config, base),
    analytics(config, { ...base, startDate: debutPrec, endDate: finPrec }),
    analytics(config, { ...base, dimensions: ["date"], rowLimit: 40 }),
    analytics(config, { ...base, dimensions: ["query"], rowLimit: 25 }),
    analytics(config, { ...base, dimensions: ["page"], rowLimit: 25 }),
    analytics(config, { ...base, dimensions: ["country"], rowLimit: 8 }),
    analytics(config, { ...base, dimensions: ["device"], rowLimit: 3 }),
  ]);

  return {
    propriete: config.propriete,
    periode: { debut, fin },
    actuel: total(actuel),
    precedent: total(precedent),
    serie: serie
      .map((l) => ({ date: l.cles[0], clics: l.clics, impressions: l.impressions }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    requetes,
    pages,
    pays,
    appareils,
  };
}

export type EtatUrl = { url: string; verdict: string; couverture: string; derniereExploration: string | null };

type ReponseInspection = {
  inspectionResult?: {
    indexStatusResult?: {
      verdict?: string;
      coverageState?: string;
      lastCrawlTime?: string;
    };
  };
};

/**
 * Etat d'indexation d'une URL.
 *
 * L'API d'inspection est limitee a 2 000 appels par jour et 600 par minute :
 * elle n'est appelee que sur une poignee d'URLs cles, jamais sur les 59 du
 * sitemap. Une erreur sur une URL ne doit pas faire tomber la page entiere,
 * d'ou le verdict de repli plutot qu'une exception.
 */
export async function inspecter(config: ConfigGSC, urls: string[]): Promise<EtatUrl[]> {
  const jeton = await jetonAcces(config);

  return Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetch(`${API}/v1/urlInspection/index:inspect`, {
          method: "POST",
          headers: { Authorization: `Bearer ${jeton}`, "Content-Type": "application/json" },
          body: JSON.stringify({ inspectionUrl: url, siteUrl: config.propriete }),
          cache: "no-store",
        });
        if (!res.ok) return { url, verdict: "INCONNU", couverture: `HTTP ${res.status}`, derniereExploration: null };
        const data = (await res.json()) as ReponseInspection;
        const r = data.inspectionResult?.indexStatusResult;
        return {
          url,
          verdict: r?.verdict ?? "INCONNU",
          couverture: r?.coverageState ?? "—",
          derniereExploration: r?.lastCrawlTime ?? null,
        };
      } catch {
        return { url, verdict: "INCONNU", couverture: "Appel echoue", derniereExploration: null };
      }
    }),
  );
}

export type Sitemap = {
  chemin: string;
  derniereLecture: string | null;
  urlsSoumises: number;
  erreurs: number;
  avertissements: number;
  obsolete: boolean;
};

type ReponseSitemaps = {
  sitemap?: {
    path: string;
    lastDownloaded?: string;
    errors?: string;
    warnings?: string;
    contents?: { type: string; submitted: string }[];
  }[];
};

/**
 * Sitemaps declares dans Search Console.
 *
 * Utile bien au-dela de la curiosite : la propriete d'Airfly ne declarait que
 * `http://www.airfly972.com/page-sitemap.xml`, un vestige du WordPress lu pour
 * la derniere fois en octobre 2022, en erreur. Le sitemap actuel n'y figurait
 * pas. Sans ce panneau, rien dans le back office ne l'aurait montre.
 *
 * `obsolete` marque un sitemap qui ne pointe pas vers le domaine canonique
 * courant : c'est presque toujours le residu d'une generation precedente du site.
 */
export async function listerSitemaps(config: ConfigGSC): Promise<Sitemap[]> {
  const jeton = await jetonAcces(config);
  const res = await fetch(
    `${API}/webmasters/v3/sites/${encodeURIComponent(config.propriete)}/sitemaps`,
    { headers: { Authorization: `Bearer ${jeton}` }, cache: "no-store" },
  );
  if (!res.ok) return [];

  const data = (await res.json()) as ReponseSitemaps;
  const canonique = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://airfly972.com").replace(/\/$/, "");

  return (data.sitemap ?? []).map((s) => ({
    chemin: s.path,
    derniereLecture: s.lastDownloaded ?? null,
    urlsSoumises: Number(s.contents?.find((c) => c.type === "web")?.submitted ?? 0),
    erreurs: Number(s.errors ?? 0),
    avertissements: Number(s.warnings ?? 0),
    obsolete: !s.path.startsWith(canonique),
  }));
}
