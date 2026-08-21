"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordChecks = [
    { label: "At least 6 characters", valid: password.length >= 6 },
    { label: "Passwords match", valid: password.length > 0 && password === confirmPassword },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // Auto-login after registration
      const { signIn } = await import("next-auth/react");
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Registration succeeded but auto-login failed - redirect to login
        router.push("/login");
      } else {
        router.push("/board");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center"
        style={{ background: "var(--color-bg-secondary)" }}>

        <div className="relative z-10 max-w-sm px-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "var(--color-accent-primary)" }}>
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">CareerAI</h1>
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Intelligence Platform</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-white mb-2 leading-tight">
            Start your<br />
            <span style={{ color: "var(--color-accent-primary)" }}>intelligent job search</span>
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Join thousands of job seekers who use AI to land their dream roles faster.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "3x", label: "Higher interview rate" },
              { value: "72%", label: "Better ATS scores" },
              { value: "150+", label: "Skills tracked" },
              { value: "Smart", label: "Learning roadmaps" },
            ].map((stat, i) => (
              <div key={i} className="p-3 rounded-md"
                style={{ 
                  background: "rgba(99, 102, 241, 0.06)", 
                  border: "1px solid rgba(99, 102, 241, 0.1)",
                }}>
                <p className="text-xl font-semibold" style={{ color: "var(--color-accent-primary)" }}>{stat.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8"
        style={{ background: "var(--color-bg-primary)" }}>
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--color-accent-primary)" }}>
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-base font-semibold text-white">CareerAI</h1>
          </div>

          <h2 className="text-xl font-semibold text-white mb-1">Create your account</h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
            Set up your AI-powered career dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-10 pr-3 py-2 rounded-md text-sm text-white placeholder-[var(--color-text-muted)] outline-none transition-colors focus:ring-1 focus:ring-[var(--color-accent-primary)]"
                  style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border-secondary)" }}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-3 py-2 rounded-md text-sm text-white placeholder-[var(--color-text-muted)] outline-none transition-colors focus:ring-1 focus:ring-[var(--color-accent-primary)]"
                  style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border-secondary)" }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2 rounded-md text-sm text-white placeholder-[var(--color-text-muted)] outline-none transition-colors focus:ring-1 focus:ring-[var(--color-accent-primary)]"
                  style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border-secondary)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors hover:bg-[var(--color-bg-hover)]"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-3 py-2 rounded-md text-sm text-white placeholder-[var(--color-text-muted)] outline-none transition-colors focus:ring-1 focus:ring-[var(--color-accent-primary)]"
                  style={{ background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border-secondary)" }}
                />
              </div>
            </div>

            {/* Password Strength Indicators */}
            {password.length > 0 && (
              <div className="space-y-1.5">
                {passwordChecks.map((check, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <CheckCircle2
                      className="w-3.5 h-3.5 transition-colors"
                      style={{ color: check.valid ? "var(--color-status-success)" : "var(--color-text-muted)" }}
                    />
                    <span style={{ color: check.valid ? "var(--color-text-secondary)" : "var(--color-text-muted)" }}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="px-3 py-2 rounded-md text-sm"
                style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)", color: "var(--color-status-error)" }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-md text-sm font-medium text-white flex items-center justify-center gap-2 transition-colors hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              style={{ background: "var(--color-accent-primary)" }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium transition-colors hover:underline"
              style={{ color: "var(--color-accent-primary)" }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
