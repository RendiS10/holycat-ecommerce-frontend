"use client";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation"; // Impor useRouter

export default function ProductCard({ product }) {
  const router = useRouter(); // Inisialisasi router

  const addToCart = async () => {
    try {
      await axios.post(
        "http://localhost:4000/cart/add",
        { productId: product.id, quantity: 1 },
        { withCredentials: true }
      );

      // Memberi notifikasi ke komponen lain (misalnya Header)
      try {
        window.dispatchEvent(new Event("cartUpdated"));
      } catch (e) {}

      // Menampilkan notifikasi sukses
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { message: "Added to cart", type: "success" },
        })
      );
    } catch (err) {
      console.error(err);

      // Logika Penanganan Error 401
      if (err?.response?.status === 401) {
        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: {
              message: "Please login to add items to cart.",
              type: "error",
            },
          })
        );
        router.push("/login"); // Arahkan ke halaman login
        return;
      }
      // Penanganan error selain 401
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { message: "Failed to add to cart", type: "error" },
        })
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col hover:shadow-2xl transition-shadow duration-200">
      <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400">
        Image
      </div>
      <h3 className="font-semibold mb-1">{product.title}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {product.description}
      </p>
      <div className="mt-auto flex items-center justify-between">
        <div className="text-lg font-bold">
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            ${product.price.toFixed(2)}
          </span>
        </div>
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
