"use client";
import { useState } from "react";
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

  const onSubmit = async (data) => {
    // basic client-side guard
    if (!data.email || !data.password) {
      setServerError("Please enter email and password");
      return;
    }
    try {
      setLoading(true);
      setServerError(null);
      const res = await axios.post("http://localhost:4000/auth/login", data);
      const { token } = res.data;
      localStorage.setItem("token", token);
      // notify other components of auth change
      if (typeof window !== "undefined")
        window.dispatchEvent(new Event("authChanged"));
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <input
          placeholder="Email"
          {...register("email", { required: true })}
          className="p-2 border"
        />
        {errors.email && (
          <span className="text-red-600 text-sm">Email is required</span>
        )}
        <input
          placeholder="Password"
          type="password"
          {...register("password", { required: true })}
          className="p-2 border"
        />
        {errors.password && (
          <span className="text-red-600 text-sm">Password is required</span>
        )}
        <button
          disabled={loading}
          className="bg-green-600 text-white p-2 rounded disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {serverError && (
        <div className="mt-3 text-red-600 text-sm" role="alert">
          {serverError}
        </div>
      )}
    </div>
  );
}
