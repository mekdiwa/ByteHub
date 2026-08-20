import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { SupabaseProvider } from "@/lib/supabase-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "ByteHub — The Ultimate Script & Key Marketplace",
  description: "Premium Roblox scripts, exploits, and license keys. Instant delivery.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        <SupabaseProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
        </SupabaseProvider>
      </body>
    </html>
  );
}
