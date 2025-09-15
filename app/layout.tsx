"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import "./globals.css"

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { StoreProvider } from "@/store/provider";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Show Header/Footer only outside dashboard
  const shouldShowHeaderFooter = !pathname.startsWith("/dashboard" ) && !pathname.startsWith("/admin");

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>
            <SessionProvider>
              {/* Header */}
              {shouldShowHeaderFooter && <Header />}

              {/* Main Content */}
              <main>
                {children}
              </main>

              {/* Footer */}
              {shouldShowHeaderFooter && <Footer />}

              {/* Toast Notifications */}
              <Toaster richColors closeButton position="top-right" />
            </SessionProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
