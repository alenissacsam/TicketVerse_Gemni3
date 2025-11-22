import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Satisfy, Bungee } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SidebarNav } from "@/components/sidebar-nav";
import { Footer } from "@/components/footer";
import { RevealPreloader } from "@/components/reveal-preloader";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const satisfy = Satisfy({
  weight: "400",
  variable: "--font-handwriting",
  subsets: ["latin"],
});

const bungee = Bungee({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TicketVerse",
  description: "NFT Ticketing Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${satisfy.variable} ${bungee.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <SmoothScrollProvider>
            <SidebarNav />
            <div className="min-h-screen flex flex-col">
              <div className="flex-grow">
                <RevealPreloader />
                {children}
              </div>
              <Footer />
            </div>
          </SmoothScrollProvider>
        </Providers>
      </body>
    </html>
  );
}
