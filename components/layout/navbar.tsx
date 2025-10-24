// components/layout/navbar.tsx
"use client";

import Link from "next/link";
import AccountMenu from "@/components/account/account-menu";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-neutral-900 dark:text-neutral-100 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              Common Lobbyist
            </Link>
          </div>

          {/* Navigation links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/organizations"
              className={`text-sm font-medium transition-colors ${
                pathname === "/organizations"
                  ? "text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
            >
              DAOs
            </Link>
            <Link
              href="/new"
              className={`text-sm font-medium transition-colors ${
                pathname === "/new"
                  ? "text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              }`}
            >
              Create DAO
            </Link>
          </div>

          {/* Account menu */}
          <div className="flex items-center">
            <AccountMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
