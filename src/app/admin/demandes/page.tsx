import Link from "next/link";
import { getDemandes } from "@/lib/demandes";
import CarteDemande from "@/components/admin/CarteDemande";

/**
 * Les demandes recues, cours et boutique confondus.
 *
 * `force-dynamic` : les compteurs et la liste doivent refleter l'etat au
 * moment de la visite. Prerendue, la page afficherait ce qu'il y avait au
 * build — c'est le defaut qui avait fige les compteurs de la page d'accueil du
 * back office.
 */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Demandes",
  robots: { index: false, follow: false },
};

export default async function DemandesPage() {
  const { demandes, partiel } = await getDemandes();

  const enAttente = demandes.filter((d) => d.statut === "en_attente");
  const traitees = demandes.filter((d) => d.statut !== "en_attente");

  return (
    <main className="min-h-screen bg-black px-6 py-16 md:px-12">
      <div className="mx-auto max-w-4xl">

        <Link
          href="/admin"
          className="mb-8 inline-block text-xs uppercase tracking-widest text-gray-500 transition-colors hover:text-white"
          style={{ fontFamily: "Mirloanne, serif" }}
        >
          &larr; Back office
        </Link>

        <h1 className="mb-2 text-2xl uppercase tracking-widest text-white" style={{ fontFamily: "Mirloanne, serif" }}>
          Demandes
        </h1>
        <p className="mb-10 text-gray-500" style={{ fontFamily: "var(--font-cormorant)" }}>
          {enAttente.length === 0
            ? "Aucune demande en attente."
            : `${enAttente.length} demande${enAttente.length > 1 ? "s" : ""} en attente de reponse.`}
        </p>

        {/* Une lecture partielle se dit : sans ce message, une liste tronquee
            par une panne passerait pour une liste complete. */}
        {partiel && (
          <p
            className="mb-8 border border-[#FF0080]/40 bg-[#FF0080]/10 px-4 py-3 text-sm text-[#FF0080]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Une des deux sources n&apos;a pas repondu : cette liste est incomplete.
          </p>
        )}

        {enAttente.length > 0 && (
          <section className="mb-14">
            <p
              className="mb-4 text-xs uppercase tracking-[0.2em] text-[#FF0080]"
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              A traiter
            </p>
            <div className="space-y-4">
              {enAttente.map((d) => (
                <CarteDemande key={`${d.origine}-${d.id}`} demande={d} />
              ))}
            </div>
          </section>
        )}

        {traitees.length > 0 && (
          <section>
            <p
              className="mb-4 text-xs uppercase tracking-[0.2em] text-gray-500"
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              Traitees
            </p>
            <div className="space-y-4">
              {traitees.map((d) => (
                <CarteDemande key={`${d.origine}-${d.id}`} demande={d} />
              ))}
            </div>
          </section>
        )}

        {demandes.length === 0 && !partiel && (
          <p className="text-gray-600" style={{ fontFamily: "var(--font-cormorant)" }}>
            Aucune demande enregistree pour l&apos;instant.
          </p>
        )}

      </div>
    </main>
  );
}
