"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { showSwalAlert } from "../../lib/swalHelper";
import Link from "next/link";
import Swal from "sweetalert2"; // <-- Impor Swal

// [MODIFIKASI] Helper untuk style status (sesuai Enum baru)
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
  if (!dateString) return "N/A"; // Guard clause untuk shippedAt yang mungkin null
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("id-ID", options);
};

// [MODIFIKASI] Ambil semua nilai dari OrderStatus enum baru (gunakan underscore)
const allStatuses = [
  "Menunggu_Pembayaran",
  "Diproses",
  "Dikemas",
  "Dikirim",
  "Selesai",
  "Dibatalkan",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // 1. Cek Autentikasi Admin (Tidak berubah)
  const checkAdminAuth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:4000/auth/me", {
        withCredentials: true,
      });
      if (res.data.role !== "ADMIN") {
        throw new Error("Akses ditolak");
      }
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
  }, [router]);

  // 2. Fetch Semua Order (Tidak berubah)
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

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  // 3. [MODIFIKASI] Handle Perubahan Status (Tugas 14.4)
  const handleStatusChange = async (orderId, newStatus) => {
    let payload = { status: newStatus };

    // [LOGIKA BARU] Jika status adalah "Dikirim", minta info tambahan
    if (newStatus === "Dikirim") {
      const { value: formValues } = await Swal.fire({
        title: "Masukkan Detail Pengiriman",
        html:
          '<input id="swal-input-courier" class="swal2-input" placeholder="Nama Kurir (cth: JNE)">' +
          '<input id="swal-input-tracking" class="swal2-input" placeholder="Nomor Resi">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Simpan & Kirim",
        cancelButtonText: "Batal",
        preConfirm: () => {
          const courier = document.getElementById("swal-input-courier").value;
          const trackingNumber = document.getElementById(
            "swal-input-tracking"
          ).value;
          if (!courier || !trackingNumber) {
            Swal.showValidationMessage(
              "Kurir dan Nomor Resi tidak boleh kosong"
            );
            return false;
          }
          return { courier: courier, trackingNumber: trackingNumber };
        },
      });

      // Jika pengguna mengklik "Batal"
      if (!formValues) {
        // Reset dropdown ke nilai semula
        setOrders((prevOrders) => [...prevOrders]); // Memaksa re-render untuk reset select
        return;
      }

      payload.courier = formValues.courier;
      payload.trackingNumber = formValues.trackingNumber;
    }

    // Lanjutkan memanggil API
    try {
      const res = await axios.put(
        `http://localhost:4000/admin/orders/${orderId}/status`,
        payload, // Kirim payload yang sudah lengkap
        { withCredentials: true }
      );

      // Update state orders secara lokal
      setOrders((prevOrders) =>
        prevOrders.map(
          (order) => (order.id === orderId ? res.data : order) // Ganti order lama dengan data baru
        )
      );
      showSwalAlert(
        "Berhasil",
        `Status order #${orderId} diubah menjadi ${newStatus.replace(
          "_",
          " "
        )}`,
        "success"
      );
    } catch (err) {
      console.error("Update status error:", err);
      const msg = err?.response?.data?.error || "Gagal memperbarui status.";
      showSwalAlert("Gagal", msg, "error");
      // Tidak perlu fetchOrders() di sini, state lokal akan otomatis reset
      // ke nilai lama jika `setOrders` tidak dipanggil
      setOrders((prevOrders) => [...prevOrders]); // Paksa re-render
    }
  };

  // Render (Tidak berubah)
  if (loading) {
    return (
      <>
        {" "}
        <Header />{" "}
        <div className="p-6 pt-[140px] max-w-6xl mx-auto text-center">
          {" "}
          Loading Admin Dashboard...{" "}
        </div>{" "}
      </>
    );
  }
  if (error) {
    return (
      <>
        {" "}
        <Header />{" "}
        <div className="p-6 pt-[140px] max-w-6xl mx-auto text-center">
          {" "}
          <p className="text-red-600 text-xl">{error}</p>{" "}
        </div>{" "}
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
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 font-semibold">Order ID</th>
                <th className="p-3 font-semibold">Tanggal</th>
                <th className="p-3 font-semibold">Pelanggan</th>
                <th className="p-3 font-semibold">Total</th>
                <th className="p-3 font-semibold">Metode</th>
                <th className="p-3 font-semibold">Bukti Bayar</th>
                <th className="p-3 font-semibold">Info Resi</th>{" "}
                {/* KOLOM BARU */}
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
                  <td className="p-3 text-gray-600">
                    {order.paymentMethod?.replace("_", " ") || "N/A"}
                  </td>
                  <td className="p-3">
                    {order.paymentProofUrl ? (
                      <a
                        href={order.paymentProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Lihat Bukti
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">N/A</span>
                    )}
                  </td>
                  {/* [BARU] Tampilkan Info Resi */}
                  <td className="p-3 text-xs">
                    {order.trackingNumber ? (
                      <div className="font-medium">
                        {order.courier}:{" "}
                        <span className="text-gray-700">
                          {order.trackingNumber}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Belum ada</span>
                    )}
                  </td>
                  <td className="p-3">
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
                          {status.replace("_", " ")}
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
