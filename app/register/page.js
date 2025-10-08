"use client";
import { useState } from "react";
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

  const onSubmit = async (data) => {
    if (!data.name || !data.email || !data.password) {
      setServerError("Name, email and password are required");
      return;
    }
    try {
      setLoading(true);
      setServerError(null);
      await axios.post("http://localhost:4000/auth/register", data);
      router.push("/login");
    } catch (err) {
      console.error("Register error:", err?.response || err);
      const msg =
        err?.response?.data?.error || err?.response?.data || err?.message;
      setServerError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Register</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <input
          placeholder="Name"
          {...register("name", { required: true })}
          className="p-2 border"
        />
        {errors.name && (
          <span className="text-red-600 text-sm">Name is required</span>
        )}
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
          className="bg-blue-600 text-white p-2 rounded disabled:opacity-60"
        >
          {loading ? "Registering..." : "Register"}
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
