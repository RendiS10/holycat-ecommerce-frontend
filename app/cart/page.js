"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchCart = async () => {
    if (!token) {
      setCart(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:4000/cart", {
        headers: { Authorization: `Bearer ${token}` },
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
  }, [token]);

  const handleUpdate = async (id, qty) => {
    if (!token) return alert("Please login");
    try {
      await axios.put(
        `http://localhost:4000/cart/update/${id}`,
        { quantity: qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
      try {
        window.dispatchEvent(new Event("cartUpdated"));
      } catch (e) {}
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    }
  };

  const handleRemove = async (id) => {
    if (!token) return alert("Please login");
    if (!confirm("Remove item from cart?")) return;
    try {
      await axios.delete(`http://localhost:4000/cart/remove/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
      try {
        window.dispatchEvent(new Event("cartUpdated"));
      } catch (e) {}
    } catch (err) {
      console.error(err);
      alert("Failed to remove");
    }
  };

  if (loading) return <div className="p-6">Loading cart...</div>;
  if (!token)
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-3">Your cart</h2>
        <p>
          Please{" "}
          <Link href="/login" className="text-indigo-600">
            login
          </Link>{" "}
          to view your cart.
        </p>
      </div>
    );

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      {!cart || !cart.items || cart.items.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">
          Your cart is empty.{" "}
          <Link href="/products" className="text-indigo-600">
            Shop now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded shadow flex items-center gap-4"
            >
              <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded">
                Img
              </div>
              <div className="flex-1">
                <div className="font-semibold">{item.product.title}</div>
                <div className="text-sm text-gray-600">
                  ${item.product.price.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  Subtotal: ${(item.quantity * item.product.price).toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdate(item.id, item.quantity - 1)}
                  className="px-2 py-1 border rounded"
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <div className="px-3">{item.quantity}</div>
                <button
                  onClick={() => handleUpdate(item.id, item.quantity + 1)}
                  className="px-2 py-1 border rounded"
                >
                  +
                </button>
              </div>
              <div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-sm text-red-600"
                >
                  Remove
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
