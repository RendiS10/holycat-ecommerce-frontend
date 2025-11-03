"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Header from "../../components/Header";
import { showSwalAlert } from "../../lib/swalHelper";
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
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("id-ID", options);
};

// [MODIFIKASI] Komponen baru untuk Upload Bukti Bayar (File)
function PaymentUploadForm({ orderId, onUploadSuccess }) {
  const [proofFile, setProofFile] = useState(null); // State untuk file
  const [isUploading, setIsUploading] = useState(false);

  // Handler saat file dipilih
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      // Validasi 5MB
      showSwalAlert(
        "File Terlalu Besar",
        "Ukuran file maksimal adalah 5MB.",
        "error"
      );
      e.target.value = null; // Reset input file
      setProofFile(null);
      return;
    }
    setProofFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofFile) {
      showSwalAlert("Error", "Pilih file gambar bukti pembayaran.", "error");
      return;
    }

    setIsUploading(true);

    // Buat FormData untuk mengirim file
    const formData = new FormData();
    formData.append("proofImage", proofFile); // 'proofImage' harus sama dengan di backend

    try {
      const res = await axios.put(
        `http://localhost:4000/orders/${orderId}/submit-proof`,
        formData, // Kirim formData
        {
          headers: {
            "Content-Type": "multipart/form-data", // Set header
          },
          withCredentials: true,
        }
      );
      showSwalAlert("Berhasil", "Bukti pembayaran telah diunggah.", "success");
      onUploadSuccess(res.data); // Update order state di parent
    } catch (err) {
      console.error("Submit proof error:", err);
      const msg = err?.response?.data?.error || "Gagal mengunggah bukti.";
      showSwalAlert("Gagal", msg, "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-6 text-center border-t pt-6">
      <p className="text-sm text-gray-600 mb-3">
        Silakan lakukan pembayaran dan unggah bukti (Maks 5MB: .jpg, .png,
        .gif).
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2 justify-center"
      >
        <input
          type="file"
          onChange={handleFileChange}
          disabled={isUploading}
          className="flex-grow p-2 border rounded-lg text-sm
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
          accept="image/png, image/jpeg, image/jpg, image/gif" // Batasi tipe file
          required
        />
        <button
          type="submit"
          disabled={isUploading || !proofFile} // Disable jika tidak ada file
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {isUploading ? "Mengunggah..." : "Kirim Bukti"}
        </button>
      </form>
      {/* Tampilkan nama file yang dipilih */}
      {proofFile && (
        <p className="text-xs text-gray-500 mt-2">File: {proofFile.name}</p>
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  const fetchOrder = useCallback(async () => {
    // ... (Fungsi ini tidak berubah) ...
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
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Handler pembatalan (logika dipindah ke backend)
  const handleCancelOrder = async () => {
    // ... (Fungsi ini tidak berubah) ...
    const result = await Swal.fire({
      title: "Batalkan Pesanan?",
      text: "Anda yakin ingin membatalkan pesanan ini? Stok akan dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Batalkan!",
      cancelButtonText: "Tidak",
    });
    if (!result.isConfirmed) return;
    setCancelling(true);
    setError(null);
    try {
      const res = await axios.put(
        `http://localhost:4000/orders/${orderId}/cancel`,
        {},
        { withCredentials: true }
      );
      setOrder(res.data);
      showSwalAlert(
        "Pesanan Dibatalkan",
        "Pesanan Anda telah berhasil dibatalkan.",
        "success"
      );
    } catch (err) {
      console.error("Cancel order error:", err);
      const msg = err?.response?.data?.error || "Gagal membatalkan pesanan.";
      setError(msg);
      showSwalAlert("Gagal", msg, "error");
    } finally {
      setCancelling(false);
    }
  };

  // Handler untuk sukses upload bukti bayar
  const onUploadSuccess = (updatedOrder) => {
    setOrder(updatedOrder);
  };

  // Render Loading / Error (Tidak berubah)
  if (loading) {
    return (
      <>
        {" "}
        <Header />{" "}
        <div className="p-6 pt-[140px] max-w-2xl mx-auto text-center">
          {" "}
          Loading Order Details...{" "}
        </div>{" "}
      </>
    );
  }
  if (error && !order) {
    return (
      <>
        {" "}
        <Header />{" "}
        <div className="p-6 pt-[140px] max-w-2xl mx-auto text-center">
          {" "}
          <p className="text-red-600 text-xl">{error}</p>{" "}
          <Link
            href="/"
            className="text-blue-600 hover:underline mt-4 inline-block"
          >
            {" "}
            Kembali ke Beranda{" "}
          </Link>{" "}
        </div>{" "}
      </>
    );
  }
  if (!order) {
    return null;
  }

  // Tampilkan Detail Order
  const statusStyle = getStatusStyle(order.status);

  const canCancel =
    (order.paymentMethod !== "COD" && order.status === "Menunggu_Pembayaran") ||
    (order.paymentMethod === "COD" && order.status === "Diproses");

  const showUploadForm =
    order.paymentMethod !== "COD" && order.status === "Menunggu_Pembayaran";

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
                {order.status.replace("_", " ")}{" "}
                {/* Ganti underscore dgn spasi */}
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

          {/* [BARU] Tampilkan Bukti Bayar jika sudah diunggah */}
          {order.paymentProofUrl && (
            <div>
              <h2 className="text-lg font-semibold text-[#44af7c]">
                Bukti Pembayaran
              </h2>
              <a
                href={order.paymentProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {/* Tampilkan link yang bisa diklik */}
                Lihat Bukti Pembayaran (Klik)
              </a>
            </div>
          )}

          {/* Alamat Pengiriman (Tidak berubah) */}
          <div>
            <h2 className="text-lg font-semibold mb-2 text-[#44af7c]">
              Alamat Pengiriman
            </h2>
            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
              {order.user ? (
                <>
                  <p className="font-medium">{order.user.name}</p>
                  <p>{order.user.phone || "-"}</p>
                  <p>{order.user.address || "-"}</p>
                  <p>{order.user.city || "-"}</p>
                </>
              ) : (
                <p>Informasi pengguna tidak tersedia.</p>
              )}
            </div>
          </div>

          {/* Daftar Item (Tidak berubah) */}
          <div>
            <h2 className="text-lg font-semibold mb-2 text-[#44af7c]">
              Item Dipesan
            </h2>
            <ul className="divide-y divide-gray-200 border rounded">
              {order.items && Array.isArray(order.items) ? (
                order.items.map((item) => (
                  <li key={item.id} className="flex items-center p-3 gap-3">
                    <img
                      src={item.product?.image || "/next.svg"}
                      alt={item.product?.title || "Produk"}
                      className="w-12 h-12 object-cover rounded flex-shrink-0 bg-gray-100"
                    />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">
                        {item.product?.title || "Produk tidak tersedia"}
                      </p>
                      <p className="text-gray-500">Jumlah: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-semibold text-right">
                      <p>{formatCurrency(item.price * item.quantity)}</p>
                      <p className="text-xs text-gray-400">
                        ({formatCurrency(item.price)}/item)
                      </p>
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-3 text-sm text-gray-500">
                  Tidak ada item dalam pesanan ini.
                </li>
              )}
            </ul>
          </div>

          {/* Total (Tidak berubah) */}
          <div className="text-right border-t pt-4">
            <p className="text-xl font-bold text-[#2b2b2b]">
              Total: {formatCurrency(order.total)}
            </p>
          </div>

          {/* [MODIFIKASI] Area Aksi Dinamis */}

          {/* 1. Tampilkan Form Upload jika Menunggu Pembayaran (Non-COD) & Belum Upload */}
          {showUploadForm && !order.paymentProofUrl && (
            <PaymentUploadForm
              orderId={order.id}
              onUploadSuccess={onUploadSuccess}
            />
          )}

          {/* 2. Tampilkan tombol Batal jika diizinkan */}
          {canCancel && (
            <div
              className={`mt-6 text-center ${
                !showUploadForm ? "border-t pt-6" : "pt-4"
              }`}
            >
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="bg-red-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-red-700 transition duration-200 disabled:opacity-50"
              >
                {cancelling ? "Membatalkan..." : "Batalkan Pesanan"}
              </button>
            </div>
          )}

          {/* Tampilkan error jika ada (dari pembatalan) */}
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}

          {/* Tombol kembali (Tidak berubah) */}
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
