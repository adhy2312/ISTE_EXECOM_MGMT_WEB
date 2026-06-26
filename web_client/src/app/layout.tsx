import type { Metadata, Viewport } from "next";

import { CommandMenu } from "@/components/CommandMenu";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "ISTE SC MBCET ExeCom",
  description: "Executive Management & Accountability Client",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ISTE ExeCom",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#09090B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Toaster position="top-center" richColors theme="light" />
        <CommandMenu />
        <div className="animated-bg" />
        {/* AuthProvider initializes Firebase listener globally */}
        <AuthProvider>
          <div className="app-container">
            <main className="main-content">
              {children}
              <div style={{ textAlign: "center", padding: "20px 0 40px", fontSize: "11px", color: "var(--text-muted)", opacity: 0.5, fontWeight: 500, letterSpacing: "0.05em" }}>
                developed and tested by Adhy
              </div>
            </main>
            <Navigation />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
