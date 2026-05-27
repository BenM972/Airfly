"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  status: string;
  type: string;
  price: string;
  stock_status: string;
  stock_quantity: number | null;
  images: { src: string }[];
  categories: { name: string }[];
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<number | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: "20" });
    if (query) params.set("search", query);
    const res = await fetch(`/api/admin/products?${params}`);
    const data = await res.json();
    setProducts(data.products ?? []);
    setTotal(data.total ?? 0);
    setTotalPages(data.totalPages ?? 1);
    setLoading(false);
  }, [page, query]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Supprimer "${name}" définitivement ?`)) return;
    setDeleting(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    await load();
    setDeleting(null);
  };

  const logout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Image src="/logo-airfly.webp" alt="Airfly" width={60} height={24} className="object-contain" />
          </Link>
          <span className="text-gray-600 text-xs uppercase tracking-widest" style={{ fontFamily: "Mirloanne, serif" }}>
            Produits
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/admin/products/new"
            className="bg-[#FF0080] text-white uppercase tracking-widest text-xs px-5 py-2 hover:bg-[#d60070] transition-colors"
            style={{ fontFamily: "Mirloanne, serif" }}
          >
            + Nouveau
          </Link>
          <button onClick={logout} className="text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors" style={{ fontFamily: "Mirloanne, serif" }}>
            Deconnexion
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>
            {total} produit{total > 1 ? "s" : ""}
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="bg-gray-900 border border-gray-800 text-white px-4 py-2 text-sm focus:outline-none focus:border-[#FF0080] transition-colors w-56"
              style={{ fontFamily: "var(--font-cormorant)" }}
            />
            <button type="submit" className="bg-gray-800 text-gray-300 px-4 py-2 text-xs uppercase tracking-widest hover:bg-gray-700 transition-colors" style={{ fontFamily: "Mirloanne, serif" }}>
              Chercher
            </button>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-6 h-6 border-2 border-[#FF0080] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="border border-gray-800">
            {products.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-900/50 transition-colors ${i > 0 ? "border-t border-gray-800" : ""}`}
              >
                {/* Image */}
                <div className="w-12 h-12 bg-gray-900 shrink-0 overflow-hidden">
                  {p.images[0] ? (
                    <Image src={p.images[0].src} alt={p.name} width={48} height={48} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">—</div>
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate" style={{ fontFamily: "var(--font-cormorant)" }}>{p.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={`text-xs ${p.status === "publish" ? "text-green-500" : "text-yellow-500"}`} style={{ fontFamily: "Mirloanne, serif" }}>
                      {p.status === "publish" ? "Publie" : "Brouillon"}
                    </span>
                    <span className="text-gray-600 text-xs" style={{ fontFamily: "var(--font-cormorant)" }}>
                      {p.type === "variable" ? "Variable" : "Simple"}
                    </span>
                    {p.categories.length > 0 && (
                      <span className="text-gray-600 text-xs" style={{ fontFamily: "var(--font-cormorant)" }}>
                        {p.categories.map(c => c.name).join(", ")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock */}
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>
                    {p.price ? `${p.price} €` : "—"}
                  </p>
                  <p className={`text-xs mt-0.5 ${p.stock_status === "instock" ? "text-green-600" : "text-red-500"}`} style={{ fontFamily: "Mirloanne, serif" }}>
                    {p.stock_status === "instock" ? "En stock" : "Rupture"}
                    {p.stock_quantity !== null ? ` (${p.stock_quantity})` : ""}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors px-3 py-1.5 border border-gray-700 hover:border-gray-400"
                    style={{ fontFamily: "Mirloanne, serif" }}
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    disabled={deleting === p.id}
                    className="text-xs uppercase tracking-widest text-gray-600 hover:text-red-400 transition-colors px-3 py-1.5 border border-gray-800 hover:border-red-800 disabled:opacity-40"
                    style={{ fontFamily: "Mirloanne, serif" }}
                  >
                    {deleting === p.id ? "..." : "Supprimer"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 text-sm transition-colors ${page === p ? "bg-[#FF0080] text-white" : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"}`}
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
