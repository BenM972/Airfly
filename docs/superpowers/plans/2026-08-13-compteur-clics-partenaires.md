# Compteur de clics partenaires — plan d'implémentation

> **Pour les agents :** SOUS-COMPÉTENCE REQUISE — utiliser superpowers:subagent-driven-development (recommandé) ou superpowers:executing-plans pour dérouler ce plan tâche par tâche. Les étapes utilisent la syntaxe case à cocher (`- [ ]`).

**Objectif :** Compter les clics sortants vers les partenaires et afficher, dans le back office uniquement, le nombre du mois en cours et le total.

**Architecture :** Une table Supabase à trois colonnes reçoit une ligne par clic. Le clic est capté côté client par un `fetch` en `keepalive` qui ne retarde jamais la navigation, envoyé à une route publique qui valide le slug, limite le débit et insère. La lecture se fait directement dans le composant serveur du tableau de bord — aucune route de lecture n'est créée, donc aucune URL n'expose le compteur.

**Pile technique :** Next.js 16 (App Router, Server Components), React 19, Supabase (clé service role côté serveur), Tailwind CSS 4.

## Contraintes globales

- **Le comptage ne doit jamais retarder ni empêcher le départ du visiteur.** Pas de `preventDefault`, pas d'`await` avant la navigation, échec silencieux.
- **Aucune donnée personnelle stockée.** La table contient le slug et la date, rien d'autre. L'IP sert uniquement de clé de limitation de débit en mémoire vive et n'est jamais écrite.
- **Aucune route de lecture ne doit être créée.** Le tableau de bord lit Supabase directement depuis le serveur.
- **La police Mirloanne ne contient aucun glyphe accentué.** Tout texte affiché avec `style={{ fontFamily: "Mirloanne, serif" }}` s'écrit sans accent. Le corps de texte utilise Cormorant ou la police système et accepte les accents.
- **Aucun framework de test dans ce projet.** La vérification passe par `npx tsc --noEmit`, `npm run lint`, `npm run build` et des assertions `curl` sur le serveur de production local. Ne pas installer de framework de test.
- **Aucune dépendance npm nouvelle.**
- Spec de référence : `docs/superpowers/specs/2026-08-13-compteur-clics-partenaires-design.md`

## Prérequis humain

La table Supabase doit être créée manuellement par le client dans l'éditeur SQL de Supabase — l'implémentation n'a pas d'accès DDL. La tâche 1 produit le SQL ; les tâches 2 et 3 fonctionnent même si la table n'existe pas encore (écriture en échec silencieux, carte affichant `—`).

## Structure des fichiers

| Fichier | Responsabilité |
|---|---|
| `docs/supabase-schema.sql` (modifier) | Déclaration de la table, à exécuter par le client |
| `src/lib/dates.ts` (créer) | Calcul du début de mois en heure de Martinique. Aucune dépendance, donc vérifiable isolément |
| `src/lib/partnerClicks.ts` (créer) | Écriture d'un clic, lecture des compteurs |
| `src/app/api/partners/click/route.ts` (créer) | Route publique d'enregistrement |
| `src/components/PartnerCard.tsx` (modifier) | Déclenchement au clic |
| `src/components/admin/AdminLogoutButton.tsx` (créer) | Bouton de déconnexion, extrait pour libérer la page |
| `src/app/admin/page.tsx` (modifier) | Passage en composant serveur, carte compteur |

---

### Tâche 1 : Schéma et module d'accès

**Fichiers :**
- Modifier : `docs/supabase-schema.sql`
- Créer : `src/lib/dates.ts`
- Créer : `src/lib/partnerClicks.ts`

