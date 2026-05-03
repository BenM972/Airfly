"use client";

import type { WCProduct, WCVariation } from "./ShopCatalogue";

// Couleurs connues → code hex pour affichage swatch
const COLOR_MAP: Record<string, string> = {
  noir: "#1a1a1a", black: "#1a1a1a",
  blanc: "#f5f5f5", white: "#f5f5f5",
  rouge: "#e02020", red: "#e02020",
  rose: "#FF0080", pink: "#FF0080",
  bleu: "#2563eb", blue: "#2563eb",
  vert: "#16a34a", green: "#16a34a",
  "vert clair": "#A1B9B7", "light green": "#A1B9B7",
  jaune: "#eab308", yellow: "#eab308",
  orange: "#f97316",
  gris: "#6b7280", grey: "#6b7280", gray: "#6b7280",
  beige: "#d4b483",
  marine: "#1e3a5f", navy: "#1e3a5f",
  violet: "#7c3aed", purple: "#7c3aed",
  marron: "#92400e", brown: "#92400e",
  bordeaux: "#7f1d1d",
  kaki: "#78716c", khaki: "#78716c",
  camo: "#6b7c49", camouflage: "#6b7c49",
};

function isColorAttr(name: string) {
  return ["couleur", "color", "colour"].includes(name.toLowerCase());
}

function getColor(value: string): string | null {
  return COLOR_MAP[value.toLowerCase()] ?? null;
}

type Props = {
  product: WCProduct;
  variations: WCVariation[];
  selected: Record<string, string>;
  onChange: (attrName: string, value: string | null) => void;
  activeVariation: WCVariation | null;
};

export default function VariantSelector({ product, variations, selected, onChange, activeVariation }: Props) {
  const variantAttrs = product.attributes.filter((a) => a.variation);

  if (variantAttrs.length === 0) return null;

  const isOptionAvailable = (attrName: string, option: string) => {
    const testSelected = { ...selected, [attrName]: option };
    return variations.some((v) =>
      Object.entries(testSelected).every(([name, val]) => {
        const match = v.attributes.find((a) => a.name === name);
        return match?.option === val || !match;
      })
    );
  };

  return (
    <div className="space-y-6 mb-8">
      {variantAttrs.map((attr) => {
        const isColor = isColorAttr(attr.name);
        return (
          <div key={attr.id}>
            <div className="flex items-center gap-2 mb-3">
              <p
                className="text-xs uppercase tracking-widest text-gray-500"
                style={{ fontFamily: "Mirloanne, serif" }}
              >
                {attr.name}
              </p>
              {selected[attr.name] && (
                <p
                  className="text-xs text-gray-400 italic"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  — {selected[attr.name]}
                </p>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {attr.options.map((opt) => {
                const isSelected = selected[attr.name] === opt;
                const available = isOptionAvailable(attr.name, opt);
                const hexColor = isColor ? getColor(opt) : null;

                const handleClick = () => {
                  if (!available) return;
                  onChange(attr.name, isSelected ? null : opt);
                };

                if (isColor && hexColor) {
                  return (
                    <button
                      key={opt}
                      onClick={handleClick}
                      title={opt}
                      disabled={!available}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-[#FF0080] scale-110"
                          : "border-transparent hover:border-gray-400"
                      } ${!available ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                      style={{ backgroundColor: hexColor }}
                    />
                  );
                }

                return (
                  <button
                    key={opt}
                    onClick={handleClick}
                    disabled={!available}
                    className={`px-4 py-2 text-sm border transition-colors duration-200 ${
                      isSelected
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 text-gray-700 hover:border-gray-900"
                    } ${!available ? "opacity-30 cursor-not-allowed line-through" : "cursor-pointer"}`}
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Stock */}
      {activeVariation && (
        <p
          className={`text-xs uppercase tracking-widest ${
            activeVariation.stock_status === "instock" ? "text-green-600" : "text-red-500"
          }`}
          style={{ fontFamily: "Mirloanne, serif" }}
        >
          {activeVariation.stock_status === "instock" ? "En stock" : "Rupture de stock"}
        </p>
      )}
    </div>
  );
}
