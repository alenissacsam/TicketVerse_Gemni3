import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Satisfy, Bungee } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SidebarNav } from "@/components/sidebar-nav";
import { Footer } from "@/components/footer";

import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { IntroProvider } from "@/components/intro-provider";
import { GlobalPreloader } from "@/components/global-preloader";
import { CartProvider } from "@/components/marketplace/cart-provider";
import { CartSheet } from "@/components/marketplace/cart-sheet";
import { headers } from "next/headers";
import { cookieToInitialState } from "@account-kit/core";
import { config } from "@/lib/config";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const initialState = cookieToInitialState(
    config,
    headersList.get("cookie") ?? undefined
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${satisfy.variable} ${bungee.variable} antialiased bg-black min-h-screen selection:bg-purple-500/30`}
        suppressHydrationWarning
      >
        <Providers initialState={initialState}>
          <SmoothScrollProvider>
            <IntroProvider>
              <CartProvider>
                <GlobalPreloader />
                <SidebarNav />
                <CartSheet />
                <div className="min-h-screen flex flex-col">
                  <div className="flex-grow relative z-10">
                    {children}
                  </div>
                  <Footer />
                </div>
              </CartProvider>
            </IntroProvider>
          </SmoothScrollProvider>
        </Providers>
      </body>
    </html>
  );
}
