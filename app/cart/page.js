"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Header from "../components/Header"; // Import Header
import { showSwalAlert } from "../lib/swalHelper"; // Import SwalAlert Helper
import { useRouter } from "next/navigation"; // Import useRouter

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [inputQuantities, setInputQuantities] = useState({}); // State untuk input

  const router = useRouter(); // Inisialisasi router

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:4000/cart", {
        withCredentials: true,
      });
      setCart(res.data);
      // Inisialisasi state input dengan kuantitas dari cart
      const quantities = res.data.items.reduce((acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
      }, {});
      setInputQuantities(quantities);
      setError(null);
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;

      if (status === 401) {
        setError("Sesi kedaluwarsa atau Anda belum login.");
        showSwalAlert(
          "Sesi Kedaluwarsa",
          "Harap login untuk melihat keranjang Anda.",
          "warning"
        );
        router.push("/login");
        return;
      }

      setError(err?.response?.data?.error || "Failed to load cart");
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdate = async (id, qty) => {
    // Validasi kuantitas
    const newQty = parseInt(qty, 10);
    if (isNaN(newQty) || newQty < 1) {
      showSwalAlert(
        "Input tidak valid",
        "Kuantitas minimal adalah 1.",
        "error"
      );
      // Reset input ke nilai semula
      setInputQuantities((prev) => ({
        ...prev,
        [id]: cart.items.find((item) => item.id === id).quantity,
      }));
      return;
    }

    try {
      setUpdating((s) => ({ ...s, [id]: true }));
      await axios.put(
        `http://localhost:4000/cart/update/${id}`,
        { quantity: newQty },
        { withCredentials: true }
      );
      await fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
      showSwalAlert(
        "Sukses",
        "Kuantitas keranjang berhasil diperbarui!",
        "success"
      );
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      const msg = err?.response?.data?.error || "Gagal memperbarui kuantitas.";

      if (status === 401) {
        showSwalAlert(
          "Akses Ditolak",
          "Harap login untuk memperbarui keranjang.",
          "error"
        );
        router.push("/login");
      } else {
        showSwalAlert("Gagal", msg, "error");
      }
    } finally {
      setUpdating((s) => {
        const copy = { ...s };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleRemove = async (id) => {
    try {
      setUpdating((s) => ({ ...s, [id]: true }));
      await axios.delete(`http://localhost:4000/cart/remove/${id}`, {
        withCredentials: true,
      });
      await fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
      showSwalAlert("Dihapus", "Item berhasil dihapus dari keranjang.", "info");
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      const msg = err?.response?.data?.error || "Gagal menghapus item.";

      if (status === 401) {
        showSwalAlert(
          "Akses Ditolak",
          "Harap login untuk mengubah keranjang.",
          "error"
        );
        router.push("/login");
      } else {
        showSwalAlert("Gagal", msg, "error");
      }
    } finally {
      setUpdating((s) => {
        const copy = { ...s };
        delete copy[id];
        return copy;
      });
    }
  };

  // Handler untuk perubahan input
  const handleQuantityChange = (id, value) => {
    setInputQuantities((prev) => ({ ...prev, [id]: value }));
  };

  // Handler saat input kehilangan fokus (onBlur)
  const handleBlur = (id, originalQuantity) => {
    const newQuantity = inputQuantities[id];
    if (newQuantity !== originalQuantity) {
      handleUpdate(id, newQuantity);
    }
  };

  if (loading)
    return (
      <>
        <Header />
        <div className="p-6 pt-[120px] max-w-4xl mx-auto">Loading cart...</div>
      </>
    );

  if (error && !cart)
    return (
      <>
        <Header />
        <div className="p-6 pt-[120px] max-w-4xl mx-auto text-red-600">
          Error: {error}
        </div>
      </>
    );

  return (
    <>
      <Header />
      <div className="p-6 pt-[120px] max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="bg-white p-8 rounded shadow text-center">
            <div className="text-xl font-semibold mb-2">Your cart is empty</div>
            <p className="text-sm text-gray-600 mb-4">
              Start exploring our products and add items to your cart.
            </p>
            <Link
              href="/"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Shop now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded shadow flex flex-col md:flex-row items-center gap-4"
              >
                <div className="w-28 h-28 bg-gray-100 flex items-center justify-center rounded overflow-hidden">
                  <img
                    src={item.product.image || "/next.svg"}
                    alt={item.product.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 w-full">
                  <div className="font-semibold text-lg">
                    {item.product.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    ${item.product.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Subtotal: $
                    {(inputQuantities[item.id] * item.product.price).toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleUpdate(item.id, Math.max(1, item.quantity - 1))
                    }
                    className="px-3 py-1 border rounded disabled:opacity-60"
                    disabled={updating[item.id] || item.quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={inputQuantities[item.id] || ""}
                    onChange={(e) =>
                      handleQuantityChange(item.id, e.target.value)
                    }
                    onBlur={() => handleBlur(item.id, item.quantity)}
                    className="w-16 text-center border rounded"
                    disabled={updating[item.id]}
                  />
                  <button
                    onClick={() => handleUpdate(item.id, item.quantity + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-60"
                    disabled={updating[item.id]}
                  >
                    +
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-sm text-red-600 disabled:opacity-60"
                    disabled={updating[item.id]}
                  >
                    {updating[item.id] ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            ))}

            <div className="bg-white p-4 rounded shadow flex items-center justify-between">
              <div className="font-semibold">Total</div>
              <div className="text-xl font-bold">${cart.subtotal}</div>{" "}
            </div>

            <div className="text-right">
              <button className="bg-[#44af7c] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#ffbf00] transition duration-200">
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
