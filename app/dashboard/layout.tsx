"use client";

import React from "react";
// Multi-tenant functionality removed - simplified layout
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Multi-tenant functionality removed - no domain handling needed

  return (
    <ProtectedRoute requiredRole="user">
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
          <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
            <DashboardNav />
          </aside>
          <main className="flex w-full flex-col overflow-hidden py-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
