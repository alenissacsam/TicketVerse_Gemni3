"use client";

import { useAuthModal, useUser, useLogout } from "@account-kit/react";
import { useEffect } from "react";

export const LoginButton = () => {
  const { openAuthModal } = useAuthModal();
  const user = useUser();
  const { logout } = useLogout();

  useEffect(() => {
    if (user) {
      // Sync user to DB
      fetch("/api/auth/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          walletAddress: user.address,
        }),
      });
    }
  }, [user]);

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user.email ?? "User"} ({user.address.slice(0, 6)}...{user.address.slice(-4)})
        </span>
        <button
          onClick={() => logout()}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={openAuthModal}
      className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      Login with Google
    </button>
  );
};
