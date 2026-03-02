import React, { useState } from "react";
import { login } from "../utils/api";

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 text-white min-h-[500px] flex flex-col">
      <div className="px-5 pt-8 pb-4 text-center">
        <h1 className="text-xl font-semibold tracking-tight">CortexTrack</h1>
        <p className="text-xs text-gray-500 mt-1">Sign in to sync your data</p>
      </div>

      <form onSubmit={handleSubmit} className="px-5 flex-1 flex flex-col gap-3">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs text-gray-500 block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            placeholder="Your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="px-5 py-4 text-center">
        <p className="text-[10px] text-gray-700">
          Create your account at the web dashboard
        </p>
      </div>
    </div>
  );
}
