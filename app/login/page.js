"use client";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import { showSwalAlert } from "../lib/swalHelper"; // <-- Import SwalAlert Helper

// Definisikan konstanta warna
const COLOR_PRIMARY_GREEN = "text-[#44af7c]";
const COLOR_PRIMARY_YELLOW_BG = "bg-[#ffbf00]";
const COLOR_LIGHT_GREEN_BG = "bg-[#e8f5ef]";
const COLOR_TEXT_DARK = "text-[#2b2b2b]";
const COLOR_BTN_DEFAULT =
  "bg-[#44af7c] text-white hover:bg-[#ffbf00] hover:text-[#2b2b2b]";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const onSubmit = async (data) => {
    if (!data.email || !data.password) {
      setServerError("Email dan kata sandi diperlukan.");
      return;
    }
    try {
      setLoading(true);
      setServerError(null);
      const res = await axios.post("http://localhost:4000/auth/login", data, {
        withCredentials: true,
      });

      try {
        const devToken = res?.data?.token;
        if (devToken && typeof window !== "undefined") {
          sessionStorage.setItem("dev_token", devToken);
          axios.defaults.headers.common["Authorization"] = `Bearer ${devToken}`;
        }
      } catch (e) {}

      if (typeof window !== "undefined")
        window.dispatchEvent(new Event("authChanged"));

      // GANTI TOAST DENGAN SWALALERT SUKSES
      showSwalAlert("Login Berhasil!", "Selamat datang kembali!", "success");

      router.push("/");
    } catch (err) {
      console.error("Login error:", err?.response || err);
      const status = err?.response?.status;
      const msg = err?.response?.data?.error || "Gagal masuk.";
      const alertMsg = status ? `(${status}) ${msg}` : msg;

      setServerError(alertMsg);
      // GANTI TOAST DENGAN SWALALERT ERROR
      showSwalAlert("Gagal Login", alertMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const emailRegister = register("email", {
    required: true,
    pattern: /^\S+@\S+$/i,
  });
  const passwordRegister = register("password", { required: true });

  return (
    <>
      <Header />
      {/* Tambahkan padding-top untuk mengimbangi fixed header */}
      <section
        className={`auth-section ${COLOR_LIGHT_GREEN_BG} flex min-h-screen items-center justify-center p-10 md:p-16 pt-[120px]`}
      >
        {/* auth-card */}
        <div
          className={`max-w-md w-full bg-white p-10 rounded-xl shadow-2xl text-center border-t-8 border-[#44af7c] transition-all duration-600 ease-in-out`}
        >
          <div className="auth-header mb-8">
            {/* auth-icon-circle */}
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${COLOR_PRIMARY_YELLOW_BG}`}
            >
              <i
                className={`fas fa-sign-in-alt text-4xl ${COLOR_TEXT_DARK}`}
              ></i>
            </div>

            <h2
              className={`text-4xl sm:text-5xl font-extrabold ${COLOR_PRIMARY_GREEN} mb-2`}
            >
              Masuk ke Akun Anda
            </h2>

            <p className={`text-2xl ${COLOR_TEXT_DARK} opacity-80 m-0`}>
              Selamat datang kembali!
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            {/* Input: Email */}
            <div className="input-group text-left mb-5">
              <label
                htmlFor="email"
                className={`block text-xl font-bold ${COLOR_TEXT_DARK} mb-1 leading-none`}
              >
                <i
                  className={`fas fa-envelope ${COLOR_PRIMARY_GREEN} mr-2 text-lg`}
                ></i>{" "}
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="nama@email.com"
                required
                {...emailRegister}
                ref={(e) => {
                  emailRegister.ref(e);
                  emailRef.current = e;
                }}
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-[#ffbf00] focus:shadow-md transition-all duration-300 outline-none"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">
                  Email wajib diisi dan harus valid.
                </p>
              )}
            </div>

            {/* Input: Kata Sandi */}
            <div className="input-group text-left mb-5 relative">
              <label
                htmlFor="password"
                className={`block text-xl font-bold ${COLOR_TEXT_DARK} mb-1 leading-none`}
              >
                <i
                  className={`fas fa-lock ${COLOR_PRIMARY_GREEN} mr-2 text-lg`}
                ></i>{" "}
                Kata Sandi
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Kata sandi Anda"
                required
                {...passwordRegister}
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg pr-12 focus:border-[#ffbf00] focus:shadow-md transition-all duration-300 outline-none"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 mt-3 text-sm text-gray-500 hover:text-[#44af7c]"
                aria-pressed={showPassword}
              >
                <i
                  className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                ></i>
              </button>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">
                  Kata sandi wajib diisi.
                </p>
              )}
            </div>

            <div className="login-cta">
              <button
                type="submit"
                disabled={loading}
                className={`auth-btn w-full ${COLOR_BTN_DEFAULT} font-extrabold py-3 px-5 rounded-full text-2xl cursor-pointer transition-all duration-300 mt-3 shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? "Memuat..." : "Masuk"}
              </button>
              {serverError && (
                <p className="text-red-600 text-lg mt-3">{serverError}</p>
              )}
            </div>
          </form>

          <div className="auth-footer mt-6">
            <p className="text-xl m-0">
              Belum punya akun?
              <Link
                href="/register"
                className="text-[#44af7c] font-bold ml-1 hover:text-[#ffbf00] hover:underline transition-colors duration-300"
              >
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
