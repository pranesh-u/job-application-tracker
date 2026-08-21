"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  BarChart3,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
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

          {/* Feature Highlights */}
          <h2 className="text-2xl font-semibold text-white mb-2 leading-tight">
            Your AI-powered<br />
            <span style={{ color: "var(--color-accent-primary)" }}>career companion</span>
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Track applications, analyze resumes, identify skill gaps, and build your path to your dream job.
          </p>

          <div className="space-y-4">
            {[
              { icon: Target, label: "Smart Resume Analysis", desc: "AI-powered ATS scoring & insights" },
              { icon: Sparkles, label: "Skill Gap Detection", desc: "Know exactly what to learn next" },
              { icon: TrendingUp, label: "Application Tracking", desc: "Visual Kanban board for your pipeline" },
              { icon: BarChart3, label: "Career Analytics", desc: "Data-driven career decisions" },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.15)" }}>
                  <feature.icon className="w-4 h-4" style={{ color: "var(--color-accent-primary)" }} />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{feature.label}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
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

          <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium transition-colors hover:underline"
              style={{ color: "var(--color-accent-primary)" }}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
