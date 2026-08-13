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
