import Link from "next/link";
import Image from "next/image";
import ProductForm from "@/components/admin/ProductForm";

// Next 16 ne fournit plus `params` qu'en promesse : `params.id` lu directement
// valait undefined, et le formulaire recevait NaN au lieu de l'id du produit.
export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Image src="/logo-airfly.webp" alt="Airfly" width={60} height={24} className="object-contain" />
          </Link>
          <Link href="/admin/products" className="text-gray-600 text-xs uppercase tracking-widest hover:text-white transition-colors" style={{ fontFamily: "Mirloanne, serif" }}>
            Produits
          </Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-400 text-xs uppercase tracking-widest" style={{ fontFamily: "Mirloanne, serif" }}>
            Modifier
          </span>
        </div>
      </header>
      <ProductForm productId={Number(id)} />
    </div>
  );
}
