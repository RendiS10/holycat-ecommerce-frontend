"use client";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    try {
      nameRef.current?.focus();
    } catch (e) {}
  }, []);

  const onSubmit = async (data) => {
    if (!data.name || !data.email || !data.password) {
      setServerError("Name, email and password are required");
      return;
    }
    try {
      setLoading(true);
      setServerError(null);
      await axios.post("http://localhost:4000/auth/register", data);
      // show success toast and redirect
      if (typeof window !== "undefined")
        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: {
              message: "Registered successfully. Please login.",
              type: "success",
            },
          })
        );
      router.push("/login");
    } catch (err) {
      console.error("Register error:", err?.response || err);
      const msg =
        err?.response?.data?.error || err?.response?.data || err?.message;
      const m = typeof msg === "string" ? msg : JSON.stringify(msg);
      setServerError(m);
      if (typeof window !== "undefined")
        window.dispatchEvent(
          new CustomEvent("toast", { detail: { message: m, type: "error" } })
        );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl mb-2 font-semibold">Create your account</h1>
        <p className="text-sm text-gray-600 mb-4">
          Join now to save items and checkout faster
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <input
            placeholder="Name"
            {...register("name", { required: true })}
            // PERBAIKAN: Memanggil register("name").ref(e) di dalam callback
            ref={(e) => {
              register("name").ref(e);
              nameRef.current = e;
            }}
            className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
            aria-label="Full name"
          />
          {errors.name && (
            <span className="text-red-600 text-sm">Name is required</span>
          )}
          <input
            placeholder="Email"
            {...register("email", { required: true })}
            className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
            aria-label="Email address"
            autoComplete="email"
          />
          {errors.email && (
            <span className="text-red-600 text-sm">Email is required</span>
          )}
          <div className="relative">
            <input
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              {...register("password", { required: true, minLength: 6 })}
              className="p-3 border rounded w-full pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              aria-label="Password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 px-2 py-1"
              aria-pressed={showPassword}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <span className="text-red-600 text-sm">
              Password is required (min 6 chars)
            </span>
          )}
          <button
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded disabled:opacity-60 mt-1"
          >
            {loading ? "Registering..." : "Create account"}
          </button>
        </form>
        <div className="sr-only" aria-live="polite">
          {serverError}
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 hover:underline">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
