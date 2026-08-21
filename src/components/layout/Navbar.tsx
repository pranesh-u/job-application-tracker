"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  LayoutDashboard,
  FileText,
  Calendar,
  BarChart3,
  Lightbulb,
  Map,
  Menu,
  X,
  Settings,
  Home as HomeIcon,
} from "lucide-react";

const navItems = [
  { href: "/board", label: "Board", icon: LayoutDashboard },
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/roadmap", label: "Roadmap", icon: Map },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-14"
        style={{
          background: "var(--color-bg-secondary)",
          borderBottom: "1px solid var(--color-border-secondary)",
        }}
      >
        <div className="flex items-center justify-between h-full px-4 lg:px-6 max-w-[1920px] mx-auto">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "var(--color-accent-primary)" }}
            >
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white hidden sm:block">
              CareerPulse <span style={{ color: "var(--color-accent-primary)" }}>AI</span>
            </span>
          </Link>

          {/* Center: Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center gap-1 flex-1">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors
                ${pathname === "/" ? "" : "hover:bg-[var(--color-bg-hover)]"}
              `}
              style={
                pathname === "/"
                  ? {
                      background: "rgba(99, 102, 241, 0.1)",
                      color: "var(--color-accent-primary)",
                    }
                  : {
                      color: "var(--color-text-secondary)",
                    }
              }
            >
              <HomeIcon className="w-4 h-4 shrink-0" />
              <span>Home</span>
            </Link>

            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors
                    ${isActive ? "" : "hover:bg-[var(--color-bg-hover)]"}
                  `}
                  style={
                    isActive
                      ? {
                          background: "rgba(99, 102, 241, 0.1)",
                          color: "var(--color-accent-primary)",
                        }
                      : {
                          color: "var(--color-text-secondary)",
                        }
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right: User Badge & Settings */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Link
              href="/settings"
              className="p-1.5 rounded-md transition-colors hover:bg-[var(--color-bg-hover)]"
              style={{ color: "var(--color-text-tertiary)" }}
              title="Settings"
            >
              <Settings className="w-4 h-4 shrink-0" />
            </Link>

            <div className="flex items-center gap-2 pl-2 ml-1" style={{ borderLeft: "1px solid var(--color-border-secondary)" }}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold text-white"
                style={{ background: "var(--color-accent-primary)" }}
              >
                DU
              </div>
              <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
                Demo Workspace
              </span>
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-md transition-colors cursor-pointer hover:bg-[var(--color-bg-hover)]"
            style={{ border: "1px solid var(--color-border-secondary)" }}
          >
            <Menu className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />
          </button>
        </div>
      </nav>

      {/* Mobile Overlay & Menu */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[60] bg-black/40"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-60 p-4 flex flex-col"
            style={{
              background: "var(--color-bg-secondary)",
              borderLeft: "1px solid var(--color-border-secondary)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md transition-colors hover:bg-[var(--color-bg-hover)]"
              >
                <X className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
                style={
                  pathname === "/"
                    ? {
                        background: "rgba(99, 102, 241, 0.1)",
                        color: "var(--color-accent-primary)",
                      }
                    : {
                        color: "var(--color-text-secondary)",
                      }
                }
              >
                <HomeIcon className="w-4 h-4 shrink-0" />
                <span>Home</span>
              </Link>

              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
                    style={
                      isActive
                        ? {
                            background: "rgba(99, 102, 241, 0.1)",
                            color: "var(--color-accent-primary)",
                          }
                        : {
                            color: "var(--color-text-secondary)",
                          }
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 space-y-3" style={{ borderTop: "1px solid var(--color-border-secondary)" }}>
              <Link
                href="/settings"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-[var(--color-bg-hover)]"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
