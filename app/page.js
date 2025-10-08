import Header from "./components/Header";
import ProductCard from "./components/ProductCard";

async function getProducts() {
  try {
    const res = await fetch("http://localhost:4000/products");
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  } catch (err) {
    // Silently return null when backend is unreachable to avoid noisy server logs
    return null;
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center mb-12">
          <div className="lg:col-span-2 bg-gradient-to-r from-sky-700 to-indigo-700 text-white rounded-xl p-10 shadow-lg">
            <h1 className="text-4xl font-extrabold mb-4">
              Best Summer Collection
            </h1>
            <p className="mb-6 max-w-xl">
              Discover our curated collection of gadgets, accessories and pet
              essentials. Quality products at great prices.
            </p>
            <div className="flex gap-3">
              <a
                href="/products"
                className="bg-white text-indigo-700 font-semibold px-5 py-3 rounded shadow"
              >
                Shop Now
              </a>
              <a
                href="#featured"
                className="border border-white text-white px-5 py-3 rounded"
              >
                Featured
              </a>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl p-4 shadow">
              <h3 className="font-semibold mb-2">Weekly Best Deals</h3>
              <ul className="text-sm space-y-3">
                <li className="flex justify-between">
                  <span>Smart Watch</span>
                  <span className="font-semibold">$120</span>
                </li>
                <li className="flex justify-between">
                  <span>Earbuds</span>
                  <span className="font-semibold">$29</span>
                </li>
                <li className="flex justify-between">
                  <span>Cat Toy</span>
                  <span className="font-semibold">$5</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Featured products */}
        <section id="featured">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <a href="/products" className="text-sm text-indigo-600">
              View all
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products === null ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-white p-6 rounded shadow">
                <p className="text-center text-gray-600">
                  Products currently unavailable — the backend may be down.
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-white p-6 rounded shadow">
                <p className="text-center text-gray-600">No products found.</p>
              </div>
            ) : (
              products.map((p) => <ProductCard key={p.id} product={p} />)
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
