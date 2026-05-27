"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

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
        <button
          onClick={logout}
          className="text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors"
          style={{ fontFamily: "Mirloanne, serif" }}
        >
          Deconnexion
        </button>
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
        </div>
      </main>
    </div>
  );
}
