"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { showSwalAlert } from "../../lib/swalHelper";
import Link from "next/link";

// Helper dari halaman orders/page.js
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};
const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
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
// Ambil semua nilai dari OrderStatus enum
const allStatuses = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // 1. Cek Autentikasi Admin
  const checkAdminAuth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:4000/auth/me", {
        withCredentials: true,
      });
      if (res.data.role !== "ADMIN") {
        throw new Error("Akses ditolak");
      }
      // Jika admin, fetch order
      await fetchOrders();
    } catch (err) {
      console.error("Auth check error:", err);
      showSwalAlert(
        "Akses Ditolak",
        "Anda harus login sebagai Admin untuk mengakses halaman ini.",
        "error"
      );
      router.push("/login?redirect=/admin/orders");
    }
  }, [router]); // fetchOrders tidak perlu jadi dependensi di sini

  // 2. Fetch Semua Order
  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:4000/admin/orders", {
        withCredentials: true,
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Fetch admin orders error:", err);
      setError("Gagal memuat pesanan.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Perubahan Status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Panggil API admin untuk update status
      const res = await axios.put(
        `http://localhost:4000/admin/orders/${orderId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );

      // Update state orders secara lokal
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: res.data.status } : order
        )
      );
      showSwalAlert(
        "Berhasil",
        `Status order #${orderId} diubah menjadi ${newStatus}`,
        "success"
      );
    } catch (err) {
      console.error("Update status error:", err);
      const msg = err?.response?.data?.error || "Gagal memperbarui status.";
      showSwalAlert("Gagal", msg, "error");
    }
  };

  // 4. Jalankan Cek Autentikasi saat halaman dimuat
  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="p-6 pt-[140px] max-w-6xl mx-auto text-center">
          Loading Admin Dashboard...
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="p-6 pt-[140px] max-w-6xl mx-auto text-center">
          <p className="text-red-600 text-xl">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="p-6 pt-[140px] max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#2b2b2b]">
          Admin: Kelola Pesanan
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-lg overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 font-semibold">Order ID</th>
                <th className="p-3 font-semibold">Tanggal</th>
                <th className="p-3 font-semibold">Pelanggan</th>
                <th className="p-3 font-semibold">Total</th>
                <th className="p-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-blue-600">
                    <Link
                      href={`/order/${order.id}`}
                      className="hover:underline"
                    >
                      #{order.id}
                    </Link>
                  </td>
                  <td className="p-3 text-gray-600">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="p-3 text-gray-700">
                    {order.user?.name || "User Dihapus"}
                  </td>
                  <td className="p-3 font-medium">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="p-3">
                    {/* Select/Dropdown untuk ubah status */}
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className={`p-1 text-xs font-medium rounded-md border-0 focus:ring-1 focus:ring-indigo-500 ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {allStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
