import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AstroVision — FITS Image Analyzer",
  description:
    "Upload astronomical .fits files to visualize star data and extract pixel metrics including Max DN, Min DN, Camera Gain, and Max Photon Count.",
  keywords: ["FITS", "astronomy", "astrophotography", "star viewer", "image analyzer"],
  authors: [{ name: "AstroVision" }],
  openGraph: {
    title: "AstroVision — FITS Image Analyzer",
    description: "Visualize astronomical FITS files and extract pixel metrics.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
