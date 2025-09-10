import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Web3Provider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Shroud Protocol",
  description: "Multi-asset, privacy-preserving transactions for EVM chains.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-text-primary flex flex-col min-h-screen`}>
        <Web3Provider>
          {/* The Header is part of the static layout */}
          <Header />
          {/* The <main> tag holds the dynamic page content */}
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* {children} is the placeholder for our pages (home, history, etc.) */}
            {children}
          </main>
        </Web3Provider>
      </body>
    </html>
  );
}