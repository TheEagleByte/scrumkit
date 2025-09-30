import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ScrumKit - Open Source Tools for Better Sprints",
  description: "All essential scrum ceremony tools in one unified platform. Retrospectives, planning poker, daily standups, and team health checks—completely free and open source. Self-hostable with one-click deploy.",
  keywords: ["scrum", "agile", "retrospectives", "planning poker", "sprint planning", "team health", "open source", "self-hosted", "collaboration"],
  authors: [{ name: "ScrumKit Team" }],
  creator: "ScrumKit",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://scrumkit.dev",
    siteName: "ScrumKit",
    title: "ScrumKit - Open Source Tools for Better Sprints",
    description: "All essential scrum ceremony tools in one unified platform. Retrospectives, planning poker, daily standups, and team health checks—completely free and open source.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "ScrumKit Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ScrumKit - Open Source Tools for Better Sprints",
    description: "All essential scrum ceremony tools in one unified platform. Free, open source, and self-hostable.",
    creator: "@scrumkit",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://scrumkit.dev"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense fallback={null}>{children}</Suspense>
            <Toaster />
          </ThemeProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
