"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Redirect to dashboard
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0A0F1C] to-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extralight tracking-[0.2em] text-white mb-2">
            NIXR
          </h1>
          <p className="text-sm font-light text-white/40">Admin Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-black/40 backdrop-blur-2xl border border-white/[0.06] rounded-2xl p-8">
          <h2 className="text-xl font-light text-white mb-6">Sign in</h2>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-light text-white/60 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/30 focus:outline-none focus:border-white/[0.12] focus:bg-white/[0.05] transition-all"
                placeholder="admin@nixr.app"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-light text-white/60 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/30 focus:outline-none focus:border-white/[0.12] focus:bg-white/[0.05] transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/40">
              Don't have access?{" "}
              <a href="mailto:admin@nixr.app" className="text-white/60 hover:text-white transition-colors">
                Contact admin
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-white/20">
            © 2025 NIXR. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
} 