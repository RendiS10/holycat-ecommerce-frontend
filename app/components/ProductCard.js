"use client";
import Link from "next/link";
import axios from "axios";

export default function ProductCard({ product }) {
  const addToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first");
    try {
      await axios.post(
        "http://localhost:4000/cart/add",
        { productId: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // notify other parts of the UI (header, cart page)
      try {
        window.dispatchEvent(new Event("cartUpdated"));
      } catch (e) {}
      alert("Added to cart");
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col">
      <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400">
        Image
      </div>
      <h3 className="font-semibold mb-1">{product.title}</h3>
      <p className="text-sm text-gray-600 mb-3">{product.description}</p>
      <div className="mt-auto flex items-center justify-between">
        <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
        <div className="flex gap-2">
          <Link
            href={`/products/${product.id}`}
            className="text-indigo-600 text-sm"
          >
            View
          </Link>
          <button
            onClick={addToCart}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
