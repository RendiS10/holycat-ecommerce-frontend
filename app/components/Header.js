"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Header() {
  const [count, setCount] = useState(0);
  const [isAuth, setIsAuth] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();

  const fetchCount = async () => {
    try {
      const res = await axios.get("http://localhost:4000/cart", {
        withCredentials: true,
      });
      const items = res.data?.items || [];
      setCount(items.reduce((s, i) => s + i.quantity, 0));
    } catch (err) {
      setCount(0);
    }
  };

  useEffect(() => {
    fetchCount();

    const checkAuth = async () => {
      setIsLoadingAuth(true);
      try {
        await axios.get("http://localhost:4000/auth/me", {
          withCredentials: true,
        });
        setIsAuth(true);
      } catch (err) {
        setIsAuth(false);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuth();

    const handler = () => fetchCount();
    window.addEventListener("cartUpdated", handler);
    const authHandler = () => checkAuth();
    window.addEventListener("authChanged", authHandler);
    return () => {
      window.removeEventListener("cartUpdated", handler);
      window.removeEventListener("authChanged", authHandler);
    };
  }, []);

  // PERUBAHAN UTAMA: Fungsi logout dibuat async
  const logout = async () => {
    if (typeof window === "undefined") return;

    try {
      // WAJIB: Tunggu (await) respons dari backend sebelum membersihkan state
      await axios.post(
        "http://localhost:4000/auth/logout",
        {},
        { withCredentials: true }
      );
    } catch (err) {
      // Meskipun API call gagal (misal server down), kita tetap perlu membersihkan state
      console.error("Logout API failed, continuing local cleanup:", err);
    }

    // 1. Pembersihan State Lokal
    setCount(0);
    setIsAuth(false);

    // 2. Hapus token fallback development
    try {
      sessionStorage.removeItem("dev_token");
      delete axios.defaults.headers.common["Authorization"];
    } catch (e) {}

    // 3. Dispatch events & Redirect (terjadi setelah API call selesai)
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

          {isLoadingAuth ? (
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          ) : !isAuth ? (
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
