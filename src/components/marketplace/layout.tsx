"use client";

import { ReactNode } from "react";

interface MarketplaceLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export function MarketplaceLayout({ children, sidebar }: MarketplaceLayoutProps) {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 hidden lg:block sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-4">
          {sidebar}
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
