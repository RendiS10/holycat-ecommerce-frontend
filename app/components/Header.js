"use client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Tambah useSearchParams
import axios from "axios";
import { showLogoutConfirm, showSwalAlert } from "../lib/swalHelper";

// ... (Konstanta Warna TETAP SAMA) ...
const COLORS = {
  GREEN: "#44af7c",
  YELLOW: "#ffbf00",
  DARK_BG: "#374151",
  NAV_LIGHT_BG: "#f3f4f6",
  PRIMARY_BLUE: "#3b82f6",
  DROPDOWN_BG: "#1f2937",
  DROPDOWN_HOVER: "#374151",
  TEXT_DARK: "#2b2b2b",
  DROPDOWN_TEXT: "#e5e7eb",
};
const COLOR_PRIMARY_GREEN_CLASS = "text-[#44af7c]";
const COLOR_TEXT_DARK_CLASS = "text-[#2b2b2b]";

export default function Header() {
  const [user, setUser] = useState(null);
  const [count, setCount] = useState(0);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // [BARU] State untuk pencarian
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk mengontrol menu dropdown (TETAP SAMA)
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSearchMobileOpen, setIsSearchMobileOpen] = useState(false);
  const [isCategoryMobileOpen, setIsCategoryMobileOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams(); // Untuk membaca URL saat ini

  // [BARU] Sinkronkan input dengan URL (jika user me-refresh halaman pencarian)
  useEffect(() => {
    const currentSearch = searchParams.get("search");
    if (currentSearch) {
      setSearchTerm(currentSearch);
    }
  }, [searchParams]);

  // [BARU] Fungsi Handle Search
  const handleSearch = (e) => {
    e.preventDefault(); // Mencegah reload form default
    if (searchTerm.trim()) {
      // Redirect ke halaman produk dengan query param
      router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
      setIsSearchMobileOpen(false); // Tutup search mobile jika terbuka
    } else {
      // Jika kosong, ke halaman produk semua
      router.push("/products");
    }
  };

  // [BARU] Handle Enter Key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  // ... (Fungsi fetchCount, checkAuth, handleLogout, toggleMenu TETAP SAMA) ...
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

  const checkAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const res = await axios.get("http://localhost:4000/auth/me", {
        withCredentials: true,
      });
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const handleLogout = async () => {
    if (typeof window === "undefined") return;
    try {
      await axios.post(
        "http://localhost:4000/auth/logout",
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout failed", err);
    }
    setCount(0);
    setUser(null);
    setIsAccountOpen(false);
    try {
      sessionStorage.removeItem("dev_token");
      delete axios.defaults.headers.common["Authorization"];
    } catch (e) {}
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("authChanged"));
    showSwalAlert("Berhasil Keluar", "Anda telah keluar.", "info");
    router.push("/");
  };

  const logout = () => {
    showLogoutConfirm(handleLogout);
  };

  const toggleAccountMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAccountOpen((s) => !s);
    setIsSearchMobileOpen(false);
    setIsCategoryMobileOpen(false);
  };

  const toggleMobileSearchBar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSearchMobileOpen((s) => !s);
    setIsAccountOpen(false);
    setIsCategoryMobileOpen(false);
    if (!isSearchMobileOpen) {
      setTimeout(() => {
        document.getElementById("mobile-search-input")?.focus();
      }, 10);
    }
  };

  const toggleMobileCategoryMenu = () => {
    setIsCategoryMobileOpen((s) => !s);
    setIsAccountOpen(false);
    setIsSearchMobileOpen(false);
  };

  useEffect(() => {
    const clickOutsideHandler = (event) => {
      const headerElement = document.querySelector(".custom-navbar");
      if (headerElement && !headerElement.contains(event.target)) {
        setIsAccountOpen(false);
        setIsSearchMobileOpen(false);
        setIsCategoryMobileOpen(false);
      }
    };
    document.addEventListener("click", clickOutsideHandler);
    checkAuth();
    fetchCount();
    const authHandler = () => checkAuth();
    const cartHandler = () => fetchCount();
    window.addEventListener("authChanged", authHandler);
    window.addEventListener("cartUpdated", cartHandler);
    return () => {
      document.removeEventListener("click", clickOutsideHandler);
      window.removeEventListener("authChanged", authHandler);
      window.removeEventListener("cartUpdated", cartHandler);
    };
  }, [checkAuth]);

  const isAuth = !!user;
  const userName = user?.name || "Cat Lover";
  const userEmail = user?.email || "user@holycat.com";

  return (
    <header className="custom-navbar fixed top-0 left-0 right-0 z-[1000] shadow-md bg-white">
      {/* MOBILE SEARCH BAR (Updated) */}
      <div
        id="mobile-search-bar"
        className={`mobile-search-bar absolute top-full left-0 right-0 p-3 bg-white z-[500] shadow-lg md:hidden ${
          isSearchMobileOpen ? "block" : "hidden"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-2">
          <input
            type="text"
            id="mobile-search-input"
            value={searchTerm} // Bind value
            onChange={(e) => setSearchTerm(e.target.value)} // Handle change
            onKeyDown={handleKeyDown} // Handle Enter
            className={`mobile-search-input w-full p-2 rounded-lg border-2 border-[#44af7c] text-lg font-bold bg-white text-[#2b2b2b] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#ffbf00]`}
            placeholder="Cari produk..."
          />
          <button
            onClick={handleSearch}
            className="bg-[#44af7c] text-white px-4 rounded-lg"
          >
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>

      <div
        className={`nav-top bg-white h-[70px] px-4 md:px-10 flex items-center justify-between relative`}
      >
        <div className="nav-group-left flex items-center gap-5">
          <Link
            href="/"
            className={`logo-flowbite flex items-center font-['Lilita_One'] text-[30px] md:text-[30px] ${COLOR_PRIMARY_GREEN_CLASS}`}
          >
            <img
              src="/images/logo.png"
              alt="HolycatStore Logo"
              className="h-[55px] w-auto mr-1"
            />
          </Link>

          {/* Search Bar Desktop (Updated) */}
          <div className="search-container hidden lg:flex rounded-lg overflow-hidden w-[500px] border-2 border-[#44af7c] shadow-inner">
            <input
              type="text"
              value={searchTerm} // Bind value
              onChange={(e) => setSearchTerm(e.target.value)} // Handle change
              onKeyDown={handleKeyDown} // Handle Enter
              className="search-input flex-grow p-[8px] border-none text-[18px] font-bold bg-white text-[#2b2b2b] placeholder-gray-400 focus:outline-none"
              placeholder="Apa yang bisa kami bantu hari ini?"
            />
            <button
              onClick={handleSearch} // Handle Click
              className={`search-button bg-[#44af7c] text-white px-[15px] text-[20px]  hover:text-[#ffbf00] cursor-pointer`}
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>

        {/* Group Kanan (Cart & Auth - TETAP SAMA) */}
        <div className="nav-group-right flex items-center gap-7 text-[#2b2b2b]">
          <a
            href="#"
            className={`nav-icon-link search-icon-link lg:hidden text-2xl ${COLOR_PRIMARY_GREEN_CLASS}`}
            onClick={toggleMobileSearchBar}
          >
            <i className="fas fa-search text-2xl"></i>
          </a>
          <Link
            href="/cart"
            className={`nav-icon-link relative flex items-center text-[24px] font-bold ${COLOR_PRIMARY_GREEN_CLASS} hover:text-[#ffbf00]`}
          >
            <i className="fas fa-shopping-cart text-2xl"></i>
            <span className="hidden md:inline ml-2 text-[#2b2b2b]">
              Keranjang
            </span>
            {count > 0 && (
              <span
                className={`absolute top-[-5px] right-[-10px] bg-[#ef4444] text-white rounded-full px-[7px] text-[14px] font-['Lilita_One'] leading-none flex items-center justify-center`}
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          {isLoadingAuth ? (
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          ) : !isAuth ? (
            <div className="flex items-center gap-4 text-[24px] font-bold">
              <Link
                href="/login"
                className={`text-[#44af7c] hover:text-[#ffbf00] p-1 rounded transition-colors`}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className={`text-[#44af7c] px-3 py-1 rounded-[30px] hover:text-[#ffbf00] transition-colors text-[24px] font-bold`}
              >
                Daftar
              </Link>
            </div>
          ) : (
            <div
              id="account-dropdown-wrapper"
              className={`my-account-dropdown-wrapper relative inline-block ${
                isAccountOpen ? "active" : ""
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <a
                href="#"
                onClick={toggleAccountMenu}
                className={`nav-icon-link my-account flex items-center text-[24px] font-bold cursor-pointer ${COLOR_PRIMARY_GREEN_CLASS}`}
              >
                <img
                  src="/next.svg"
                  alt="Avatar"
                  className="w-[30px] h-[30px] rounded-full mr-[5px] object-cover brightness-100"
                />
                <span className="hidden md:inline font-bold text-[#2b2b2b]">
                  Akun Saya
                </span>
                <i className="fas fa-caret-down ml-1 text-sm text-[#2b2b2b]"></i>
              </a>
              <div
                className={`absolute top-full right-0 mt-2 w-[250px] bg-white rounded-lg shadow-xl border border-gray-100 p-0 z-[100] ${
                  isAccountOpen ? "block" : "hidden"
                }`}
              >
                <div className="dropdown-header text-center p-[15px] border-b border-gray-200">
                  <h4 className="text-[26px] font-extrabold text-[#2B2B2B] m-0 leading-none">
                    Halo, {userName.split(" ")[0]}
                  </h4>
                  <p className="text-[18px] text-gray-500 m-0 leading-none">
                    {userEmail}
                  </p>
                </div>
                <ul className="dropdown-menu-list list-none p-[10px] m-0 text-[22px] font-bold">
                  {user?.role === "ADMIN" && (
                    <li>
                      <Link
                        href="/admin/orders"
                        className="flex items-center p-2 text-[#2B2B2B] bg-yellow-100 hover:bg-yellow-200 rounded-md mb-1"
                      >
                        <i
                          className={`fas fa-shield-halved ${COLOR_PRIMARY_GREEN_CLASS} mr-3 text-xl`}
                        ></i>{" "}
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      href="/profile"
                      className="flex items-center p-2 text-[#2B2B2B] hover:bg-gray-100 rounded-md"
                    >
                      <i
                        className={`fas fa-user-circle ${COLOR_PRIMARY_GREEN_CLASS} mr-3 text-xl`}
                      ></i>{" "}
                      Akun Saya
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/orders"
                      className="flex items-center p-2 text-[#2B2B2B] hover:bg-gray-100 rounded-md"
                    >
                      <i
                        className={`fas fa-truck-moving ${COLOR_PRIMARY_GREEN_CLASS} mr-3 text-xl`}
                      ></i>{" "}
                      Pesanan Saya
                    </Link>
                  </li>
                  <li className="log-out border-t border-gray-200 mt-2 pt-2">
                    <button
                      onClick={logout}
                      className="w-full flex items-center p-2 text-red-500 hover:bg-red-50 rounded-md"
                    >
                      <i className="fas fa-sign-out-alt mr-3 text-xl"></i>{" "}
                      Keluar
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav Bawah (TETAP SAMA) */}
      <div
        className={`nav-bottom bg-[#f3f4f6] border-t border-[#e5e7eb] h-[50px] px-4 md:px-10 flex items-center justify-between relative`}
      >
        <div className="mobile-bottom-menu-wrapper flex w-full justify-between items-center md:hidden">
          <div
            className={`mobile-menu-text flex items-center text-[24px] font-bold cursor-pointer ${COLOR_TEXT_DARK_CLASS}`}
            onClick={toggleMobileCategoryMenu}
          >
            <i className="fas fa-bars mr-2 text-xl"></i>{" "}
            <span className="font-bold">Menu Kategori</span>
          </div>
        </div>
        <div
          className={`nav-links-bottom hidden md:flex items-center gap-[25px] text-[24px] font-bold ${COLOR_TEXT_DARK_CLASS}`}
        >
          <Link href="/" className="hover:text-[#44af7c]">
            Beranda
          </Link>
          <Link href="/products" className="hover:text-[#44af7c]">
            Semua Produk
          </Link>
          <Link href="#" className="hover:text-[#44af7c]">
            Obat
          </Link>
          <Link href="#" className="hover:text-[#44af7c]">
            Suplemen & Vitamin
          </Link>
          <Link href="#" className="hover:text-[#44af7c]">
            Grooming
          </Link>
        </div>
        <div
          id="mobile-category-menu"
          className={`mobile-category-list absolute top-full left-0 right-0 w-full bg-white shadow-xl z-50 ${
            isCategoryMobileOpen ? "block" : "hidden"
          } md:hidden`}
        >
          <ul className="list-none p-0 m-0 text-[24px] font-bold text-[#2b2b2b]">
            <li>
              <Link
                href="/"
                className="block p-3 hover:bg-gray-100 hover:text-[#44af7c]"
              >
                Beranda
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="block p-3 hover:bg-gray-100 hover:text-[#44af7c]"
              >
                Semua Produk
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="block p-3 hover:bg-gray-100 hover:text-[#44af7c]"
              >
                Vitamin Kucing
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="block p-3 hover:bg-gray-100 hover:text-[#44af7c]"
              >
                Grooming
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
