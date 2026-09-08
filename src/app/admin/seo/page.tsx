import Link from "next/link";
import Image from "next/image";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import SeoCourbe from "@/components/admin/SeoCourbe";
import { lireConfig, chargerDonnees, inspecter, listerSitemaps, type Ligne, type Sitemap } from "@/lib/googleSearchConsole";

// Comme le tableau de bord principal : ces chiffres changent tous les jours, un
// prerendu au build les figerait a la valeur du dernier deploiement.
export const dynamic = "force-dynamic";

const ACCENT = "#FF0080";
const IMPRESSIONS = "#38BDF8";

// Trio d'etat, valide au script du referentiel de visualisation : separation
// CVD, chroma et contraste sur le fond #111827 passent tous. Chaque etat porte
// en plus son libelle en toutes lettres — jamais la couleur seule.
const ETATS: Record<string, { couleur: string; libelle: string }> = {
  PASS: { couleur: "#34D399", libelle: "Indexee" },
  PARTIAL: { couleur: "#FBBF24", libelle: "Partielle" },
  FAIL: { couleur: "#F87171", libelle: "Non indexee" },
  NEUTRAL: { couleur: "#9CA3AF", libelle: "Exclue" },
  INCONNU: { couleur: "#6B7280", libelle: "Inconnu" },
};

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://airfly972.com";

function pourcent(v: number): string {
  return `${(v * 100).toFixed(1).replace(".", ",")} %`;
}

function nombre(v: number): string {
  return Math.round(v).toLocaleString("fr-FR");
}

/** Ecart relatif entre deux periodes, ou null si la precedente est vide. */
function ecart(actuel: number, precedent: number): number | null {
  if (!precedent) return null;
  return (actuel - precedent) / precedent;
}

function Tuile({
  libelle,
  valeur,
  delta,
  inverse = false,
}: {
  libelle: string;
  valeur: string;
  delta: number | null;
  /** Pour la position moyenne, baisser est une amelioration. */
  inverse?: boolean;
}) {
  const bon = delta === null ? null : inverse ? delta < 0 : delta > 0;
  const couleur = bon === null ? "#6B7280" : bon ? "#34D399" : "#F87171";

  return (
    <div className="bg-gray-900 border border-gray-800 px-5 py-4">
      <p className="text-gray-500 text-[11px] uppercase tracking-widest mb-2" style={{ fontFamily: "Mirloanne, serif" }}>
        {libelle}
      </p>
      <p className="text-white text-2xl tabular-nums" style={{ fontFamily: "var(--font-cormorant)" }}>
        {valeur}
      </p>
      <p className="text-xs mt-1 tabular-nums" style={{ fontFamily: "var(--font-cormorant)", color: couleur }}>
        {delta === null
          ? "pas de comparaison"
          : `${delta > 0 ? "+" : "−"}${Math.abs(delta * 100).toFixed(1).replace(".", ",")} % sur 28 jours`}
      </p>
    </div>
  );
}

