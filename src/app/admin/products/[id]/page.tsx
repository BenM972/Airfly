import Link from "next/link";
import Image from "next/image";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProduct({ params }: { params: { id: string } }) {
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
      <ProductForm productId={Number(params.id)} />
    </div>
  );
}
