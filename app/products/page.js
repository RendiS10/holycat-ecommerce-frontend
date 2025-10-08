import Link from "next/link";

async function getProducts() {
  const res = await fetch("http://localhost:4000/products");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="border p-3">
            <h2 className="font-semibold">{p.title}</h2>
            <p className="text-sm">${p.price.toFixed(2)}</p>
            <Link className="text-blue-600" href={`/products/${p.id}`}>
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
