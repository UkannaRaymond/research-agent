/**
 * Root Layout
 *
 * Base HTML structure, fonts, and the shared research state provider.
 */

import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ResearchProvider } from "./context/ResearchContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Research Agent",
  description:
    "Ask a question and let AI research multiple sources, analyze the findings, and produce a cited report.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <ResearchProvider>{children}</ResearchProvider>
      </body>
    </html>
  );
}
