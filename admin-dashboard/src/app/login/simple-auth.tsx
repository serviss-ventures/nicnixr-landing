"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SimpleAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple hardcoded check
    if (email === "admin@nixrapp.com" && password === "NixrAdmin2025!") {
      // Set a simple cookie
      document.cookie = "admin_auth=true; path=/; max-age=86400"; // 24 hours
      
      // Force redirect
      window.location.href = "/";
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
          required
        />
      </div>
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
          required
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
      >
        Login
      </button>
    </form>
  );
} 