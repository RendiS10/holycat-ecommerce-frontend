"use client";
import { useEffect, useState, useMemo } from "react"; // Tambahkan useMemo
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation"; // Tambahkan useSearchParams
import Header from "../components/Header";
import { showSwalAlert } from "../lib/swalHelper";
import Link from "next/link";

export default function CheckoutPage() {
  const [cart, setCart] = useState(null); // Tetap fetch semua cart
  const [user, setUser] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const router = useRouter();
  const searchParams = useSearchParams(); // Hook untuk baca query params

  // Ambil ID item yang dipilih dari URL
  const selectedItemIds = useMemo(() => {
    const itemsParam = searchParams.get("items");
    // Ubah string "19,20,..." menjadi array angka [19, 20, ...]
    return itemsParam
      ? itemsParam
          .split(",")
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id))
      : [];
  }, [searchParams]);

  // Fetch Cart Data (tetap fetch semua, filter nanti)
  useEffect(() => {
    const fetchCart = async () => {
      setLoadingCart(true);
      try {
        const res = await axios.get("http://localhost:4000/cart", {
          withCredentials: true,
        });
        // Validasi awal: apakah cart punya item
        if (!res.data || res.data.items.length === 0) {
          showSwalAlert(
            "Keranjang Kosong",
            "Tidak ada item di keranjang.",
            "warning"
          );
          router.push("/cart");
          return;
        }
        setCart(res.data);
      } catch (err) {
        console.error("Fetch cart error:", err);
        if (err?.response?.status === 401) {
          router.push(
            "/login?redirect=/checkout" +
              (searchParams.get("items")
                ? `?items=${searchParams.get("items")}`
                : "")
          );
        } else {
          setError("Gagal memuat data keranjang.");
        }
      } finally {
        setLoadingCart(false);
      }
    };
    fetchCart();
  }, [router, searchParams]); // Tambahkan searchParams dependency

  // Fetch User Data (tidak berubah)
  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const res = await axios.get("http://localhost:4000/auth/me", {
          withCredentials: true,
        });
        setUser(res.data);
      } catch (err) {
        console.error("Fetch user error:", err);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  // --- FILTER ITEM & HITUNG TOTAL YANG DIPILIH ---
  const { itemsToCheckout, checkoutTotal } = useMemo(() => {
    if (!cart || !cart.items || selectedItemIds.length === 0) {
      return { itemsToCheckout: [], checkoutTotal: "0.00" };
    }

    const filteredItems = cart.items.filter((item) =>
      selectedItemIds.includes(item.id)
    );

    // Validasi kedua: apakah item yang dipilih ada di keranjang?
    if (filteredItems.length === 0 && cart.items.length > 0) {
      console.warn("Item yang dipilih tidak ditemukan di keranjang.");
      // Mungkin redirect kembali ke cart atau tampilkan pesan
      // Untuk sekarang, kita anggap ini error sementara
      setError("Item yang dipilih tidak valid.");
      return { itemsToCheckout: [], checkoutTotal: "0.00" };
    }

    const total = filteredItems.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    return {
      itemsToCheckout: filteredItems,
      checkoutTotal: total.toFixed(2),
    };
  }, [cart, selectedItemIds]); // Kalkulasi ulang jika cart atau ID terpilih berubah

  // Handle Place Order (Kirim ID terpilih ke backend)
  const handlePlaceOrder = async () => {
    // Validasi ulang sebelum kirim
    if (itemsToCheckout.length === 0) {
      showSwalAlert(
        "Error",
        "Tidak ada item valid yang dipilih untuk checkout.",
        "error"
      );
      return;
    }
    if (!user?.address) {
      showSwalAlert(
        "Alamat Belum Lengkap",
        "Harap lengkapi alamat pengiriman di profil Anda.",
        "warning"
      );
      return;
    }

    setPlacingOrder(true);
    setError(null);
    try {
      // ==> PERUBAHAN DI SINI: Kirim array cartItemIds <==
      const res = await axios.post(
        "http://localhost:4000/orders/create",
        {
          paymentMethod,
          cartItemIds: selectedItemIds, // Kirim ID item yang dipilih
        },
        { withCredentials: true }
      );

      window.dispatchEvent(new Event("cartUpdated"));
      router.push(`/order/${res.data.orderId}`);
    } catch (err) {
      console.error("Place order error:", err);
      const msg =
        err?.response?.data?.error || "Terjadi kesalahan saat membuat pesanan.";
      setError(msg);
      showSwalAlert("Gagal Membuat Pesanan", msg, "error");
    } finally {
      setPlacingOrder(false);
    }
  };

  const isLoading = loadingCart || loadingUser;

  // Render Loading atau Error
  if (isLoading)
    return (
      <>
        {" "}
        <Header />{" "}
        <div className="p-6 pt-[140px] max-w-4xl mx-auto text-center">
          Loading checkout data...
        </div>{" "}
      </>
    );
  if (error)
    return (
      <>
        {" "}
        <Header />{" "}
        <div className="p-6 pt-[140px] max-w-4xl mx-auto text-center">
          <p className="text-red-600">Error: {error}</p>
          <Link href="/cart" className="text-blue-600 hover:underline mt-2">
            Kembali ke Keranjang
          </Link>
        </div>{" "}
      </>
    );
  // Jika itemsToCheckout kosong setelah loading selesai (karena tidak valid/tidak ada)
  if (!isLoading && itemsToCheckout.length === 0 && cart) {
    return (
      <>
        {" "}
        <Header />{" "}
        <div className="p-6 pt-[140px] max-w-4xl mx-auto text-center">
          <p className="text-orange-600">
            Tidak ada item yang dipilih untuk checkout.
          </p>
          <Link href="/cart" className="text-blue-600 hover:underline mt-2">
            Kembali ke Keranjang
          </Link>
        </div>{" "}
      </>
    );
  }

  // Render Checkout Page
  return (
    <>
      <Header />
      <div className="p-6 pt-[140px] max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#2b2b2b]">Checkout</h1>

        {/* Cek jika user sudah ada sebelum render bagian utama */}
        {cart && user && itemsToCheckout.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Kolom Kiri: Ringkasan & Pembayaran */}
            <div className="md:col-span-2 space-y-6">
              {/* Ringkasan Keranjang (Hanya item terpilih) */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 text-[#44af7c]">
                  Ringkasan Belanja ({itemsToCheckout.length} Item)
                </h2>
                <ul className="space-y-3">
                  {/* ==> PERUBAHAN DI SINI: Loop itemsToCheckout <== */}
                  {itemsToCheckout.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span>
                        {item.product.title} (x{item.quantity})
                      </span>
                      <span className="font-medium">
                        ${(item.quantity * item.product.price).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
                <hr className="my-4" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  {/* ==> PERUBAHAN DI SINI: Gunakan checkoutTotal <== */}
                  <span>${checkoutTotal}</span>
                </div>
              </div>

              {/* Metode Pembayaran (Tidak berubah) */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 text-[#44af7c]">
                  Metode Pembayaran
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    {" "}
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />{" "}
                    Cash on Delivery (COD){" "}
                  </label>
                  <label className="flex items-center cursor-pointer">
                    {" "}
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK_TRANSFER"
                      checked={paymentMethod === "BANK_TRANSFER"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2"
                    />{" "}
                    Bank Transfer{" "}
                  </label>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Alamat & Tombol Order (Tidak banyak berubah) */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 text-[#44af7c]">
                  Alamat Pengiriman
                </h2>
                {user.address || user.city /* ... Tampilkan alamat ... */ ? (
                  <>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">
                      {user.phone || "No phone number"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {user.address || "No address"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {user.city || "No city"}
                    </p>
                    <Link
                      href="/profile"
                      className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                    >
                      {" "}
                      Ubah Alamat{" "}
                    </Link>
                  </>
                ) : (
                  /* ... Tampilkan link ke profil ... */
                  <>
                    <p className="text-sm text-gray-600 mb-2">
                      Alamat belum diatur.
                    </p>
                    <Link
                      href="/profile"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {" "}
                      Atur Alamat di Profil{" "}
                    </Link>
                  </>
                )}
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || !user.address}
                className="w-full bg-[#ffbf00] text-[#2b2b2b] font-bold py-3 rounded-lg hover:bg-[#44af7c] hover:text-white transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placingOrder ? "Memproses..." : "Buat Pesanan"}
              </button>
              {!user.address && (
                <p className="text-xs text-red-500 text-center mt-1">
                  {" "}
                  Harap lengkapi alamat di profil Anda.{" "}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
