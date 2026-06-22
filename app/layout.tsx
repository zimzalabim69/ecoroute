import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { AppShell } from "@/components/app-shell";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { InstallPrompt } from "@/components/install-prompt";
import { CookieConsent } from "@/components/cookie-consent";
import { ToastProvider } from "@/components/toast-provider";
import { PageTransition } from "@/components/page-transition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EcoRoute — EV Chargers & Carbon Tracker",
  description:
    "Find EV chargers, plan routes, and track your carbon savings. Hyperlocal, fast, and beautiful.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#121212] text-[#ededed]">
        <link rel="preconnect" href="https://api.openchargemap.io" />
        <link rel="preconnect" href="https://tile.openstreetmap.org" />
        <link rel="preconnect" href="https://api.openrouteservice.org" />
        <link rel="preconnect" href="https://api.weather.gov" />
        <link rel="dns-prefetch" href="https://api.openchargemap.io" />
        <link rel="dns-prefetch" href="https://tile.openstreetmap.org" />
        <noscript>
          <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#121212] px-4 text-center">
            <h1 className="text-xl font-bold text-[#ededed]">JavaScript Required</h1>
            <p className="mt-2 text-sm text-[#a0a0a0]">EcoRoute requires JavaScript to function. Please enable it in your browser settings.</p>
          </div>
        </noscript>
        <AuthProvider>
          <ToastProvider>
            <AppShell>
              <PageTransition>{children}</PageTransition>
            </AppShell>
          </ToastProvider>
        </AuthProvider>
        <ServiceWorkerRegister />
        <InstallPrompt />
        <CookieConsent />
      </body>
    </html>
  );
}
