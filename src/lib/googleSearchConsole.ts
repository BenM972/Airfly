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
export function lireConfig(): ConfigGSC | null {
  const email = process.env.GSC_SERVICE_ACCOUNT_EMAIL;
  const propriete = process.env.GSC_SITE_URL;
  // Les sauts de ligne d'une cle PEM ne survivent pas a un panneau de variables
  // d'environnement : ils y sont colles en `\n` litteraux, qu'il faut restaurer.
  const cle = process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !cle || !propriete) return null;
  return { email, cle, propriete };
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

  const signature = base64url(
    createSign("RSA-SHA256").update(`${entete}.${charge}`).sign(config.cle),
  );

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
