"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { showSwalAlert } from "../../lib/swalHelper";

export default function AdminLoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      // Gunakan endpoint login yang sama
      const res = await axios.post("http://localhost:4000/auth/login", data, {
        withCredentials: true,
      });

      // Cek role user setelah login berhasil
      // Kita decode token atau panggil /auth/me, tapi cara cepatnya:
      // Coba akses halaman admin, jika gagal berarti bukan admin.
      // Di sini kita akan memverifikasi via /auth/me untuk memastikan role.

      try {
        const meRes = await axios.get("http://localhost:4000/auth/me", {
          withCredentials: true,
        });
        if (meRes.data.role !== "ADMIN") {
          // Jika bukan admin, logout paksa dan tolak
          await axios.post(
            "http://localhost:4000/auth/logout",
            {},
            { withCredentials: true }
          );
          throw new Error("Akun Anda tidak memiliki akses Administrator.");
        }

        // Jika Admin, lanjut
        window.dispatchEvent(new Event("authChanged"));
        showSwalAlert("Selamat Datang Admin", "Login berhasil.", "success");
        router.push("/admin"); // Arahkan ke Dashboard Utama
      } catch (roleErr) {
        const msg = roleErr.message || "Gagal memverifikasi hak akses.";
        showSwalAlert("Akses Ditolak", msg, "error");
      }
    } catch (err) {
      const msg = err?.response?.data?.error || "Email atau password salah.";
      showSwalAlert("Gagal Login", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400">Silakan masuk untuk mengelola toko.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Email Admin
            </label>
            <input
              type="email"
              {...register("email", { required: true })}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="admin@holycat.com"
            />
            {errors.email && (
              <span className="text-red-500 text-xs">Email wajib diisi.</span>
            )}
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              {...register("password", { required: true })}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="text-red-500 text-xs">
                Password wajib diisi.
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition duration-200 disabled:opacity-50"
          >
            {loading ? "Memeriksa..." : "Masuk ke Dashboard"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-gray-500 hover:text-gray-300 text-sm">
            Kembali ke Toko
          </a>
        </div>
      </div>
    </div>
  );
}
