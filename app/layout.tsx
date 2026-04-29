import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/shared/ServiceWorkerRegistration";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "A local-first habit tracker progressive web app.",
  manifest: "/manifest.json",
  icons: [{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" }],
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