/** Table classee, avec une barre de magnitude en fond de la premiere colonne. */
function Classement({
  titre,
  lignes,
  intitule,
  transformer,
}: {
  titre: string;
  lignes: Ligne[];
  intitule: string;
  transformer?: (cle: string) => string;
}) {
  const max = Math.max(...lignes.map((l) => l.clics), 1);

  return (
    <section className="bg-gray-900 border border-gray-800">
      <h2
        className="text-gray-400 text-xs uppercase tracking-widest px-5 py-4 border-b border-gray-800"
        style={{ fontFamily: "Mirloanne, serif" }}
      >
        {titre}
      </h2>

      {lignes.length === 0 ? (
        <p className="text-gray-600 text-sm px-5 py-6" style={{ fontFamily: "var(--font-cormorant)" }}>
          Aucune donnee sur la periode.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>
            <thead>
              <tr className="text-gray-600 text-[11px] uppercase tracking-widest" style={{ fontFamily: "Mirloanne, serif" }}>
                <th className="text-left font-normal px-5 py-2">{intitule}</th>
                <th className="text-right font-normal px-3 py-2 whitespace-nowrap">Clics</th>
                <th className="text-right font-normal px-3 py-2 whitespace-nowrap">Impr.</th>
                <th className="text-right font-normal px-3 py-2 whitespace-nowrap">CTR</th>
                <th className="text-right font-normal px-5 py-2 whitespace-nowrap">Pos.</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => (
                <tr key={l.cles.join("|")} className="border-t border-gray-800/70">
                  <td className="px-5 py-2.5 relative">
                    {/* Barre de magnitude : elle situe la ligne d'un coup d'oeil,
                        le chiffre exact reste lisible a cote. */}
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 bottom-0 bg-[#FF0080]/10"
                      style={{ width: `${(l.clics / max) * 100}%` }}
                    />
                    <span className="relative text-gray-200 break-words">
                      {transformer ? transformer(l.cles[0]) : l.cles[0]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-white tabular-nums">{nombre(l.clics)}</td>
                  <td className="px-3 py-2.5 text-right text-gray-400 tabular-nums">{nombre(l.impressions)}</td>
                  <td className="px-3 py-2.5 text-right text-gray-400 tabular-nums">{pourcent(l.ctr)}</td>
                  <td className="px-5 py-2.5 text-right text-gray-400 tabular-nums">{l.position.toFixed(1).replace(".", ",")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Cadre({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-4">
            <Image src="/logo-airfly.webp" alt="Airfly" width={60} height={24} className="object-contain" />
            <span className="text-gray-600 text-xs uppercase tracking-widest" style={{ fontFamily: "Mirloanne, serif" }}>
              Back office
            </span>
          </Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-400 text-xs uppercase tracking-widest" style={{ fontFamily: "Mirloanne, serif" }}>
            Recherche Google
          </span>
        </div>
        <AdminLogoutButton />
      </header>
      <main className="max-w-5xl mx-auto px-6 py-12">{children}</main>
    </div>
  );
}

/** Marche a suivre, affichee tant que le compte de service n'existe pas. */
function AConfigurer() {
  const etapes = [
    {
      titre: "Verifier le site dans Search Console",
      detail: "search.google.com/search-console — ajouter une propriete de type Domaine pour airfly972.com, puis poser l'enregistrement TXT chez Hostinger. Une propriete Domaine couvre l'apex, le www, le http et le https d'un coup.",
    },
    {
      titre: "Creer un compte de service",
      detail: "console.cloud.google.com — nouveau projet, activer l'API Search Console, creer un compte de service et telecharger sa cle au format JSON. Aucun role a lui donner au niveau du projet.",
    },
    {
      titre: "Donner acces a la propriete",
      detail: "Dans Search Console, Parametres puis Utilisateurs et autorisations : ajouter l'adresse du compte de service en lecture seule.",
    },
    {
      titre: "Renseigner trois variables",
      detail: "GSC_SERVICE_ACCOUNT_EMAIL, GSC_PRIVATE_KEY et GSC_SITE_URL dans le panneau Hostinger. Le detail est dans .env.example.",
    },
  ];

  return (
    <Cadre>
      <h1 className="text-2xl uppercase tracking-widest mb-3" style={{ fontFamily: "Mirloanne, serif" }}>
        Recherche Google
      </h1>
      <p className="text-gray-500 mb-10 max-w-2xl" style={{ fontFamily: "var(--font-cormorant)" }}>
        Cette page affichera les statistiques de recherche du site — clics, impressions, requetes et
        position moyenne — une fois la connexion a Search Console etablie. Il y a quatre gestes a faire,
        et ils passent tous par votre compte Google.
      </p>

      <ol className="space-y-3 mb-10">
        {etapes.map((e, i) => (
          <li key={e.titre} className="bg-gray-900 border border-gray-800 px-5 py-4 flex gap-4">
            <span
              className="text-[#FF0080] text-sm tabular-nums shrink-0 pt-0.5"
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              {i + 1}
            </span>
            <div>
              <p className="text-white text-sm uppercase tracking-widest mb-1.5" style={{ fontFamily: "Mirloanne, serif" }}>
                {e.titre}
              </p>
              <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: "var(--font-cormorant)" }}>
                {e.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-gray-600 text-sm max-w-2xl" style={{ fontFamily: "var(--font-cormorant)" }}>
        Search Console ne peut pas etre affichee dans un cadre : Google sert ses consoles avec
        <span className="text-gray-400"> X-Frame-Options: DENY</span>. Les donnees sont donc lues par son
        API et mises en forme ici. Comptez deux a trois jours de collecte avant que les premiers chiffres
        apparaissent, et notez que Search Console accuse toujours trois jours de retard.
      </p>
    </Cadre>
  );
}

export default async function SeoPage() {
  const config = lireConfig();
  if (!config) return <AConfigurer />;

  let donnees;
  let urls;
  let sitemaps: Sitemap[] = [];
  try {
    donnees = await chargerDonnees(config);
    urls = await inspecter(config, [SITE, `${SITE}/ecole`, `${SITE}/shop`]);
    sitemaps = await listerSitemaps(config);
  } catch (e) {
    return (
      <Cadre>
        <h1 className="text-2xl uppercase tracking-widest mb-3" style={{ fontFamily: "Mirloanne, serif" }}>
          Recherche Google
        </h1>
        <div className="bg-gray-900 border border-[#F87171]/40 px-5 py-4 max-w-2xl">
          <p className="text-[#F87171] text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "Mirloanne, serif" }}>
            Connexion impossible
          </p>
          <p className="text-gray-300 text-sm mb-3" style={{ fontFamily: "var(--font-cormorant)" }}>
            {e instanceof Error ? e.message : "Erreur inconnue"}
          </p>
          {/* Le message ci-dessus est desormais explicite pour le cas le plus
              frequent, la cle privee aplatie sur une ligne. Ces deux autres
              causes ne valent que si l'erreur vient de Google, pas du decodage
              de la cle — d'ou le repli conditionnel. */}
          {!(e instanceof Error && e.message.includes("cle privee")) && (
            <p className="text-gray-500 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>
              Les causes les plus frequentes : le compte de service n&apos;a pas ete ajoute aux utilisateurs
              de la propriete, ou <span className="text-gray-400">GSC_SITE_URL</span> ne correspond pas
              exactement a la propriete declaree — une propriete Domaine s&apos;ecrit
              <span className="text-gray-400"> sc-domain:airfly972.com</span>, une propriete Prefixe
              d&apos;URL s&apos;ecrit <span className="text-gray-400">https://airfly972.com/</span>, slash final compris.
            </p>
          )}
        </div>
      </Cadre>
    );
  }

  const { actuel, precedent, serie, requetes, pages, appareils, periode } = donnees;

  return (
    <Cadre>
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-8">
        <h1 className="text-2xl uppercase tracking-widest" style={{ fontFamily: "Mirloanne, serif" }}>
          Recherche Google
        </h1>
        <p className="text-gray-600 text-xs tabular-nums" style={{ fontFamily: "var(--font-cormorant)" }}>
          du {periode.debut} au {periode.fin} · {donnees.propriete}
        </p>
      </div>

      {actuel.impressions === 0 && (
        <div className="bg-gray-900 border border-[#FBBF24]/40 px-5 py-4 mb-8 max-w-3xl">
          <p className="text-[#FBBF24] text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "Mirloanne, serif" }}>
            Pas encore de donnees
          </p>
          <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>
            La connexion fonctionne, mais Search Console n&apos;a rien a servir pour l&apos;instant : les
            statistiques de performance ne commencent a s&apos;accumuler qu&apos;a partir de la validation de
            la propriete, sans reprise de l&apos;historique. Comptez deux a trois jours avant les premiers
            chiffres. L&apos;etat d&apos;indexation ci-dessous, lui, est deja disponible.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Tuile libelle="Clics" valeur={nombre(actuel.clics)} delta={ecart(actuel.clics, precedent.clics)} />
        <Tuile libelle="Impressions" valeur={nombre(actuel.impressions)} delta={ecart(actuel.impressions, precedent.impressions)} />
        <Tuile libelle="CTR" valeur={pourcent(actuel.ctr)} delta={ecart(actuel.ctr, precedent.ctr)} />
        <Tuile
          libelle="Position moyenne"
          valeur={actuel.position.toFixed(1).replace(".", ",")}
          delta={ecart(actuel.position, precedent.position)}
          inverse
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-3 mb-8">
        <SeoCourbe titre="Clics par jour" couleur={ACCENT} points={serie.map((s) => ({ date: s.date, valeur: s.clics }))} />
        <SeoCourbe titre="Impressions par jour" couleur={IMPRESSIONS} points={serie.map((s) => ({ date: s.date, valeur: s.impressions }))} />
      </div>

      <div className="grid gap-3 mb-8">
        <Classement titre="Requetes les plus vues" lignes={requetes} intitule="Requete" />
        <Classement
          titre="Pages les plus vues"
          lignes={pages}
          intitule="Page"
          transformer={(u) => u.replace(SITE, "") || "/"}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <section className="bg-gray-900 border border-gray-800">
          <h2 className="text-gray-400 text-xs uppercase tracking-widest px-5 py-4 border-b border-gray-800" style={{ fontFamily: "Mirloanne, serif" }}>
            Indexation des pages cles
          </h2>
          <ul>
            {urls.map((u) => {
              const etat = ETATS[u.verdict] ?? ETATS.INCONNU;
              return (
                <li key={u.url} className="px-5 py-3 border-t border-gray-800/70 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-gray-200 text-sm truncate" style={{ fontFamily: "var(--font-cormorant)" }}>
                      {u.url.replace(SITE, "") || "/"}
                    </p>
                    <p className="text-gray-600 text-xs" style={{ fontFamily: "var(--font-cormorant)" }}>
                      {u.couverture}
                    </p>
                  </div>
                  {/* Pastille + libelle : l'etat ne repose jamais sur la couleur seule. */}
                  <span
                    className="text-[11px] uppercase tracking-widest whitespace-nowrap flex items-center gap-2"
                    style={{ fontFamily: "Mirloanne, serif", color: etat.couleur }}
                  >
                    <span aria-hidden="true" className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: etat.couleur }} />
                    {etat.libelle}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="bg-gray-900 border border-gray-800">
          <h2 className="text-gray-400 text-xs uppercase tracking-widest px-5 py-4 border-b border-gray-800" style={{ fontFamily: "Mirloanne, serif" }}>
            Appareils
          </h2>
          <ul>
            {appareils.map((a) => (
              <li key={a.cles[0]} className="px-5 py-3 border-t border-gray-800/70 flex items-center justify-between">
                <span className="text-gray-200 text-sm capitalize" style={{ fontFamily: "var(--font-cormorant)" }}>
                  {a.cles[0].toLowerCase()}
                </span>
                <span className="text-white text-sm tabular-nums" style={{ fontFamily: "var(--font-cormorant)" }}>
                  {nombre(a.clics)} clics · {pourcent(a.ctr)}
                </span>
              </li>
            ))}
            {appareils.length === 0 && (
              <li className="px-5 py-6 text-gray-600 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>
                Aucune donnee sur la periode.
              </li>
            )}
          </ul>
        </section>
      </div>

      <section className="bg-gray-900 border border-gray-800 mt-3">
        <h2 className="text-gray-400 text-xs uppercase tracking-widest px-5 py-4 border-b border-gray-800" style={{ fontFamily: "Mirloanne, serif" }}>
          Sitemaps declares
        </h2>
        {sitemaps.length === 0 ? (
          <p className="text-gray-600 text-sm px-5 py-6" style={{ fontFamily: "var(--font-cormorant)" }}>
            Aucun sitemap soumis. Search Console decouvrira quand meme les pages par le lien present dans
            robots.txt, mais un sitemap soumis explicitement se suit page par page.
          </p>
        ) : (
          <ul>
            {sitemaps.map((s) => (
              <li key={s.chemin} className="px-5 py-3 border-t border-gray-800/70">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-gray-200 text-sm break-all" style={{ fontFamily: "var(--font-cormorant)" }}>
                    {s.chemin}
                  </p>
                  {s.obsolete && (
                    <span
                      className="text-[11px] uppercase tracking-widest whitespace-nowrap flex items-center gap-2"
                      style={{ fontFamily: "Mirloanne, serif", color: "#F87171" }}
                    >
                      <span aria-hidden="true" className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: "#F87171" }} />
                      Obsolete
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-xs mt-1 tabular-nums" style={{ fontFamily: "var(--font-cormorant)" }}>
                  {s.urlsSoumises} URLs · derniere lecture{" "}
                  {s.derniereLecture ? s.derniereLecture.slice(0, 10) : "jamais"}
                  {s.erreurs > 0 && ` · ${s.erreurs} erreur${s.erreurs > 1 ? "s" : ""}`}
                  {s.avertissements > 0 && ` · ${s.avertissements} avertissement${s.avertissements > 1 ? "s" : ""}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-gray-700 text-xs mt-8" style={{ fontFamily: "var(--font-cormorant)" }}>
        Search Console accuse trois jours de retard : la periode s&apos;arrete volontairement a J−3, sans
        quoi les derniers jours paraitraient vides.
      </p>
    </Cadre>
  );
}
