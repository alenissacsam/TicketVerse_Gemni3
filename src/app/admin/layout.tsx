"use client";

import { useAuthModal, useUser, useLogout } from "@account-kit/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { User, LogOut, Shield, AlertTriangle } from "lucide-react";
import { isAdmin } from "@/lib/admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { openAuthModal } = useAuthModal();
  const user = useUser();
  const { logout } = useLogout();
  const router = useRouter();
  const pathname = usePathname();

  const userIsAdmin = isAdmin(user?.address);

  // Redirect non-admin users
  useEffect(() => {
    if (user && !userIsAdmin && pathname !== "/admin") {
      router.push("/");
    }
  }, [user, userIsAdmin, pathname, router]);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <main className="flex-1 w-full px-6 md:pl-24 py-8">
        {!user ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
            <Shield className="w-16 h-16 text-zinc-600" />
            <h2 className="text-2xl font-bold">Admin Access Required</h2>
            <p className="text-zinc-400 max-w-md">
              Please connect your wallet to access the admin panel.
            </p>
            <button
              onClick={openAuthModal}
              className="mt-4 inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-white text-black hover:bg-zinc-200 h-10 px-6"
            >
              Connect Wallet
            </button>
          </div>
        ) : !userIsAdmin ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
            <AlertTriangle className="w-16 h-16 text-red-500" />
            <h2 className="text-2xl font-bold">Unauthorized</h2>
            <p className="text-zinc-400 max-w-md">
              You do not have admin privileges. Only the authorized admin wallet can access this area.
            </p>
            <a
              href="/"
              className="mt-4 inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-white text-black hover:bg-zinc-200 h-10 px-6"
            >
              Go Back Home
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
