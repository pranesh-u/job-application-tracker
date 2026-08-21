"use client";

import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--color-bg-primary)" }}>
        <Navbar />
        <main className="flex-1 overflow-y-auto mt-14">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}
