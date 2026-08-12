import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/landing/Header';

export const metadata: Metadata = {
  title: 'WebTrace — Developer Performance Intelligence Engine',
  description:
    'Real-time website performance telemetry, network waterfall analysis, asset size profiling, and deterministic engineering rule audit engine.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased selection:bg-sky-500 selection:text-slate-950">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
