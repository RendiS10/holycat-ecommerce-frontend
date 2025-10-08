import AddToCartButton from "./AddToCartButton";

async function getProduct(id) {
  try {
    const res = await fetch(`http://localhost:4000/products/${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("getProduct error", err);
    return null;
  }
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  if (!product) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl mb-2">Product not available</h1>
        <p className="text-sm text-gray-600">
          Could not load product. The backend may be down.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl mb-2">{product.title}</h1>
      <p className="text-lg font-semibold mb-4">${product.price.toFixed(2)}</p>
      <p className="mb-4">{product.description}</p>
      <AddToCartButton productId={product.id} />
    </div>
  );
}
