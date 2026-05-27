"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Mot de passe incorrect");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <Image src="/logo-airfly.webp" alt="Airfly" width={80} height={32} className="object-contain" />
        </div>

        <p className="text-center text-gray-500 text-xs uppercase tracking-widest mb-8" style={{ fontFamily: "Mirloanne, serif" }}>
          Back office
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 focus:outline-none focus:border-[#FF0080] transition-colors"
            style={{ fontFamily: "var(--font-cormorant)" }}
            autoFocus
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF0080] text-white uppercase tracking-widest text-sm py-3 hover:bg-[#d60070] transition-colors disabled:opacity-50"
            style={{ fontFamily: "Mirloanne, serif" }}
          >
            {loading ? "..." : "Connexion"}
          </button>
        </form>
      </div>
    </div>
  );
}
