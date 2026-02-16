import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { WhatsAppButton } from "./WhatsAppButton";
import { BackToTop } from "./BackToTop";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.jtfootballphysiotherapy.co.uk"),
  title: "Physiotherapy Kilmarnock | JT Football Physiotherapy",
  description: "Expert physiotherapy in Kilmarnock, Ayrshire for pain relief, rehab and performance. Specialist football physio helping you recover from injury and return to the pitch stronger.",
  icons: {
    icon: "/jt-football-physio-logo.png",
    shortcut: "/jt-football-physio-logo.png",
    apple: "/jt-football-physio-logo.png",
  },
  openGraph: {
    title: "Physiotherapy Kilmarnock | JT Football Physiotherapy",
    description: "Expert physiotherapy in Kilmarnock, Ayrshire for pain relief, rehab and performance.",
    images: [
      {
        url: "https://www.jtfootballphysiotherapy.co.uk/jt-football-physio-logo.png",
        width: 1200,
        height: 630,
        alt: "JT Football Physiotherapy Logo",
      },
    ],
    siteName: "JT Football Physiotherapy",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary",
    title: "Physiotherapy Kilmarnock | JT Football Physiotherapy",
    description: "Expert physiotherapy in Kilmarnock, Ayrshire for pain relief, rehab and performance.",
    images: ["https://www.jtfootballphysiotherapy.co.uk/jt-football-physio-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body className={`${inter.variable} font-sans antialiased bg-gradient-to-br from-slate-50 via-white to-[#4C6CD6]/5 text-slate-900 min-h-screen`}>
        {children}
        <WhatsAppButton />
        <BackToTop />
      </body>
    </html>
  );
}