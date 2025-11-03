"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import { showSwalAlert } from "../lib/swalHelper";
import Link from "next/link";
import Swal from "sweetalert2";

// [MODIFIKASI] Helper (Gunakan underscore agar konsisten dengan DB)
const getStatusStyle = (status) => {
  switch (status) {
    case "Selesai":
      return "bg-green-100 text-green-700";
    case "Dikirim":
      return "bg-blue-100 text-blue-700";
    case "Dikemas":
      return "bg-indigo-100 text-indigo-700";
    case "Diproses":
      return "bg-purple-100 text-purple-700";
    case "Dibatalkan":
      return "bg-red-100 text-red-700";
    case "Menunggu_Pembayaran":
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};
// Helper lain (tidak berubah)
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

  // Fungsi untuk menghapus order (Tidak berubah)
  const handleDeleteOrder = async (e, orderId) => {
    e.stopPropagation();
    e.preventDefault();

    const result = await Swal.fire({
      title: "Hapus Riwayat?",
      text: `Anda yakin ingin menghapus riwayat pesanan #${orderId}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await axios.delete(`http://localhost:4000/orders/${orderId}`, {
        withCredentials: true,
      });
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );
      showSwalAlert(
        "Berhasil Dihapus",
        `Riwayat pesanan #${orderId} telah dihapus.`,
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

                // [LOGIKA BARU] Tentukan apakah tombol hapus boleh tampil
                const canDelete =
                  order.status === "Selesai" || order.status === "Dibatalkan";

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-lg shadow border flex flex-col sm:flex-row gap-4 items-center p-4"
                  >
                    {/* Preview Gambar */}
                    <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
                      {firstItem?.image ? (
                        <img
                          src={firstItem.image}
                          alt={firstItem.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <span>No Image</span>
                      )}
                    </div>

                    {/* Info Order (Dibungkus Link) */}
                    <Link
                      href={`/order/${order.id}`}
                      className="flex-1 block hover:bg-gray-50 p-2 rounded -m-2"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-lg text-[#2b2b2b]">
                          Order #{order.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusStyle}`}
                        >
                          {order.status.replace("_", " ")}
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
                    </Link>

                    {/* [MODIFIKASI] Tombol Hapus (Hanya tampil jika Selesai/Dibatalkan) */}
                    <div className="self-center ml-auto pl-2">
                      {canDelete && (
                        <button
                          onClick={(e) => handleDeleteOrder(e, order.id)}
                          className="text-gray-400 hover:text-red-600 p-2"
                          title="Hapus riwayat pesanan"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      )}
                      {!canDelete && (
                        // Tampilkan panah jika tidak bisa dihapus, agar tetap konsisten
                        <Link
                          href={`/order/${order.id}`}
                          className="text-gray-400 p-2"
                        >
                          <i className="fas fa-chevron-right"></i>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
      </div>
    </>
  );
}
