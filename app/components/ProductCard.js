"use client";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { showSwalAlert } from "../lib/swalHelper"; // Import swalHelper

export default function ProductCard({ product }) {
  const router = useRouter();

  const addToCart = async () => {
    // Cek stok sebelum menambahkan ke keranjang
    if (product.stock <= 0) {
      showSwalAlert("Maaf", "Stok produk tidak tersedia.", "warning");
      return;
    }

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

      // Menggunakan SwalAlert untuk notifikasi sukses
      showSwalAlert("Berhasil", "Produk ditambahkan ke keranjang!", "success");
    } catch (err) {
      console.error(err);

      if (err?.response?.status === 401) {
        showSwalAlert(
          "Akses Ditolak",
          "Silakan login untuk menambahkan item ke keranjang.",
          "error"
        );
        router.push("/login");
        return;
      }

      showSwalAlert("Gagal", "Gagal menambahkan produk ke keranjang.", "error");
    }
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col hover:shadow-2xl transition-shadow duration-200">
      <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400">
        Image
      </div>
      <h3 className="font-semibold mb-1">{product.title}</h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {product.description}
      </p>
      <div className="mt-auto flex-column">
        <div className="text-lg font-bold">
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(product.price)}
          </span>
        </div>
        <div className="flex justify-center items-center gap-4 p-4 rounded-lg">
          <Link
            href={`/products/${product.id}`}
            className="text-[#44AF7C] text-sm"
          >
            Detail Product
          </Link>
          <button
            onClick={addToCart}
            disabled={isOutOfStock} // Disable tombol jika stok habis
            className={`px-3 py-1 rounded text-sm ${
              isOutOfStock
                ? "bg-gray-400 text-gray-800 cursor-not-allowed"
                : "bg-[#44AF7C] text-white"
            }`}
          >
            {isOutOfStock ? "Habis" : "Masukan Keranjang"}
          </button>
        </div>
      </div>
    </div>
  );
}
