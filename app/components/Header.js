"use client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// --- Konstanta Warna Tailwind (Arbitrary Values) ---
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

  // State untuk mengontrol menu dropdown
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSearchMobileOpen, setIsSearchMobileOpen] = useState(false);
  const [isCategoryMobileOpen, setIsCategoryMobileOpen] = useState(false);

  const router = useRouter();

  // --- FUNGSI ASINKRONUS (Data Fetching) ---
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

  const logout = async () => {
    if (typeof window === "undefined") return;

    try {
      await axios.post(
        "http://localhost:4000/auth/logout",
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout API failed, continuing local cleanup:", err);
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
    router.push("/");
  };

  // --- FUNGSI TOGGLE MENU (Client Side) ---
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

  // Menutup menu jika klik di luar komponen
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

    // --- EFFECT LISTENER ---
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

  // isAuth dihitung dari keberadaan objek user
  const isAuth = !!user;
  const userName = user?.name || "Cat Lover";
  const userEmail = user?.email || "user@holycat.com";

  return (
    <header className="custom-navbar fixed top-0 left-0 right-0 z-[1000] shadow-md">
      {/* MOBILE SEARCH BAR DROPDOWN (Hanya tampil di mobile jika diklik) */}
      <div
        id="mobile-search-bar"
        className={`mobile-search-bar absolute top-full left-0 right-0 p-3 bg-[${
          COLORS.DARK_BG
        }] z-[500] shadow-lg md:hidden ${
          isSearchMobileOpen ? "block" : "hidden"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          id="mobile-search-input"
          className={`mobile-search-input w-full p-2 rounded-lg border-2 border-[#44af7c] text-lg font-bold bg-[#4b5563] text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#ffbf00]`}
          placeholder="Cari vitamin, grooming, atau obat kucing..."
          onBlur={() => setIsSearchMobileOpen(false)}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* BARIS ATAS (LOGO, SEARCH DESKTOP, CART, AUTH) - Warna Gelap */}
      {/* ------------------------------------------------------------------ */}
      <div
        className={`nav-top bg-[${COLORS.DARK_BG}] h-[70px] px-4 md:px-10 flex items-center justify-between relative`}
      >
        <div className="nav-group-left flex items-center gap-5">
          {/* Logo HolycatStore - Warna Hijau agar Kontras di Background Gelap */}
          <Link
            href="/"
            className={`logo-flowbite flex items-center font-['Lilita_One'] text-[30px] md:text-[30px] ${COLOR_PRIMARY_GREEN_CLASS}`}
          >
            <i className="fas fa-paw mr-1 text-[35px]"></i> HolycatStore
          </Link>

          {/* Search Bar Desktop */}
          <div className="search-container hidden lg:flex rounded-lg overflow-hidden w-[500px] border-2 border-[#44af7c] shadow-inner shadow-black/50">
            <input
              type="text"
              className="search-input flex-grow p-[8px] border-none text-[18px] font-bold bg-[#ffff] text-[#ffbf00]placeholder-gray-400 focus:outline-none"
              placeholder="Apa yang bisa kami bantu hari ini?"
            />
            <button
              className={`search-button bg-[#44af7c] text-white px-[15px] text-[20px] cursor-pointer hover:text-[#ffbf00]`}
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>

        <div className="nav-group-right flex items-center gap-7 text-white">
          {/* Search Icon Mobile (Tampil di Mobile) - FIX: Menggunakan warna hijau */}
          <a
            href="#"
            className={`nav-icon-link search-icon-link lg:hidden text-2xl ${COLOR_PRIMARY_GREEN_CLASS}`}
            onClick={toggleMobileSearchBar}
          >
            <i className="fas fa-search text-2xl"></i>
          </a>

          {/* Cart Link - FIX: Menggunakan warna hijau */}
          <Link
            href="/cart"
            className={`nav-icon-link relative flex items-center text-[24px] font-bold pt-[5px] ${COLOR_PRIMARY_GREEN_CLASS} hover:text-[#ffbf00]`}
          >
            <i className="fas fa-shopping-cart text-2xl "></i>
            <span className="hidden md:inline ml-2">Keranjang</span>
            {count > 0 && (
              <span
                className={`absolute top-[-5px] right-[-10px] bg-[#ef4444] text-white rounded-full px-[7px] text-[14px] font-['Lilita_One'] leading-none flex items-center justify-center`}
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          {/* AKUN / LOGIN BUTTONS */}
          {isLoadingAuth ? (
            <div className="w-20 h-8 bg-gray-600 rounded animate-pulse"></div>
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
                className={`bg-[${COLORS.YELLOW}] text-[${COLORS.TEXT_DARK}] px-3 py-1 rounded-[30px] hover:bg-[${COLORS.GREEN}] hover:text-white transition-colors text-[24px] font-bold`}
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
                // FIX: Tambahkan COLOR_PRIMARY_GREEN_CLASS ke Akun Saya
                className={`nav-icon-link my-account flex items-center text-[24px] font-bold pt-[5px] cursor-pointer ${COLOR_PRIMARY_GREEN_CLASS}`}
              >
                {/* Placeholder Avatar */}
                <img
                  src="/next.svg"
                  alt="User Avatar"
                  className="w-[30px] h-[30px] rounded-full mr-[5px] object-cover brightness-125"
                />
                <span className="hidden md:inline font-bold">Akun Saya</span>
                <i className="fas fa-caret-down ml-1 text-sm"></i>
              </a>

              {/* Dropdown Menu (Account) */}
              <div
                className={`absolute top-full right-0 mt-2 w-[250px] bg-[${
                  COLORS.DROPDOWN_BG
                }] rounded-lg shadow-xl p-0 z-[100] ${
                  isAccountOpen ? "block" : "hidden"
                }`}
              >
                <div className="dropdown-header text-center p-[15px] border-b border-gray-700">
                  <img
                    src="/next.svg"
                    alt="User Avatar"
                    className="w-12 h-12 rounded-full mx-auto mb-[5px] brightness-125"
                  />
                  <h4 className="text-[26px] font-extrabold text-white m-0 leading-none">
                    Halo, {userName.split(" ")[0]}
                  </h4>
                  <p className="text-[18px] text-[#9ca3af] m-0 leading-none">
                    {userEmail}
                  </p>
                </div>

                <ul className="dropdown-menu-list list-none p-[10px] m-0 text-[22px] font-bold">
                  {/* FIX: Ikon di dropdown sudah hijau, memastikan kode ini dipertahankan */}
                  <li>
                    <Link
                      href="#"
                      className="flex items-center p-2 text-white hover:bg-[#374151]"
                    >
                      <i
                        className={`fas fa-user-circle ${COLOR_PRIMARY_GREEN_CLASS} mr-3 text-xl`}
                      ></i>{" "}
                      Akun Saya
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="flex items-center p-2 text-white hover:bg-[#374151]"
                    >
                      <i
                        className={`fas fa-wallet ${COLOR_PRIMARY_GREEN_CLASS} mr-3 text-xl`}
                      ></i>{" "}
                      Dompet Saya
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="flex items-center p-2 text-white hover:bg-[#374151]"
                    >
                      <i
                        className={`fas fa-truck-moving ${COLOR_PRIMARY_GREEN_CLASS} mr-3 text-xl`}
                      ></i>{" "}
                      Pesanan Saya
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="flex items-center p-2 text-white hover:bg-[#374151]"
                    >
                      <i
                        className={`fas fa-home ${COLOR_PRIMARY_GREEN_CLASS} mr-3 text-xl`}
                      ></i>{" "}
                      Alamat Pengiriman
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="flex items-center p-2 text-white hover:bg-[#374151]"
                    >
                      <i
                        className={`fas fa-cog ${COLOR_PRIMARY_GREEN_CLASS} mr-3 text-xl`}
                      ></i>{" "}
                      Pengaturan
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="flex items-center p-2 text-white hover:bg-[#374151]"
                    >
                      <i
                        className={`fas fa-question-circle ${COLOR_PRIMARY_GREEN_CLASS} mr-3 text-xl`}
                      ></i>{" "}
                      Bantuan
                    </Link>
                  </li>

                  <li className="log-out border-t border-gray-700 mt-2 pt-2">
                    <button
                      onClick={logout}
                      className="w-full flex items-center p-2 text-red-500 hover:bg-[#374151]"
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

      {/* ------------------------------------------------------------------ */}
      {/* BARIS BAWAH (KATEGORI LINKS) - Warna Terang Non-Putih */}
      {/* ------------------------------------------------------------------ */}
      <div
        className={`nav-bottom bg-[${COLORS.NAV_LIGHT_BG}] border-t border-[#e5e7eb] h-[50px] px-4 md:px-10 flex items-center justify-between relative`}
      >
        {/* Mobile Menu Text (Tampil di Mobile) */}
        <div className="mobile-bottom-menu-wrapper flex w-full justify-between items-center md:hidden">
          <div
            className={`mobile-menu-text flex items-center text-[24px] font-bold cursor-pointer ${COLOR_TEXT_DARK_CLASS}`}
            onClick={toggleMobileCategoryMenu}
          >
            <i className="fas fa-bars mr-2 text-xl"></i>{" "}
            <span className="font-bold">Menu Kategori</span>
          </div>
        </div>

        {/* Desktop Category Links */}
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
            Vitamin Kucing
          </Link>
          <Link href="#" className="hover:text-[#44af7c]">
            Grooming
          </Link>
          <Link href="#" className="hover:text-[#44af7c]">
            Ide Hadiah
          </Link>
        </div>

        {/* KATEGORI MOBILE DROPDOWN CONTAINER */}
        <div
          id="mobile-category-menu"
          className={`mobile-category-list absolute top-full left-0 right-0 w-full bg-[${
            COLORS.DROPDOWN_BG
          }] shadow-xl z-50 ${
            isCategoryMobileOpen ? "block" : "hidden"
          } md:hidden`}
        >
          <ul className="list-none p-0 m-0 text-[24px] font-bold">
            <li>
              <Link
                href="/"
                className="block p-3 text-white hover:bg-[#374151] hover:text-[#44af7c]"
              >
                Beranda
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className="block p-3 text-white hover:bg-[#374151] hover:text-[#44af7c]"
              >
                Semua Produk
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="block p-3 text-white hover:bg-[#374151] hover:text-[#44af7c]"
              >
                Vitamin Kucing
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="block p-3 text-white hover:bg-[#374151] hover:text-[#44af7c]"
              >
                Grooming
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="block p-3 text-white hover:bg-[#374151] hover:text-[#44af7c]"
              >
                Ide Hadiah
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
