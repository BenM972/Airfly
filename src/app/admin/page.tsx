import Link from "next/link";
import Image from "next/image";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import { partners } from "@/data/partners";
import { getPartnerClickStats } from "@/lib/partnerClicks";

// Le tableau de bord lit des compteurs qui changent en continu : il doit etre
// rendu a chaque requete. Sans cette directive Next le prerend au build et les
// chiffres restent figes a la valeur du dernier deploiement.
export const dynamic = "force-dynamic";

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
