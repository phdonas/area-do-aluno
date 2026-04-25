import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontDisplay = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PHD Academy | Ecossistema de Aprendizado",
    template: "%s | PHD Academy"
  },
  description: "Plataforma de ensino oficial da PHD Academy",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PHD Academy",
  },
};

export const viewport = {
  themeColor: "#0A0F1E",
  width: "device-width",
  initialScale: 1,
};

import { AppProviders } from "@/providers/app-providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontDisplay.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
