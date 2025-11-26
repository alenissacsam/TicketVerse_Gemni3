"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Compass,
  Ticket,
  Plus,
  Shield,
  LogOut,
  Menu,
  X,
  User,
  Wallet,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthModal, useUser, useLogout } from "@account-kit/react";
// import LiquidGlass from "liquid-glass-react";
import { useCart } from "@/components/marketplace/cart-provider";

const navItems = [
  { icon: Ticket, label: "Discover", href: "/" },
  { icon: Compass, label: "Events", href: "/events" },
  { icon: ShoppingBag, label: "Marketplace", href: "/marketplace" },
  { icon: Plus, label: "Create", href: "/events/create" },
  { icon: Wallet, label: "My Tickets", href: "/tickets" },
  { icon: Sparkles, label: "Rewards", href: "/rewards" },
  { icon: Shield, label: "Admin", href: "/admin" },
];

export function SidebarNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { openAuthModal } = useAuthModal();
  const user = useUser();
  const { logout } = useLogout();
  const { items, setIsOpen: setIsCartOpen } = useCart(); // Rename to avoid conflict with mobile menu state

  const handleAccountClick = () => {
    if (!user) {
      openAuthModal();
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 p-3 bg-white rounded-full shadow-lg md:hidden text-slate-900 hover:bg-slate-50 transition-colors border border-slate-100"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Sidebar - Liquid Glass Capsule */}
      <motion.div
        initial={{ x: -100, y: "-50%", opacity: 0 }}
        animate={{ x: 0, y: "-50%", opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
        className="hidden md:block fixed left-6 top-1/2 z-50"
      >

        <div className="flex flex-col items-center gap-4 px-3 py-6 bg-black/20 backdrop-blur-[6px] rounded-full border border-white/10">
          {/* User/Account Button */}
          <button
            onClick={handleAccountClick}
            className={cn(
              "p-3 rounded-full transition-all duration-300 relative overflow-hidden group",
              user
                ? "text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                : "text-white/70 hover:text-white"
            )}
          >
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              "bg-gradient-to-tr from-white/20 via-white/5 to-transparent"
            )} />
            <div className={cn(
              "relative z-10 p-1 rounded-full",
              user ? "bg-white/10 ring-1 ring-white/20" : ""
            )}>
              <User size={20} />
            </div>
          </button>

          <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <nav className="flex flex-col gap-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 flex-shrink-0",
                    isActive
                      ? "text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                      : "text-white/50 hover:text-white hover:scale-110"
                  )}
                >
                  {/* Active Indicator / Glow */}
                  {isActive && (
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-sm" />
                  )}

                  {/* Icon */}
                  <div className="relative z-10">
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className="group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300" />
                  </div>

                  {/* Tooltip - Premium Glass */}
                  <span className="absolute left-14 px-4 py-2 glass-premium text-white text-xs font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 translate-x-4 group-hover:translate-x-0">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {user && (
            <>
              <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 text-white/70 hover:text-white rounded-full transition-all duration-300 hover:bg-white/5 group"
              >
                <ShoppingBag size={20} />
                {items.length > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 bg-blue-500 rounded-full ring-2 ring-black" />
                )}
                <span className="absolute left-14 px-4 py-2 glass-premium text-white text-xs font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 translate-x-4 group-hover:translate-x-0">
                  Cart ({items.length})
                </span>
              </button>

              <button
                onClick={() => logout()}
                className="p-3 text-white/40 hover:text-red-400 rounded-full transition-all duration-300 hover:rotate-90 hover:bg-white/5"
              >
                <LogOut size={20} />
              </button>
            </>
          )}
        </div>

      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col h-full pt-24 px-8">
              <nav className="flex flex-col gap-6">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-4 text-2xl font-medium transition-colors p-4 rounded-[2rem]",
                        isActive ? "bg-slate-100 text-slate-900" : "text-slate-500"
                      )}
                    >
                      <item.icon size={28} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
