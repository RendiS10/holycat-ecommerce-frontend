"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Header() {
  const [count, setCount] = useState(0);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  const fetchCount = async () => {
    try {
      const token =
        typeof window !== "undefined" && localStorage.getItem("token");
      if (!token) {
        setCount(0);
        return;
      }
      const res = await axios.get("http://localhost:4000/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = res.data?.items || [];
      setCount(items.reduce((s, i) => s + i.quantity, 0));
    } catch (err) {
      setCount(0);
    }
  };

  useEffect(() => {
    fetchCount();
    const token =
      typeof window !== "undefined" && localStorage.getItem("token");
    setIsAuth(!!token);

    const handler = () => fetchCount();
    window.addEventListener("cartUpdated", handler);
    const authHandler = () => setIsAuth(!!localStorage.getItem("token"));
    window.addEventListener("authChanged", authHandler);
    return () => {
      window.removeEventListener("cartUpdated", handler);
      window.removeEventListener("authChanged", authHandler);
    };
  }, []);

  const logout = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    setCount(0);
    setIsAuth(false);
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("authChanged"));
    router.push("/");
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          NexMart
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/products" className="text-sm text-gray-700">
            Products
          </Link>
          <Link href="/cart" className="text-sm text-gray-700">
            Cart{count > 0 ? ` (${count})` : ""}
          </Link>
          {!isAuth ? (
            <>
              <Link href="/login" className="text-sm text-gray-700">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-indigo-600 text-white text-sm px-3 py-2 rounded"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="text-sm bg-red-500 text-white px-3 py-2 rounded"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
