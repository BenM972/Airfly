"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LIBELLE_STATUT, type Demande, type Statut } from "@/lib/demandes";

/**
 * Une demande dans le back office, avec ses actions.
 *
 * Traiter une demande envoie un courriel au client : chaque bouton est donc un
 * acte visible de l'exterieur, jamais une simple mise a jour d'affichage. Le
 * retour de la route dit si le courriel est parti, et on le repercute — la
 * boutique doit savoir quand appeler le client parce que le message n'a pas
 * pu etre remis.
 */

const CRENEAUX = ["Matin", "Apres-midi"] as const;

const COULEUR_STATUT: Record<Statut, string> = {
  en_attente: "border-[#FF0080] text-[#FF0080]",
  confirmee: "border-emerald-500 text-emerald-400",
  annulee: "border-gray-600 text-gray-500",
};

function dateFr(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function CarteDemande({ demande }: { demande: Demande }) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [retour, setRetour] = useState<string | null>(null);

  // Pre-rempli avec le souhait du client : dans la plupart des cas la boutique
  // confirme ce qui a ete demande, et n'a qu'a valider.
  const [date, setDate] = useState(
    demande.origine === "ecole" ? demande.date_confirmee ?? demande.date_souhaitee ?? "" : ""
  );
  const [creneau, setCreneau] = useState(
    demande.origine === "ecole" ? demande.creneau_confirme ?? demande.creneau ?? "" : ""
  );

  const traiter = async (statut: Statut) => {
    if (statut === "annulee" && !confirm("Annuler cette demande et prevenir le client ?")) return;
    setEnCours(true);
    setRetour(null);
    try {
      const res = await fetch("/api/admin/demandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origine: demande.origine,
          id: demande.id,
          statut,
          ...(demande.origine === "ecole" && statut === "confirmee"
            ? { date_confirmee: date, creneau_confirme: creneau }
            : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setRetour(json.error ?? "Echec");
        return;
      }
      setRetour(
        json.courriel === "echec"
          ? "Enregistre, mais le courriel n'est pas parti — prevenez le client."
          : json.courriel === "aucun"
            ? "Remis en attente."
            : "Enregistre, client prevenu."
      );
      router.refresh();
    } catch {
      setRetour("Echec reseau.");
    } finally {
      setEnCours(false);
    }
  };

  const attente = demande.statut === "en_attente";

  return (
    <article className="border border-gray-800 bg-gray-950 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-white text-lg" style={{ fontFamily: "var(--font-cormorant)" }}>
            {demande.prenom} {demande.nom}
          </p>
          <p className="text-gray-500 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>
            {dateFr(demande.created_at)} &middot;{" "}
            <a href={`mailto:${demande.email}`} className="hover:text-white transition-colors">
              {demande.email}
            </a>
            {demande.telephone ? (
              <>
                {" "}&middot;{" "}
                <a href={`tel:${demande.telephone}`} className="hover:text-white transition-colors">
                  {demande.telephone}
                </a>
              </>
            ) : null}
          </p>
        </div>
        <span
          className={`shrink-0 border px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] ${COULEUR_STATUT[demande.statut]}`}
          style={{ fontFamily: "Mirloanne, serif" }}
        >
          {demande.origine === "ecole" ? "Cours" : "Boutique"} &middot; {LIBELLE_STATUT[demande.statut]}
        </span>
      </div>

      {demande.origine === "ecole" ? (
        <div className="mb-4 space-y-1 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>
          <p className="text-gray-300">
            {demande.discipline} — {demande.prestation}
            {demande.niveau ? <span className="text-gray-500"> ({demande.niveau})</span> : null}
          </p>
          <p className="text-gray-500">
            Souhait : {dateFr(demande.date_souhaitee)}
            {demande.creneau ? `, ${demande.creneau.toLowerCase()}` : ""}
          </p>
          {demande.message ? <p className="text-gray-400 italic">« {demande.message} »</p> : null}
        </div>
      ) : (
        <div className="mb-4 space-y-1 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>
          {demande.articles.split("\n").filter(Boolean).map((a) => (
            <p key={a} className="text-gray-300">{a}</p>
          ))}
          <p className="text-gray-500">
            Retrait souhaite : {dateFr(demande.date_retrait)}
            {demande.creneau ? `, ${demande.creneau.toLowerCase()}` : ""}
          </p>
        </div>
      )}

      {/* Date et creneau retenus. Modifiables meme apres confirmation : c'est
          ainsi qu'on reprogramme, et le client est alors prevenu du changement. */}
      {demande.origine === "ecole" && demande.statut !== "annulee" && (
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.15em] text-gray-500" style={{ fontFamily: "Mirloanne, serif" }}>
              Date retenue
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-700 bg-black px-3 py-2 text-sm text-white"
              style={{ fontFamily: "var(--font-cormorant)" }}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.15em] text-gray-500" style={{ fontFamily: "Mirloanne, serif" }}>
              Creneau
            </span>
            <select
              value={creneau}
              onChange={(e) => setCreneau(e.target.value)}
              className="border border-gray-700 bg-black px-3 py-2 text-sm text-white"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              <option value="">—</option>
              {CRENEAUX.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => traiter("confirmee")}
          disabled={enCours || (demande.origine === "ecole" && !date)}
          className="min-h-[40px] border border-white px-5 py-2 text-xs uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-white"
          style={{ fontFamily: "Mirloanne, serif" }}
        >
          {demande.statut === "confirmee"
            ? demande.origine === "ecole"
              ? "Reprogrammer"
              : "Renvoyer l'avis"
            : demande.origine === "ecole"
              ? "Confirmer le cours"
              : "Commande prete"}
        </button>

        {demande.statut !== "annulee" && (
          <button
            onClick={() => traiter("annulee")}
            disabled={enCours}
            className="min-h-[40px] border border-gray-700 px-5 py-2 text-xs uppercase tracking-widest text-gray-400 transition-colors hover:border-red-500 hover:text-red-400 disabled:opacity-40"
            style={{ fontFamily: "Mirloanne, serif" }}
          >
            Annuler
          </button>
        )}

        {!attente && (
          <button
            onClick={() => traiter("en_attente")}
            disabled={enCours}
            className="min-h-[40px] px-2 py-2 text-xs uppercase tracking-widest text-gray-600 transition-colors hover:text-gray-300 disabled:opacity-40"
            style={{ fontFamily: "Mirloanne, serif" }}
            title="Correction interne, sans courriel au client"
          >
            Remettre en attente
          </button>
        )}

        {retour && (
          <p className="text-sm text-gray-400" style={{ fontFamily: "var(--font-cormorant)" }}>
            {retour}
          </p>
        )}
      </div>
    </article>
  );
}
