import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Physiotherapy Kilmarnock | JT Football Physiotherapy",
  description: "Expert physiotherapy in Kilmarnock, Ayrshire for pain relief, rehab and performance. Specialist football physio helping you recover from injury and return to the pitch stronger.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 text-slate-900`}>{children}</body>
    </html>
  );
}