import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WaveDrama — Stream Asian Dramas & Movies",
  description:
    "Watch the latest Asian dramas, K-Dramas, movies, and variety shows for free. WaveDrama brings you HD streaming with English subtitles.",
  keywords: [
    "asian dramas",
    "k-drama",
    "korean drama",
    "chinese drama",
    "japanese drama",
    "streaming",
    "watch free",
  ],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "WaveDrama — Stream Asian Dramas & Movies",
    description:
      "Watch the latest Asian dramas, K-Dramas, movies, and variety shows for free.",
    type: "website",
    siteName: "WaveDrama",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >

      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
