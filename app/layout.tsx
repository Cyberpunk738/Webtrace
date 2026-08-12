import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/landing/Header';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'WebTrace — Website Performance Intelligence Engine',
  description:
    'Real-time website performance telemetry, network waterfall analysis, asset size profiling, and deterministic engineering rule audit engine.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${jetbrainsMono.variable} bg-white text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