**Interfaces :**
- Consomme : `getSupabase()` de `src/lib/supabase.ts`, et `partners` de `src/data/partners.ts` (tableau d'objets ayant au moins `slug: string` et `name: string`).
- Produit : `debutDuMoisMartinique(now?: Date): Date` depuis `src/lib/dates.ts` ; `recordPartnerClick(slug: string): Promise<void>` et `getPartnerClickStats(): Promise<PartnerClickStats>` depuis `src/lib/partnerClicks.ts`, avec `type PartnerClickStats = Record<string, { mois: number; total: number }>`. Consommés par les tâches 2 et 3.

`debutDuMoisMartinique` vit dans son propre fichier **sans aucune importation** : c'est la seule logique non triviale du lot, et cette isolation permet de la vérifier en compilant ce seul fichier, sans avoir à résoudre l'alias `@/` ni le client Supabase.

- [ ] **Étape 1 : Ajouter la table au schéma documenté**

À la fin de `docs/supabase-schema.sql`, ajouter :

```sql

-- ─── Clics sortants vers les partenaires ─────────────────────────────────────
-- Aucune donnee personnelle : slug et date, rien d'autre.
CREATE TABLE IF NOT EXISTS partner_clicks (
  id           uuid PRIMARY KEY,
  partner_slug text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_clicks_slug_date
  ON partner_clicks(partner_slug, created_at DESC);
```

- [ ] **Étape 2 : Créer le calcul de début de mois**

```ts
// src/lib/dates.ts

/**
 * La Martinique est a UTC-4 toute l'annee : le territoire n'observe pas
 * l'heure d'ete. Sans ce decalage, un clic du 31 a 21h locales (soit le 1er
 * a 01h UTC) serait compte sur le mois suivant.
 */
const DECALAGE_MARTINIQUE_MS = 4 * 60 * 60 * 1000;

/** Instant correspondant au 1er du mois courant, 00h00 en Martinique. */
export function debutDuMoisMartinique(now: Date = new Date()): Date {
  const local = new Date(now.getTime() - DECALAGE_MARTINIQUE_MS);
  const debutLocal = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1);
  return new Date(debutLocal + DECALAGE_MARTINIQUE_MS);
}
```

Ce fichier ne doit importer quoi que ce soit : l'étape 4 le compile isolément pour le vérifier.

- [ ] **Étape 3 : Créer le module d'accès**

```ts
// src/lib/partnerClicks.ts
import { partners } from "@/data/partners";
import { debutDuMoisMartinique } from "./dates";
import { getSupabase } from "./supabase";

const TABLE = "partner_clicks";

/** Compteurs par slug de partenaire. Un slug absent = lecture impossible. */
export type PartnerClickStats = Record<string, { mois: number; total: number }>;

export async function recordPartnerClick(slug: string): Promise<void> {
  const { error } = await getSupabase().from(TABLE).insert({
    id: crypto.randomUUID(),
    partner_slug: slug,
  });
  if (error) throw error;
}

/**
 * Deux requetes `count` par partenaire, jamais de rapatriement de lignes.
 * Un partenaire dont la lecture echoue est absent du resultat : l'affichage
 * distingue ainsi "aucun clic" (0) de "compteur indisponible" (absent).
 */
export async function getPartnerClickStats(): Promise<PartnerClickStats> {
  const debut = debutDuMoisMartinique().toISOString();
  const stats: PartnerClickStats = {};

  for (const partenaire of partners) {
    try {
      const sb = getSupabase();
      const base = () =>
        sb.from(TABLE).select("*", { count: "exact", head: true }).eq("partner_slug", partenaire.slug);

      const [total, mois] = await Promise.all([base(), base().gte("created_at", debut)]);

      if (total.error || mois.error) {
        console.error(`[partner-clicks] lecture impossible pour ${partenaire.slug}:`, total.error ?? mois.error);
        continue;
      }
      stats[partenaire.slug] = { total: total.count ?? 0, mois: mois.count ?? 0 };
    } catch (err) {
      console.error(`[partner-clicks] lecture impossible pour ${partenaire.slug}:`, err);
    }
  }

  return stats;
}
```

- [ ] **Étape 4 : Vérifier le calcul du début de mois sur le vrai code**

Ce calcul est la seule logique non triviale du lot. On compile `src/lib/dates.ts` isolément et on importe le résultat — pas une copie de la logique, le module lui-même :

```bash
cd "/Users/ben/Documents/BM CONSULTING/AIRFLY/NEW AIRFLY"
npx tsc --noEmit && echo "tsc OK"

rm -rf /tmp/verif-dates && npx tsc src/lib/dates.ts --ignoreConfig \
  --outDir /tmp/verif-dates --module commonjs --target es2020

cat > /tmp/verif-mois.cjs <<'EOF'
const { debutDuMoisMartinique } = require("/tmp/verif-dates/dates.js");
const cas = [
  ["2026-09-01T03:00:00Z", "2026-08-01T04:00:00.000Z"], // 31 aout 23h en Martinique
  ["2026-09-01T05:00:00Z", "2026-09-01T04:00:00.000Z"], // 1er septembre 01h en Martinique
  ["2026-01-15T12:00:00Z", "2026-01-01T04:00:00.000Z"], // milieu de mois
  ["2026-03-01T02:30:00Z", "2026-02-01T04:00:00.000Z"], // 28 fevrier 22h30, mois court
];
let echecs = 0;
for (const [entree, attendu] of cas) {
  const obtenu = debutDuMoisMartinique(new Date(entree)).toISOString();
  const ok = obtenu === attendu;
  if (!ok) echecs++;
  console.log(`${ok ? "OK   " : "ECHEC"} ${entree} -> ${obtenu} (attendu ${attendu})`);
}
process.exit(echecs === 0 ? 0 : 1);
EOF
node /tmp/verif-mois.cjs
```

Attendu : les quatre lignes commencent par `OK`, et le script sort en code 0.

Le premier cas est le piège central : un clic du 31 août à 23 h en Martinique doit être compté sur **août**, pas sur septembre. Le quatrième vérifie un mois court.

Toutes les valeurs attendues finissent par `T04:00:00.000Z`, ce qui est normal : minuit en Martinique, c'est 4 h UTC.

- [ ] **Étape 5 : Vérifier lint et build**

```bash
cd "/Users/ben/Documents/BM CONSULTING/AIRFLY/NEW AIRFLY"
npm run lint && npm run build 2>&1 | grep -E "Compiled|Failed"
```

Attendu : `npm run lint` finit sur `0 errors` (28 avertissements préexistants sont normaux), et le build affiche `✓ Compiled successfully`.

- [ ] **Étape 6 : Commit**

```bash
git add docs/supabase-schema.sql src/lib/dates.ts src/lib/partnerClicks.ts
git commit -m "feat(compteur): table partner_clicks et module d'acces"
```

---

### Tâche 2 : Route d'enregistrement et déclenchement au clic

**Fichiers :**
- Créer : `src/app/api/partners/click/route.ts`
- Modifier : `src/components/PartnerCard.tsx`

**Interfaces :**
- Consomme : `recordPartnerClick(slug: string): Promise<void>` de `src/lib/partnerClicks.ts` (tâche 1) ; `partners` de `src/data/partners.ts` ; `isSameOrigin(req: Request): boolean`, `clientIp(req: Request): string`, `rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number }` et `tooManyRequests(retryAfter: number): Response`, tous de `src/lib/rateLimit.ts`.
- Produit : la route `POST /api/partners/click`, appelée uniquement par `PartnerCard`.

Les deux faces du chemin d'écriture vont ensemble : la route seule ne prouve rien tant que rien ne l'appelle, et le déclenchement seul n'a pas de destination.

- [ ] **Étape 1 : Créer la route**

```ts
// src/app/api/partners/click/route.ts
import { NextRequest, NextResponse } from "next/server";
import { partners } from "@/data/partners";
import { recordPartnerClick } from "@/lib/partnerClicks";
import { clientIp, isSameOrigin, rateLimit, tooManyRequests } from "@/lib/rateLimit";

// Route publique par necessite : c'est un visiteur anonyme qui l'appelle.
const PAR_IP = 30;
const FENETRE_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Origine non autorisee" }, { status: 403 });
  }

  const limite = rateLimit(`partner-click:${clientIp(req)}`, PAR_IP, FENETRE_MS);
  if (!limite.ok) return tooManyRequests(limite.retryAfter);

  let slug: unknown;
  try {
    ({ slug } = await req.json());
  } catch {
    return NextResponse.json({ error: "Requete invalide" }, { status: 400 });
  }

  // Sans cette validation, n'importe qui pourrait remplir la table de slugs arbitraires.
  if (typeof slug !== "string" || !partners.some((p) => p.slug === slug)) {
    return NextResponse.json({ error: "Partenaire inconnu" }, { status: 400 });
  }

  try {
    await recordPartnerClick(slug);
  } catch (err) {
    // Le visiteur n'a rien a faire de ce resultat, et la reponse ne doit rien
    // reveler de l'etat de la base.
    console.error("[partner-click] enregistrement impossible:", err);
  }

  return new NextResponse(null, { status: 204 });
}
```

- [ ] **Étape 2 : Déclencher le comptage dans la carte**

Dans `src/components/PartnerCard.tsx`, ajouter cette fonction à l'intérieur du composant, juste après la ligne `const image = partner.image;` :

```tsx
  // Le depart du visiteur prime : ni preventDefault, ni await avant la
  // navigation. keepalive assure l'envoi pendant l'ouverture du nouvel onglet.
  const compterLeClic = () => {
    try {
      fetch("/api/partners/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: partner.slug }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Un echec de comptage ne doit jamais remonter au visiteur.
    }
  };
```

Puis ajouter `onClick={compterLeClic}` sur la balise `<a>` du lien sortant, juste après `href={partner.href}` :

```tsx
        <a
          href={partner.href}
          onClick={compterLeClic}
          target="_blank"
          rel="noopener noreferrer"
```

Ne rien changer d'autre sur ce lien : `target`, `rel`, classes et libellé restent identiques.

- [ ] **Étape 3 : Vérifier compilation, lint et build**

```bash
cd "/Users/ben/Documents/BM CONSULTING/AIRFLY/NEW AIRFLY"
npx tsc --noEmit && echo "tsc OK" && npm run lint && npm run build 2>&1 | grep -E "Compiled|Failed"
```

Attendu : `tsc` sans sortie, lint sur `0 errors`, build réussi.

- [ ] **Étape 4 : Vérifier le comportement de la route**

```bash
cd "/Users/ben/Documents/BM CONSULTING/AIRFLY/NEW AIRFLY"
pkill -f "next start"; (npm start > /tmp/compteur.log 2>&1 &) ; sleep 14
S=http://localhost:3000
O='Origin: http://localhost:3000'
J='Content-Type: application/json'

echo -n "slug valide          -> "; curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "$J" -H "$O" -d '{"slug":"salty-lodge"}' $S/api/partners/click
echo -n "slug inconnu         -> "; curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "$J" -H "$O" -d '{"slug":"nexiste-pas"}' $S/api/partners/click
echo -n "slug non textuel     -> "; curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "$J" -H "$O" -d '{"slug":42}' $S/api/partners/click
echo -n "corps illisible      -> "; curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "$J" -H "$O" -d 'pas du json' $S/api/partners/click
echo -n "origine etrangere    -> "; curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "$J" -H 'Origin: https://evil.com' -d '{"slug":"salty-lodge"}' $S/api/partners/click
echo -n "GET (aucune lecture) -> "; curl -s -o /dev/null -w "%{http_code}\n" $S/api/partners/click
echo -n "le lien sortant est intact -> "; curl -s $S/ | grep -c 'href="https://saltylodge.fr/"'
```

Attendu, dans l'ordre : `204`, `400`, `400`, `400`, `403`, `405`, `1`.

La dernière assertion est la plus importante du lot : elle vérifie que le `href` pointe toujours directement chez le partenaire, et donc que la valeur SEO du lien éditorial est préservée.

- [ ] **Étape 5 : Vérifier la limitation de débit, sans polluer la base**

Le limiteur s'exécute **avant** la validation du slug. On l'exerce donc avec un slug inconnu : les 30 premiers appels sont refusés en `400` sans écrire la moindre ligne, et le 31e est refusé en `429` par le limiteur.

```bash
cd "/Users/ben/Documents/BM CONSULTING/AIRFLY/NEW AIRFLY"
S=http://localhost:3000
for i in $(seq 1 31); do
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H 'Content-Type: application/json' -H 'Origin: http://localhost:3000' \
    -H 'X-Forwarded-For: 203.0.113.77' -d '{"slug":"nexiste-pas"}' $S/api/partners/click)
  [ "$i" -ge 29 ] && echo "  appel $i -> $code"
done
```

Attendu : les appels 29 et 30 renvoient `400`, le 31e renvoie `429`.

Note : l'étape 4 a inséré **une** ligne réelle avec le slug `salty-lodge`, si la table existe déjà. C'est le prix de la vérification bout en bout ; la signaler au client, qui pourra la supprimer d'un `DELETE FROM partner_clicks;` dans Supabase avant la mise en service.

- [ ] **Étape 6 : Arrêter le serveur**

```bash
pkill -f "next start"; pkill -f "next-server"
```

- [ ] **Étape 7 : Commit**

```bash
git add src/app/api/partners/click src/components/PartnerCard.tsx
git commit -m "feat(compteur): route d'enregistrement et declenchement au clic"
```

---

### Tâche 3 : Carte compteur dans le back office

**Fichiers :**
- Créer : `src/components/admin/AdminLogoutButton.tsx`
- Modifier : `src/app/admin/page.tsx`

**Interfaces :**
- Consomme : `getPartnerClickStats(): Promise<PartnerClickStats>` de `src/lib/partnerClicks.ts` (tâche 1), avec `PartnerClickStats = Record<string, { mois: number; total: number }>` ; `partners` de `src/data/partners.ts`.
- Produit : rien que d'autres tâches consomment.

Le passage en composant serveur et la carte vont ensemble : c'est précisément ce passage qui permet de lire Supabase sans créer de route.

- [ ] **Étape 1 : Extraire le bouton de déconnexion**

```tsx
// src/components/admin/AdminLogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";

/**
 * Seul element interactif du tableau de bord. L'extraire permet a la page
 * de rester un composant serveur, et donc de lire Supabase directement
 * sans exposer de route de lecture.
 */
export default function AdminLogoutButton() {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  return (
    <button
      onClick={logout}
      className="text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors"
      style={{ fontFamily: "Mirloanne, serif" }}
    >
      Deconnexion
    </button>
  );
}
```

- [ ] **Étape 2 : Passer le tableau de bord en composant serveur et ajouter la carte**

Remplacer intégralement `src/app/admin/page.tsx` par :

```tsx
import Link from "next/link";
import Image from "next/image";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import { partners } from "@/data/partners";
import { getPartnerClickStats } from "@/lib/partnerClicks";

export default async function AdminDashboard() {
  // Lecture directe depuis le serveur : aucune route n'expose ces chiffres.
  const stats = await getPartnerClickStats();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image src="/logo-airfly.webp" alt="Airfly" width={60} height={24} className="object-contain" />
          <span className="text-gray-600 text-xs uppercase tracking-widest" style={{ fontFamily: "Mirloanne, serif" }}>
            Back office
          </span>
        </div>
        <AdminLogoutButton />
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-2xl uppercase tracking-widest mb-2" style={{ fontFamily: "Mirloanne, serif" }}>
          Tableau de bord
        </h1>
        <p className="text-gray-500 mb-12" style={{ fontFamily: "var(--font-cormorant)" }}>
          Bienvenue dans le back office Airfly.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/products"
            className="group bg-gray-900 border border-gray-800 hover:border-[#FF0080] p-8 transition-colors duration-200"
          >
            <div className="text-[#FF0080] text-2xl mb-3">◆</div>
            <p className="text-white uppercase tracking-widest text-sm mb-2" style={{ fontFamily: "Mirloanne, serif" }}>
              Produits
            </p>
            <p className="text-gray-500 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>
              Ajouter, modifier, supprimer des produits. Gerer les variantes et les stocks.
            </p>
          </Link>

          <Link
            href="/admin/products/new"
            className="group bg-gray-900 border border-gray-800 hover:border-[#FF0080] p-8 transition-colors duration-200"
          >
            <div className="text-[#FF0080] text-2xl mb-3">+</div>
            <p className="text-white uppercase tracking-widest text-sm mb-2" style={{ fontFamily: "Mirloanne, serif" }}>
              Nouveau produit
            </p>
            <p className="text-gray-500 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>
              Creer un nouveau produit simple ou variable avec photos, prix et categories.
            </p>
          </Link>

          {/* Pas de Link : il n'y a nulle part ou aller */}
          {partners.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 p-8">
              <div className="text-[#FF0080] text-2xl mb-3">↗</div>
              <p className="text-white uppercase tracking-widest text-sm mb-4" style={{ fontFamily: "Mirloanne, serif" }}>
                Clics partenaires
              </p>

              {partners.map((partenaire) => {
                const compteur = stats[partenaire.slug];
                const valeur = (n: number | undefined) => (compteur ? String(n) : "—");
                return (
                  <div key={partenaire.slug} className="mb-4 last:mb-0">
                    <p className="text-gray-400 text-sm mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>
                      {partenaire.name}
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500" style={{ fontFamily: "var(--font-cormorant)" }}>Clics ce mois</span>
                      <span className="text-white tabular-nums">{valeur(compteur?.mois)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500" style={{ fontFamily: "var(--font-cormorant)" }}>Clics totaux</span>
                      <span className="text-white tabular-nums">{valeur(compteur?.total)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Étape 3 : Vérifier compilation, lint et build**

```bash
cd "/Users/ben/Documents/BM CONSULTING/AIRFLY/NEW AIRFLY"
npx tsc --noEmit && echo "tsc OK" && npm run lint && npm run build 2>&1 | grep -E "Compiled|Failed"
```

Attendu : `tsc` sans sortie, lint sur `0 errors`, build réussi.

- [ ] **Étape 4 : Vérifier que le compteur reste inaccessible sans authentification**

```bash
cd "/Users/ben/Documents/BM CONSULTING/AIRFLY/NEW AIRFLY"
pkill -f "next start"; (npm start > /tmp/compteur.log 2>&1 &) ; sleep 14
S=http://localhost:3000

echo -n "/admin sans cookie          -> "; curl -s -o /dev/null -w "%{http_code}\n" $S/admin
echo -n "compteur dans la page d'accueil publique -> "; curl -s $S/ | grep -c "Clics ce mois"
echo -n "compteur dans /shop         -> "; curl -s $S/shop | grep -c "Clics ce mois"
```

Attendu : `307` pour `/admin` (redirection vers la connexion), puis `0` et `0` — aucune page publique ne contient le compteur.

- [ ] **Étape 5 : Vérifier l'affichage une fois authentifié**

```bash
cd "/Users/ben/Documents/BM CONSULTING/AIRFLY/NEW AIRFLY"
S=http://localhost:3000
PW=$(grep '^ADMIN_PASSWORD=' .env.local | cut -d= -f2- | tr -d '"'"'"'')
curl -s -c /tmp/cookie-admin.txt -o /dev/null -X POST -H 'Content-Type: application/json' \
  --data "$(printf '{"password":"%s"}' "$PW")" $S/api/admin/auth
curl -s -b /tmp/cookie-admin.txt $S/admin > /tmp/admin.html

echo -n "carte presente      -> "; grep -c "Clics partenaires" /tmp/admin.html
echo -n "ligne mois          -> "; grep -c "Clics ce mois" /tmp/admin.html
echo -n "ligne total         -> "; grep -c "Clics totaux" /tmp/admin.html
echo -n "nom du partenaire   -> "; grep -c "Salty Lodge" /tmp/admin.html
echo -n "bouton deconnexion  -> "; grep -c "Deconnexion" /tmp/admin.html
rm -f /tmp/cookie-admin.txt
```

Attendu : `1` pour chacune des cinq lignes.

Si la table Supabase n'a pas encore été créée par le client, les valeurs affichées sont `—` et non des nombres : c'est le comportement attendu, pas une erreur. Les assertions ci-dessus restent vraies dans les deux cas.

- [ ] **Étape 6 : Arrêter le serveur**

```bash
pkill -f "next start"; pkill -f "next-server"
```

- [ ] **Étape 7 : Commit**

```bash
git add src/components/admin/AdminLogoutButton.tsx src/app/admin/page.tsx
git commit -m "feat(compteur): carte clics partenaires dans le back office"
```

---

## Hors périmètre

Ne pas implémenter, même si l'occasion semble se présenter :

- Répartition par mois, graphique, export
- Page `/admin/partenaires` dédiée
- Comptage des visiteurs uniques, cookie, empreinte ou IP hachée
- Filtrage des bots au-delà de la limitation de débit
- Comptage d'autres liens sortants (Instagram, Facebook, WhatsApp, Google Maps)
- Purge automatique des anciennes lignes
- Toute route exposant les compteurs en lecture

## À transmettre au client après implémentation

Le `CREATE TABLE` ajouté à `docs/supabase-schema.sql` doit être exécuté dans l'éditeur SQL de Supabase. Tant que ce n'est pas fait, la carte affiche `—` et les clics ne sont pas enregistrés.

Aucune ligne de test n'a été insérée : la table n'existait pas au moment de la vérification.

Après exécution du `CREATE TABLE`, PostgREST doit recharger son cache de schéma. C'est normalement automatique en une seconde, mais si la carte affiche encore `—` quelques minutes après la création de la table, ce n'est ni un bug ni une erreur de DDL : forcer le rechargement depuis le tableau de bord Supabase (Settings → API → Reload schema cache), ou exécuter `NOTIFY pgrst, 'reload schema';` dans l'éditeur SQL.
