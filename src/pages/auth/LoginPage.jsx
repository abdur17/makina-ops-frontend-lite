import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { useAuthStore } from "../../store/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("admin@makina.local");
  const [password, setPassword] = useState("ChangeMe123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authApi.login(email, password);
      const { accessToken, refreshToken, user } = res.data.data;

      setAuth(user, accessToken, refreshToken);
      navigate("/section/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        "Login failed. Please check your email and password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/60">
        {/* Logo / heading */}
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">
            MAKINA OPS
          </div>
          <h1 className="text-2xl font-semibold mb-1">
            Sign in to Internal System
          </h1>
          <p className="text-sm text-slate-400">
            Use your MAKINA OPS credentials to continue.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-200"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm
                         text-slate-50 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-200"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm
                         text-slate-50 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/60 bg-red-950/50 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-emerald-500
                       px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-emerald-400
                       disabled:cursor-not-allowed disabled:opacity-70 transition-colors"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Helper text */}
        <div className="mt-6 text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-300">Default admin (seeded)</p>
          <p className="font-mono">
            admin@makina.local <span className="px-1">/</span> ChangeMe123!
          </p>
        </div>
      </div>
    </div>
  );
}
