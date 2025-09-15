"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "user";
  fallbackPath?: string;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

const DefaultLoading = (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

const DefaultError = (message: string) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = "/auth/signin",
  loadingComponent = DefaultLoading,
  errorComponent,
}) => {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated" || !session) {
      redirectToLogin();
    }
  }, [status, session]);

  function redirectToLogin() {
    const currentPath = window.location.pathname;
    const url = new URL(fallbackPath, window.location.origin);
    url.searchParams.set("callbackUrl", currentPath);
    router.push(url.pathname + url.search);
  }

  if (status === "loading") return loadingComponent;

  if (status !== "authenticated" || !session) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};
