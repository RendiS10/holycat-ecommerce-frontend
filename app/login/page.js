"use client";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";

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
    // autofocus the email input for faster login
    try {
      emailRef.current?.focus();
    } catch (e) {}
  }, []);

  const onSubmit = async (data) => {
    // basic client-side guard
    if (!data.email || !data.password) {
      setServerError("Please enter email and password");
      return;
    }
    try {
      setLoading(true);
      setServerError(null);
      const res = await axios.post("http://localhost:4000/auth/login", data, {
        withCredentials: true,
      });
      // notify other components of auth change (server set cookie)
      if (typeof window !== "undefined")
        window.dispatchEvent(new Event("authChanged"));
      // show a friendly toast
      if (typeof window !== "undefined")
        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: { message: "Welcome back!", type: "success" },
          })
        );
      router.push("/products");
    } catch (err) {
      // Log the full error for debugging (AxiosError can be nested)
      try {
        console.error("Login error (full):", err);
        console.error("Login error response:", err?.response);
      } catch (e) {
        // ignore logging failures
      }

      // Build a friendly message: prefer server error payload, then message
      const status = err?.response?.status;
      const data = err?.response?.data;
      let serverMsg = "";
      if (data) {
        if (typeof data === "string") serverMsg = data;
        else if (data.error) serverMsg = data.error;
        else {
          try {
            serverMsg = JSON.stringify(data);
          } catch (e) {
            serverMsg = String(data);
          }
        }
      } else {
        serverMsg = err?.message || "Login failed";
      }

      const alertMsg = status ? `(${status}) ${serverMsg}` : serverMsg;
      setServerError(alertMsg);
      if (typeof window !== "undefined")
        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: { message: alertMsg, type: "error" },
          })
        );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl mb-4 font-semibold">Welcome back</h1>
        <p className="text-sm text-gray-600 mb-4">Login to continue shopping</p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <input
            placeholder="Email"
            {...register("email", { required: true })}
            ref={(e) => {
              register("email").ref(e);
              emailRef.current = e;
            }}
            className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
            aria-label="Email"
            autoComplete="email"
          />
          {errors.email && (
            <span className="text-red-600 text-sm">Email is required</span>
          )}
          <div className="relative">
            <input
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              {...register("password", { required: true })}
              className="p-3 border rounded w-full pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              aria-label="Password"
              autoComplete="current-password"
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
            <span className="text-red-600 text-sm">Password is required</span>
          )}
          <button
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded disabled:opacity-60 mt-1"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {/* accessible live region for errors (also covered by toast) */}
        <div className="sr-only" aria-live="polite">
          {serverError}
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          <a href="/register" className="text-indigo-600 hover:underline">
            Create an account
          </a>
        </div>
      </div>
    </div>
  );
}
