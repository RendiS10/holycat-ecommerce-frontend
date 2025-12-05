import Link from "next/link";
import Header from "../components/Header"; // Pastikan path import benar
import ProductCard from "../components/ProductCard"; // Pastikan path import benar

// Fungsi getProducts menerima parameter search
async function getProducts(search) {
  try {
    // Buat URL dengan query param jika ada search
    const url = search
      ? `http://localhost:4000/products?search=${encodeURIComponent(search)}`
      : "http://localhost:4000/products";

    // Gunakan no-store agar data selalu fresh (tidak di-cache oleh Next.js)
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

// [PERBAIKAN] Next.js 15: searchParams adalah Promise
export default async function ProductsPage(props) {
  const searchParams = await props.searchParams; // <--- WAJIB DI-AWAIT
  const search = searchParams?.search || "";

  const products = await getProducts(search);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <div className="p-6 pt-[140px] max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {search ? `Hasil Pencarian: "${search}"` : "Semua Produk"}
          </h1>
          <span className="text-gray-600 font-medium">
            {products.length} Produk ditemukan
          </span>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <p className="text-xl text-gray-500">
              Tidak ada produk yang cocok dengan "{search}".
            </p>
            <Link
              href="/products"
              className="text-[#44af7c] hover:underline mt-4 inline-block"
            >
              Lihat Semua Produk
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
