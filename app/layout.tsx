import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Anton } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/landing/Header";

const display = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WebTrace — Website Performance Intelligence Engine",
  description:
    "Real-time website performance telemetry, network waterfall analysis, asset size profiling, and deterministic engineering rule audit engine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} font-sans antialiased selection:bg-slate-900 selection:text-white min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
