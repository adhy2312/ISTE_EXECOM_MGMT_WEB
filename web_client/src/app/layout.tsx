import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
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
    <html lang="en">
      <body>
        <Toaster position="top-center" richColors theme="light" />
        <CommandMenu />
        <div className="animated-bg" />
        {/* AuthProvider initializes Firebase listener globally */}
        <AuthProvider>
          <div className="app-container">
            <main className="main-content">
              {children}
            </main>
            <Navigation />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
