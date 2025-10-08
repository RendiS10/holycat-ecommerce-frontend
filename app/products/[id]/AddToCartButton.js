"use client";
import axios from "axios";

export default function AddToCartButton({ productId }) {
  const add = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login");
    try {
      await axios.post(
        "http://localhost:4000/cart/add",
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
    <button onClick={add} className="bg-blue-600 text-white p-2 rounded">
      Add to cart
    </button>
  );
}
