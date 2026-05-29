"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

const inputCls = "w-full border border-gray-200 bg-[#f5f0e8] px-4 py-2.5 text-gray-900 focus:outline-none focus:border-[#FF0080] transition-colors text-sm";
const labelCls = "block text-xs uppercase tracking-widest text-gray-500 mb-1.5";

export default function CartDrawer() {
  const { items, remove, updateQty, clear, drawerOpen, setDrawerOpen } = useCart();

  const [step, setStep] = useState<"cart" | "form">("cart");
  const [formData, setFormData] = useState({ prenom: "", nom: "", email: "", telephone: "", date_retrait: "", creneau: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setDrawerOpen(false);
    setTimeout(() => { setStep("cart"); setSuccess(false); setError(""); }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/shop/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, items }),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
      clear();
    } catch {
      setError("Une erreur est survenue, veuillez reessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[150]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-[160] flex flex-col shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <p className="text-xs uppercase tracking-widest text-gray-900" style={{ fontFamily: "Mirloanne, serif" }}>
                {step === "cart" ? `Panier${items.length > 0 ? ` (${items.reduce((a, i) => a + i.qty, 0)})` : ""}` : "Informations de retrait"}
              </p>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-900 text-xl leading-none">×</button>
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto">

              {/* STEP 1 — Panier */}
              {step === "cart" && (
                <>
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
                      <p className="text-gray-400 text-base" style={{ fontFamily: "var(--font-cormorant)" }}>
                        Votre panier est vide.
                      </p>
                    </div>
                  ) : (
                    <div className="px-6 py-4 space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-4 py-4 border-b border-gray-100">
                          {/* Image */}
                          <div className="relative w-16 h-20 bg-gray-100 shrink-0 overflow-hidden">
                            {item.image ? (
                              <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                            ) : (
                              <div className="w-full h-full bg-gray-200" />
                            )}
                          </div>

                          {/* Infos */}
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 text-sm leading-snug" style={{ fontFamily: "var(--font-cormorant)" }}>
                              {item.name}
                            </p>
                            {item.variante && (
                              <p className="text-gray-400 text-xs mt-0.5" style={{ fontFamily: "var(--font-cormorant)" }}>
                                {item.variante}
                              </p>
                            )}

                            {/* Quantité */}
                            <div className="flex items-center gap-2 mt-3">
                              <button
                                onClick={() => updateQty(item.id, item.qty - 1)}
                                className="w-7 h-7 border border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 flex items-center justify-center text-sm transition-colors"
                              >
                                −
                              </button>
                              <span className="text-sm w-5 text-center" style={{ fontFamily: "var(--font-cormorant)" }}>
                                {item.qty}
                              </span>
                              <button
                                onClick={() => updateQty(item.id, item.qty + 1)}
                                className="w-7 h-7 border border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 flex items-center justify-center text-sm transition-colors"
                              >
                                +
                              </button>
                              <button
                                onClick={() => remove(item.id)}
                                className="ml-auto text-gray-300 hover:text-red-400 transition-colors text-xs uppercase tracking-widest"
                                style={{ fontFamily: "Mirloanne, serif" }}
                              >
                                Retirer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* STEP 2 — Formulaire */}
              {step === "form" && !success && (
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                  {/* Recap panier */}
                  <div className="bg-[#f5f0e8] px-4 py-3 mb-2 space-y-1">
                    {items.map((item) => (
                      <p key={item.id} className="text-gray-700 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>
                        {item.qty}× {item.name}{item.variante ? ` — ${item.variante}` : ""}
                      </p>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Prenom *</label>
                      <input required value={formData.prenom} onChange={e => setFormData(f => ({ ...f, prenom: e.target.value }))} className={inputCls} style={{ fontFamily: "var(--font-cormorant)" }} />
                    </div>
                    <div>
                      <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Nom *</label>
                      <input required value={formData.nom} onChange={e => setFormData(f => ({ ...f, nom: e.target.value }))} className={inputCls} style={{ fontFamily: "var(--font-cormorant)" }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Email *</label>
                      <input required type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} className={inputCls} style={{ fontFamily: "var(--font-cormorant)" }} />
                    </div>
                    <div>
                      <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Telephone</label>
                      <input type="tel" value={formData.telephone} onChange={e => setFormData(f => ({ ...f, telephone: e.target.value }))} className={inputCls} style={{ fontFamily: "var(--font-cormorant)" }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Date souhaitee</label>
                      <input type="date" value={formData.date_retrait} onChange={e => setFormData(f => ({ ...f, date_retrait: e.target.value }))} className={inputCls} style={{ fontFamily: "var(--font-cormorant)" }} />
                    </div>
                    <div>
                      <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Creneau</label>
                      <div className="flex h-[42px]">
                        {(["Matin", "Apres-midi"] as const).map((slot) => (
                          <label
                            key={slot}
                            className="flex-1 flex items-center justify-center border border-gray-200 bg-[#f5f0e8] cursor-pointer text-xs text-gray-700 transition-colors duration-200 has-[:checked]:bg-gray-900 has-[:checked]:text-white has-[:checked]:border-gray-900 first:border-r-0"
                            style={{ fontFamily: "var(--font-cormorant)" }}
                          >
                            <input type="radio" name="creneau_retrait" value={slot} className="sr-only" onChange={() => setFormData(f => ({ ...f, creneau: slot }))} />
                            {slot}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 text-white uppercase tracking-widest text-sm py-4 hover:bg-[#FF0080] transition-colors disabled:opacity-50 mt-2"
                    style={{ fontFamily: "Mirloanne, serif" }}
                  >
                    {loading ? "Envoi..." : "Confirmer la reservation"}
                  </button>

                  <p className="text-center text-gray-400 text-xs pb-2" style={{ fontFamily: "var(--font-cormorant)" }}>
                    Sans prepaiement — nous confirmons la disponibilite par retour.
                  </p>
                </form>
              )}

              {/* Succès */}
              {success && (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-4">
                  <p className="text-[#FF0080] text-4xl">◆</p>
                  <p className="text-gray-900 text-lg uppercase tracking-widest" style={{ fontFamily: "Mirloanne, serif" }}>
                    Reservation enregistree !
                  </p>
                  <p className="text-gray-500" style={{ fontFamily: "var(--font-cormorant)" }}>
                    On vous confirme la disponibilite et le creneau de retrait tres prochainement.
                  </p>
                  <button onClick={handleClose} className="mt-4 text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors border-b border-gray-300" style={{ fontFamily: "Mirloanne, serif" }}>
                    Fermer
                  </button>
                </div>
              )}
            </div>

            {/* Footer — actions */}
            {!success && (
              <div className="border-t border-gray-100 px-6 py-5">
                {step === "cart" ? (
                  <button
                    onClick={() => setStep("form")}
                    disabled={items.length === 0}
                    className="w-full bg-gray-900 text-white uppercase tracking-widest text-sm py-4 hover:bg-[#FF0080] transition-colors disabled:opacity-40"
                    style={{ fontFamily: "Mirloanne, serif" }}
                  >
                    Reserver — Click & Collect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStep("cart")}
                    className="text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                    style={{ fontFamily: "Mirloanne, serif" }}
                  >
                    ← Retour au panier
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
