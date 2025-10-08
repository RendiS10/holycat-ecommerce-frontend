"use client";
import axios from "axios";

export default function AddToCartButton({ productId }) {
  const add = async () => {
    try {
      await axios.post(
        "http://localhost:4000/cart/add",
        { productId, quantity: 1 },
        { withCredentials: true }
      );
      try {
        window.dispatchEvent(new Event("cartUpdated"));
      } catch (e) {}
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { message: "Added to cart", type: "success" },
        })
      );
    } catch (err) {
      console.error(err);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { message: "Failed to add to cart", type: "error" },
        })
      );
    }
  };

  return (
    <button onClick={add} className="bg-blue-600 text-white p-2 rounded">
      Add to cart
    </button>
  );
}
