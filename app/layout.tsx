import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/client-layout";

export const metadata: Metadata = {
  title: {
    default: "Naya Bazar - Modern E-Commerce Store",
    template: "%s | Naya Bazar",
  },
  description:
    "Naya Bazar is a modern e-commerce platform with all features included — shop products, enjoy fast checkout, and discover the future of online shopping.",
  keywords: [
    "Naya Bazar",
    "ecommerce",
    "online store",
    "shopping",
    "modern ecommerce",
    "buy products online",
    "online marketplace",
    "fashion",
    "electronics",
    "grocery",
    "deals",
  ],
  authors: [{ name: "Naya Bazar Team" }],
  creator: "Naya Bazar",
  publisher: "Naya Bazar",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Naya Bazar - Modern E-Commerce Store",
    description:
      "Shop smarter with Naya Bazar — a modern, all-features-included e-commerce store for everything you need.",
    siteName: "Naya Bazar",
    images: [
      {
        url: "/logo.png", // Add your OpenGraph banner in /public
        width: 1200,
        height: 630,
        alt: "Naya Bazar - Modern Online Store",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Naya Bazar - Modern E-Commerce Store",
    description:
      "Discover Naya Bazar — a modern e-commerce store with advanced features for online shopping.",
    images: ["/logo.png"],
    creator: "@nayabazar", // replace with your Twitter handle if available
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },

  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
