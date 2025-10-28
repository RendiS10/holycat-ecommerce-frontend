"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Header from "../../components/Header";
import { showSwalAlert } from "../../lib/swalHelper";
import Link from "next/link";

// Helper untuk format mata uang
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper untuk format tanggal
const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("id-ID", options);
};

// Helper untuk style status
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

export default function OrderDetailPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://localhost:4000/orders/${orderId}`, {
        withCredentials: true,
      });
      setOrder(res.data);
    } catch (err) {
      console.error("Fetch order error:", err);
      const status = err?.response?.status;
      if (status === 401) {
        router.push(`/login?redirect=/order/${orderId}`);
      } else if (status === 404) {
        setError("Pesanan tidak ditemukan.");
      } else if (status === 403) {
        setError("Anda tidak memiliki akses ke pesanan ini.");
      } else {
        setError("Gagal memuat detail pesanan.");
      }
      setOrder(null); // Clear order on error
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleSimulatePayment = async () => {
    setPaying(true);
    setError(null);
    try {
      // Panggil API simulasi pembayaran
      const res = await axios.put(
        `http://localhost:4000/orders/${orderId}/pay`,
        {}, // Body kosong
        { withCredentials: true }
      );
      setOrder(res.data); // Update state order dengan data baru
      showSwalAlert(
        "Pembayaran Berhasil",
        "Status pesanan telah diperbarui menjadi PAID.",
        "success"
      );
    } catch (err) {
      console.error("Simulate payment error:", err);
      const msg =
        err?.response?.data?.error || "Gagal memproses simulasi pembayaran.";
      setError(msg);
      showSwalAlert("Pembayaran Gagal", msg, "error");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="p-6 pt-[140px] max-w-2xl mx-auto text-center">
          Loading Order Details...
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="p-6 pt-[140px] max-w-2xl mx-auto text-center">
          <p className="text-red-600 text-xl">{error}</p>
          <Link
            href="/"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </>
    );
  }

  if (!order) {
    return null; // Should not happen if loading is false and no error, but safe fallback
  }

  // Tampilkan Detail Order
  const statusStyle = getStatusStyle(order.status);

  return (
    <>
      <Header />
      <div className="p-6 pt-[140px] max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-[#2b2b2b]">
          Detail Pesanan #{order.id}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Dibuat pada: {formatDate(order.createdAt)}
        </p>

        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          {/* Status & Metode Pembayaran */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#44af7c]">
                Status Pesanan
              </h2>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyle}`}
              >
                {order.status}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#44af7c]">
                Metode Pembayaran
              </h2>
              <p className="text-sm font-medium">
                {order.paymentMethod?.replace("_", " ") || "Belum Dipilih"}
              </p>
            </div>
          </div>

          {/* Alamat Pengiriman */}
          <div>
            <h2 className="text-lg font-semibold mb-2 text-[#44af7c]">
              Alamat Pengiriman
            </h2>
            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
              {/* ==> TAMBAHKAN Pemeriksaan di sini <== */}
              {order.user ? (
                <>
                  <p className="font-medium">{order.user.name}</p>
                  <p>{order.user.phone || "-"}</p>
                  <p>{order.user.address || "-"}</p>
                  <p>{order.user.city || "-"}</p>
                </>
              ) : (
                <p>Informasi pengguna tidak tersedia.</p> // Fallback jika user tidak ada
              )}
            </div>
          </div>

          {/* Daftar Item */}
          <div>
            <h2 className="text-lg font-semibold mb-2 text-[#44af7c]">
              Item Dipesan
            </h2>
            <ul className="divide-y divide-gray-200 border rounded">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center p-3 gap-3">
                  <img
                    src={item.product.image || "/next.svg"}
                    alt={item.product.title}
                    className="w-12 h-12 object-cover rounded flex-shrink-0 bg-gray-100"
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{item.product.title}</p>
                    <p className="text-gray-500">Jumlah: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-semibold text-right">
                    <p>{formatCurrency(item.price * item.quantity)}</p>
                    <p className="text-xs text-gray-400">
                      ({formatCurrency(item.price)}/item)
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Total */}
          <div className="text-right border-t pt-4">
            <p className="text-xl font-bold text-[#2b2b2b]">
              Total: {formatCurrency(order.total)}
            </p>
          </div>

          {/* Tombol Simulasi Pembayaran (jika status PENDING) */}
          {order.status === "PENDING" && (
            <div className="mt-6 text-center border-t pt-6">
              <p className="text-sm text-gray-600 mb-3">
                Ini adalah halaman konfirmasi. Klik tombol di bawah untuk
                simulasi pembayaran.
              </p>
              <button
                onClick={handleSimulatePayment}
                disabled={paying}
                className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
              >
                {paying ? "Memproses..." : "Simulasikan Pembayaran"}
              </button>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          )}

          {/* Tombol kembali */}
          <div className="mt-6 text-center">
            <Link
              href="/orders"
              className="text-sm text-gray-600 hover:text-[#44af7c]"
            >
              &larr; Lihat Semua Pesanan
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
