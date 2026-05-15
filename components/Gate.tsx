"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Gate() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Incorrect password.");
      return;
    }
    localStorage.setItem("sm_reviewer_name", name.trim());
    router.push("/gallery");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm border border-[var(--border)] rounded-lg p-6 bg-[var(--panel)]"
      >
        <h1 className="text-xl font-semibold mb-1">SM Review</h1>
        <p className="text-sm text-[var(--muted)] mb-6">
          Enter your name and the access password.
        </p>

        <label className="block text-sm mb-2">Your name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded bg-black border border-[var(--border)] focus:outline-none focus:border-[var(--accent)]"
          autoComplete="off"
        />

        <label className="block text-sm mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded bg-black border border-[var(--border)] focus:outline-none focus:border-[var(--accent)]"
        />

        {error && (
          <p className="text-sm text-red-400 mb-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded bg-[var(--accent)] text-black font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
