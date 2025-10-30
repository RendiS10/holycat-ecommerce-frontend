"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { showSwalAlert } from "../lib/swalHelper";
import Link from "next/link";
import Swal from "sweetalert2"; // <-- Impor Swal

// Helper (tidak berubah)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};
const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("id-ID", options);
};
const getStatusStyle = (status) => {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-700";
    case "SHIPPED":
      return "bg-blue-100 text-blue-700";
    case "COMPLETED":
      return "bg-purple-100 text-purple-700";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    case "PENDING":
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    // ... (Fungsi fetchOrders tidak berubah)
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:4000/orders", {
        withCredentials: true,
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Fetch orders error:", err);
      const status = err?.response?.status;
      if (status === 401) {
        router.push("/login?redirect=/orders");
      } else {
        setError("Gagal memuat riwayat pesanan.");
        showSwalAlert("Error", "Gagal memuat riwayat pesanan.", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // --- [BARU] Fungsi untuk menghapus order ---
  const handleDeleteOrder = async (e, orderId) => {
    // Menghentikan event klik agar tidak pindah halaman (karena tombol ada di dalam Link)
    e.stopPropagation();
    e.preventDefault();

    // Tampilkan konfirmasi
    const result = await Swal.fire({
      title: "Hapus Pesanan?",
      text: `Anda yakin ingin menghapus pesanan #${orderId}? Tindakan ini tidak dapat dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) {
      return; // Batalkan jika pengguna menekan "Batal"
    }

    try {
      // Panggil API DELETE
      await axios.delete(`http://localhost:4000/orders/${orderId}`, {
        withCredentials: true,
      });

      // Hapus order dari state lokal untuk update UI instan
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );

      showSwalAlert(
        "Berhasil Dihapus",
        `Pesanan #${orderId} telah dihapus.`,
        "success"
      );
    } catch (err) {
      console.error("Delete order error:", err);
      const msg = err?.response?.data?.error || "Gagal menghapus pesanan.";
      showSwalAlert("Gagal", msg, "error");
    }
  };

  return (
    <>
      <Header />
      <div className="p-6 pt-[140px] max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#2b2b2b]">
          Riwayat Pesanan Saya
        </h1>

        {loading && <p>Loading orders...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading &&
          !error &&
          (orders.length === 0 ? (
            <div className="text-center text-gray-600 bg-white p-8 rounded shadow">
              Anda belum memiliki riwayat pesanan.
              <Link href="/" className="text-blue-600 hover:underline ml-2">
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusStyle = getStatusStyle(order.status);
                const firstItem = order.items?.[0]?.product;
                return (
                  // Link tetap membungkus kartu, tapi tombol di dalamnya akan menghentikan propagasi klik
                  <Link
                    href={`/order/${order.id}`}
                    key={order.id}
                    className="block hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="bg-white p-4 rounded-lg shadow border flex flex-col sm:flex-row gap-4 items-center">
                      {/* Preview Gambar (tidak berubah) */}
                      {firstItem?.image && (
                        <img
                          src={firstItem.image}
                          alt={firstItem.title}
                          className="w-16 h-16 object-cover rounded bg-gray-100 flex-shrink-0"
                        />
                      )}
                      {!firstItem?.image && (
                        <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}

                      {/* Info Order (tidak berubah) */}
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-lg text-[#2b2b2b]">
                            Order #{order.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusStyle}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {formatDate(order.createdAt)} -{" "}
                          {formatCurrency(order.total)} -{" "}
                          {order.paymentMethod?.replace("_", " ") || "N/A"}
                        </p>
                        {firstItem && (
                          <p className="text-sm text-gray-600 truncate">
                            {firstItem.title}
                          </p>
                        )}
                      </div>

                      {/* [MODIFIKASI] Panah ke Detail & Tombol Hapus */}
                      <div className="self-center ml-auto flex items-center gap-4">
                        {/* Tombol Hapus Baru */}
                        <button
                          onClick={(e) => handleDeleteOrder(e, order.id)}
                          className="text-gray-400 hover:text-red-600 p-2 z-10 relative" // z-10 agar bisa diklik di atas Link
                          title="Hapus pesanan"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                        {/* Panah Navigasi */}
                        <div className="text-gray-400">
                          <i className="fas fa-chevron-right"></i>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
      </div>
    </>
  );
}
