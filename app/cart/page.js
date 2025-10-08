"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:4000/cart", {
        withCredentials: true,
      });
      setCart(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
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
    // cookie-based auth: just attempt the call and rely on 401 from server
    // but show a friendly message if unauthorized
    try {
      setUpdating((s) => ({ ...s, [id]: true }));
      await axios.put(
        `http://localhost:4000/cart/update/${id}`,
        { quantity: qty },
        { withCredentials: true }
      );
      await fetchCart();
      try {
        window.dispatchEvent(new Event("cartUpdated"));
      } catch (e) {}
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || "Failed to update";
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { message: msg, type: "error" } })
      );
    } finally {
      setUpdating((s) => {
        const copy = { ...s };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleRemove = async (id) => {
    // optimistic UX: remove and then show undo-able toast
    try {
      setUpdating((s) => ({ ...s, [id]: true }));
      await axios.delete(`http://localhost:4000/cart/remove/${id}`, {
        withCredentials: true,
      });
      await fetchCart();
      try {
        window.dispatchEvent(new Event("cartUpdated"));
      } catch (e) {}
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { message: "Removed from cart", type: "success" },
        })
      );
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || "Failed to remove";
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { message: msg, type: "error" } })
      );
    } finally {
      setUpdating((s) => {
        const copy = { ...s };
        delete copy[id];
        return copy;
      });
    }
  };

  if (loading) return <div className="p-6">Loading cart...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {!cart || !cart.items || cart.items.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center">
          <div className="text-xl font-semibold mb-2">Your cart is empty</div>
          <p className="text-sm text-gray-600 mb-4">
            Start exploring our products and add items to your cart.
          </p>
          <Link
            href="/products"
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
                {/* replace with real image later */}
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
                  Subtotal: ${(item.quantity * item.product.price).toFixed(2)}
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
                <div className="px-4">{item.quantity}</div>
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
            <div className="text-xl font-bold">${cart.subtotal.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
