"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type WCCategory = { id: number; name: string; slug: string; parent: number };
type Variation = {
  id?: number;
  attributes: { name: string; option: string }[];
  regular_price: string;
  sale_price: string;
  stock_status: string;
  stock_quantity: string;
  image?: { id?: number; src: string } | null;
};

type ProductData = {
  id?: number;
  name: string;
  status: "publish" | "draft";
  type: "simple" | "variable";
  description: string;
  short_description: string;
  regular_price: string;
  sale_price: string;
  stock_status: string;
  stock_quantity: string;
  manage_stock: boolean;
  categories: { id: number }[];
  images: { id?: number; src: string; alt: string }[];
  attributes: { name: string; variation: boolean; visible: boolean; options: string[] }[];
};

function decodeHTML(str: string) {
  return str.replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"');
}

const inputCls = "w-full bg-gray-900 border border-gray-800 text-white px-4 py-3 focus:outline-none focus:border-[#FF0080] transition-colors text-sm";
const labelCls = "block text-xs uppercase tracking-widest text-gray-500 mb-2";

export default function ProductForm({ productId }: { productId?: number }) {
  const router = useRouter();
  const isEdit = !!productId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<WCCategory[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const varFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [form, setForm] = useState<ProductData>({
    name: "",
    status: "publish",
    type: "simple",
    description: "",
    short_description: "",
    regular_price: "",
    sale_price: "",
    stock_status: "instock",
    stock_quantity: "",
    manage_stock: false,
    categories: [],
    images: [],
    attributes: [],
  });

  useEffect(() => {
    fetch("/api/admin/categories").then(r => r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    Promise.all([
      fetch(`/api/admin/products/${productId}`).then(r => r.json()),
      fetch(`/api/admin/products/${productId}/variations`).then(r => r.json()),
    ]).then(([product, vars]) => {
      setForm({
        name: product.name ?? "",
        status: product.status ?? "publish",
        type: product.type ?? "simple",
        description: product.description ?? "",
        short_description: product.short_description ?? "",
        regular_price: product.regular_price ?? "",
        sale_price: product.sale_price ?? "",
        stock_status: product.stock_status ?? "instock",
        stock_quantity: product.stock_quantity != null ? String(product.stock_quantity) : "",
        manage_stock: product.manage_stock ?? false,
        categories: (product.categories ?? []).map((c: { id: number }) => ({ id: c.id })),
        images: product.images ?? [],
        attributes: (product.attributes ?? []).map((a: { name: string; variation: boolean; visible: boolean; options: string[] }) => ({
          name: a.name, variation: a.variation, visible: a.visible ?? true, options: a.options ?? [],
        })),
      });
      if (Array.isArray(vars)) {
        setVariations(vars.map((v: { id: number; attributes: { name: string; option: string }[]; regular_price: string; sale_price: string; stock_status: string; stock_quantity: number | null; image: { src: string } | null }) => ({
          id: v.id,
          attributes: v.attributes ?? [],
          regular_price: v.regular_price ?? "",
          sale_price: v.sale_price ?? "",
          stock_status: v.stock_status ?? "instock",
          stock_quantity: v.stock_quantity != null ? String(v.stock_quantity) : "",
          image: v.image ?? null,
        })));
      }
      setLoading(false);
    });
  }, [isEdit, productId]);

  const set = (key: keyof ProductData, value: unknown) => setForm(f => ({ ...f, [key]: value }));

  const toggleCategory = (id: number) => {
    const exists = form.categories.some(c => c.id === id);
    set("categories", exists ? form.categories.filter(c => c.id !== id) : [...form.categories, { id }]);
  };

  const uploadImage = async (file: File): Promise<{ id?: number; src: string; alt: string } | null> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/media", { method: "POST", body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return { id: data.id, src: data.src, alt: data.alt ?? "" };
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const uploaded = await Promise.all(Array.from(files).map(uploadImage));
    const valid = uploaded.filter(Boolean) as { id?: number; src: string; alt: string }[];
    set("images", [...form.images, ...valid]);
    setUploading(false);
  };

  const removeImage = (idx: number) => set("images", form.images.filter((_, i) => i !== idx));

  const addAttribute = () => set("attributes", [...form.attributes, { name: "", variation: true, visible: true, options: [] }]);
  const updateAttribute = (idx: number, key: string, value: unknown) => {
    const updated = form.attributes.map((a, i) => i === idx ? { ...a, [key]: value } : a);
    set("attributes", updated);
  };
  const removeAttribute = (idx: number) => set("attributes", form.attributes.filter((_, i) => i !== idx));

  const addVariation = () => {
    const defaultAttrs = form.attributes.filter(a => a.variation).map(a => ({ name: a.name, option: a.options[0] ?? "" }));
    setVariations(v => [...v, { attributes: defaultAttrs, regular_price: "", sale_price: "", stock_status: "instock", stock_quantity: "" }]);
  };
  const updateVariation = (idx: number, key: string, value: unknown) => {
    setVariations(v => v.map((vi, i) => i === idx ? { ...vi, [key]: value } : vi));
  };
  const removeVariation = (idx: number) => setVariations(v => v.filter((_, i) => i !== idx));

  const handleVariationImage = async (idx: number, files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const img = await uploadImage(files[0]);
    if (img) updateVariation(idx, "image", { id: img.id, src: img.src });
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload: Record<string, unknown> = {
      name: form.name,
      status: form.status,
      type: form.type,
      description: form.description,
      short_description: form.short_description,
      categories: form.categories,
      images: form.images.map(img => img.id ? { id: img.id, src: img.src, alt: img.alt } : { src: img.src, alt: img.alt }),
    };

    if (form.type === "simple") {
      payload.regular_price = form.regular_price;
      payload.sale_price = form.sale_price;
      payload.stock_status = form.stock_status;
      payload.manage_stock = form.manage_stock;
      if (form.manage_stock) payload.stock_quantity = form.stock_quantity ? Number(form.stock_quantity) : null;
    } else {
      payload.attributes = form.attributes.map(a => ({
        name: a.name,
        variation: a.variation,
        visible: a.visible,
        options: a.options,
      }));
    }

    const url = isEdit ? `/api/admin/products/${productId}` : "/api/admin/products";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const saved = await res.json();

    if (!res.ok) {
      setError(saved.message ?? "Erreur lors de la sauvegarde");
      setSaving(false);
      return;
    }

    const pid = saved.id ?? productId;

    if (form.type === "variable" && pid) {
      for (const v of variations) {
        const varPayload = {
          attributes: v.attributes,
          regular_price: v.regular_price,
          sale_price: v.sale_price,
          stock_status: v.stock_status,
          manage_stock: !!v.stock_quantity,
          stock_quantity: v.stock_quantity ? Number(v.stock_quantity) : null,
          ...(v.image ? { image: v.image } : {}),
        };
        if (v.id) {
          await fetch(`/api/admin/products/${pid}/variations/${v.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(varPayload),
          });
        } else {
          await fetch(`/api/admin/products/${pid}/variations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(varPayload),
          });
        }
      }
    }

    router.push("/admin/products");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-6 h-6 border-2 border-[#FF0080] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const topCats = categories.filter(c => c.parent === 0);
  const childrenOf = (id: number) => categories.filter(c => c.parent === id);

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-6 py-10 space-y-10">

      {/* Infos générales */}
      <section className="space-y-5">
        <h2 className="text-xs uppercase tracking-widest text-[#FF0080] mb-4" style={{ fontFamily: "Mirloanne, serif" }}>
          Informations generales
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Nom du produit *</label>
            <input required value={form.name} onChange={e => set("name", e.target.value)} className={inputCls} style={{ fontFamily: "var(--font-cormorant)" }} />
          </div>
          <div>
            <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Statut</label>
            <select value={form.status} onChange={e => set("status", e.target.value)} className={inputCls} style={{ fontFamily: "var(--font-cormorant)" }}>
              <option value="publish">Publie</option>
              <option value="draft">Brouillon</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Type</label>
            <select value={form.type} onChange={e => set("type", e.target.value)} className={inputCls} style={{ fontFamily: "var(--font-cormorant)" }}>
              <option value="simple">Simple</option>
              <option value="variable">Variable (tailles, couleurs...)</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Description courte</label>
          <textarea rows={3} value={form.short_description} onChange={e => set("short_description", e.target.value)} className={`${inputCls} resize-none`} style={{ fontFamily: "var(--font-cormorant)" }} />
        </div>

        <div>
          <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Description complete</label>
          <textarea rows={6} value={form.description} onChange={e => set("description", e.target.value)} className={`${inputCls} resize-none`} style={{ fontFamily: "var(--font-cormorant)" }} />
        </div>
      </section>

      {/* Images */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-[#FF0080] mb-4" style={{ fontFamily: "Mirloanne, serif" }}>
          Images
        </h2>
        <div className="flex flex-wrap gap-3 mb-4">
          {form.images.map((img, i) => (
            <div key={i} className="relative w-20 h-20 bg-gray-900 overflow-hidden group">
              <Image src={img.src} alt={img.alt} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
              {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-[#FF0080]/80 text-white text-[9px] text-center py-0.5" style={{ fontFamily: "Mirloanne, serif" }}>Principale</span>}
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 border-2 border-dashed border-gray-700 hover:border-[#FF0080] text-gray-600 hover:text-[#FF0080] flex items-center justify-center text-2xl transition-colors disabled:opacity-40"
          >
            {uploading ? <span className="w-5 h-5 border-2 border-[#FF0080] border-t-transparent rounded-full animate-spin" /> : "+"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleImageUpload(e.target.files)} />
        </div>
        <p className="text-gray-600 text-xs" style={{ fontFamily: "var(--font-cormorant)" }}>La premiere image sera l'image principale. Faites glisser pour reordonner.</p>
      </section>

      {/* Prix & stock (simple) */}
      {form.type === "simple" && (
        <section>
          <h2 className="text-xs uppercase tracking-widest text-[#FF0080] mb-4" style={{ fontFamily: "Mirloanne, serif" }}>
            Prix & stock
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Prix normal (€)</label>
              <input type="text" value={form.regular_price} onChange={e => set("regular_price", e.target.value)} className={inputCls} placeholder="0.00" style={{ fontFamily: "var(--font-cormorant)" }} />
            </div>
            <div>
              <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Prix promo (€)</label>
              <input type="text" value={form.sale_price} onChange={e => set("sale_price", e.target.value)} className={inputCls} placeholder="Laisser vide si aucune promo" style={{ fontFamily: "var(--font-cormorant)" }} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Statut stock</label>
              <select value={form.stock_status} onChange={e => set("stock_status", e.target.value)} className={inputCls} style={{ fontFamily: "var(--font-cormorant)" }}>
                <option value="instock">En stock</option>
                <option value="outofstock">Rupture de stock</option>
                <option value="onbackorder">Sur commande</option>
              </select>
            </div>
            <div>
              <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Quantite en stock</label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.manage_stock}
                  onChange={e => set("manage_stock", e.target.checked)}
                  className="accent-[#FF0080]"
                  id="manage_stock"
                />
                <label htmlFor="manage_stock" className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>Gerer le stock</label>
                {form.manage_stock && (
                  <input type="number" value={form.stock_quantity} onChange={e => set("stock_quantity", e.target.value)} className="bg-gray-900 border border-gray-800 text-white px-3 py-2 w-24 focus:outline-none focus:border-[#FF0080] text-sm" style={{ fontFamily: "var(--font-cormorant)" }} placeholder="Qte" />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Attributs + variantes (variable) */}
      {form.type === "variable" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-[#FF0080] mb-4" style={{ fontFamily: "Mirloanne, serif" }}>
              Attributs
            </h2>
            {form.attributes.map((attr, idx) => (
              <div key={idx} className="bg-gray-900 border border-gray-800 p-4 mb-3 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Nom (ex: Taille, Couleur)</label>
                    <input value={attr.name} onChange={e => updateAttribute(idx, "name", e.target.value)} className={inputCls} style={{ fontFamily: "var(--font-cormorant)" }} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Options (separees par virgule)</label>
                    <input
                      value={attr.options.join(", ")}
                      onChange={e => updateAttribute(idx, "options", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                      className={inputCls}
                      placeholder="XS, S, M, L, XL"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer" style={{ fontFamily: "var(--font-cormorant)" }}>
                    <input type="checkbox" checked={attr.variation} onChange={e => updateAttribute(idx, "variation", e.target.checked)} className="accent-[#FF0080]" />
                    Utilise pour les variantes
                  </label>
                  <button type="button" onClick={() => removeAttribute(idx)} className="text-red-500 text-xs uppercase tracking-widest hover:text-red-400" style={{ fontFamily: "Mirloanne, serif" }}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addAttribute} className="text-xs uppercase tracking-widest text-gray-400 hover:text-white border border-gray-700 px-4 py-2 hover:border-gray-400 transition-colors" style={{ fontFamily: "Mirloanne, serif" }}>
              + Ajouter un attribut
            </button>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-widest text-[#FF0080] mb-4" style={{ fontFamily: "Mirloanne, serif" }}>
              Variantes
            </h2>
            {variations.map((v, idx) => (
              <div key={idx} className="bg-gray-900 border border-gray-800 p-4 mb-3 space-y-3">
                {/* Attributs de la variante */}
                <div className="flex flex-wrap gap-3">
                  {form.attributes.filter(a => a.variation).map((attr) => {
                    const current = v.attributes.find(va => va.name === attr.name)?.option ?? "";
                    return (
                      <div key={attr.name}>
                        <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>{attr.name}</label>
                        <select
                          value={current}
                          onChange={e => {
                            const newAttrs = v.attributes.filter(va => va.name !== attr.name);
                            newAttrs.push({ name: attr.name, option: e.target.value });
                            updateVariation(idx, "attributes", newAttrs);
                          }}
                          className="bg-gray-800 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#FF0080]"
                          style={{ fontFamily: "var(--font-cormorant)" }}
                        >
                          <option value="">— Choisir —</option>
                          {attr.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    );
                  })}
                </div>

                {/* Prix + stock */}
                <div className="grid sm:grid-cols-4 gap-3">
                  <div>
                    <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Prix normal (€)</label>
                    <input type="text" value={v.regular_price} onChange={e => updateVariation(idx, "regular_price", e.target.value)} className={inputCls} placeholder="0.00" style={{ fontFamily: "var(--font-cormorant)" }} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Prix promo (€)</label>
                    <input type="text" value={v.sale_price} onChange={e => updateVariation(idx, "sale_price", e.target.value)} className={inputCls} style={{ fontFamily: "var(--font-cormorant)" }} />
                  </div>
                  <div>
                    <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Stock</label>
                    <select value={v.stock_status} onChange={e => updateVariation(idx, "stock_status", e.target.value)} className={inputCls} style={{ fontFamily: "var(--font-cormorant)" }}>
                      <option value="instock">En stock</option>
                      <option value="outofstock">Rupture</option>
                      <option value="onbackorder">Sur commande</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} style={{ fontFamily: "Mirloanne, serif" }}>Quantite</label>
                    <input type="number" value={v.stock_quantity} onChange={e => updateVariation(idx, "stock_quantity", e.target.value)} className={inputCls} placeholder="—" style={{ fontFamily: "var(--font-cormorant)" }} />
                  </div>
                </div>

                {/* Image variante */}
                <div className="flex items-center gap-4">
                  {v.image?.src && (
                    <div className="relative w-14 h-14 bg-gray-800 overflow-hidden">
                      <Image src={v.image.src} alt="" fill className="object-cover" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => varFileRefs.current[idx]?.click()}
                    className="text-xs uppercase tracking-widest text-gray-500 hover:text-white border border-gray-700 px-3 py-1.5 hover:border-gray-400 transition-colors"
                    style={{ fontFamily: "Mirloanne, serif" }}
                  >
                    {v.image?.src ? "Changer l'image" : "Ajouter une image"}
                  </button>
                  <input
                    ref={el => { varFileRefs.current[idx] = el; }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleVariationImage(idx, e.target.files)}
                  />
                  <button type="button" onClick={() => removeVariation(idx)} className="text-red-500 text-xs uppercase tracking-widest hover:text-red-400 ml-auto" style={{ fontFamily: "Mirloanne, serif" }}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addVariation} className="text-xs uppercase tracking-widest text-gray-400 hover:text-white border border-gray-700 px-4 py-2 hover:border-gray-400 transition-colors" style={{ fontFamily: "Mirloanne, serif" }}>
              + Ajouter une variante
            </button>
          </div>
        </section>
      )}

      {/* Categories */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-[#FF0080] mb-4" style={{ fontFamily: "Mirloanne, serif" }}>
          Categories
        </h2>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1">
          {topCats.map(cat => (
            <div key={cat.id}>
              <label className="flex items-center gap-2 py-1 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.categories.some(c => c.id === cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="accent-[#FF0080]"
                />
                <span className="text-gray-300 text-sm font-medium" style={{ fontFamily: "var(--font-cormorant)" }}>
                  {decodeHTML(cat.name)}
                </span>
              </label>
              {childrenOf(cat.id).map(child => (
                <label key={child.id} className="flex items-center gap-2 py-1 pl-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.categories.some(c => c.id === child.id)}
                    onChange={() => toggleCategory(child.id)}
                    className="accent-[#FF0080]"
                  />
                  <span className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>
                    {decodeHTML(child.name)}
                  </span>
                </label>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Erreur + submit */}
      {error && <p className="text-red-400 text-sm" style={{ fontFamily: "var(--font-cormorant)" }}>{error}</p>}

      <div className="flex items-center gap-4 pb-10">
        <button
          type="submit"
          disabled={saving || uploading}
          className="bg-[#FF0080] text-white uppercase tracking-widest text-sm px-10 py-4 hover:bg-[#d60070] transition-colors disabled:opacity-50"
          style={{ fontFamily: "Mirloanne, serif" }}
        >
          {saving ? "Sauvegarde..." : isEdit ? "Enregistrer les modifications" : "Creer le produit"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")} className="text-gray-500 text-sm hover:text-white transition-colors uppercase tracking-widest" style={{ fontFamily: "Mirloanne, serif" }}>
          Annuler
        </button>
      </div>

    </form>
  );
}
