// app/new/page.tsx
"use client";

import { DAOCreationStepper } from "@/components/onboarding/dao-creation-stepper";
import Link from "next/link";
import AccountMenu from "@/components/account/account-menu";

export default function NewOrganization() {
  return (
    <>
      {/* Navbar */}
      <div className="flex justify-between items-center px-6 py-4">
        {/* Logo and brand */}
        <div className="flex items-center">
          <Link
            href="/"
            className="text-xl font-bold text-neutral-900 dark:text-neutral-100 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            <div className="">
              <div className="bg-yellow-300 w-36 h-5 -mb-6.5 ml-1 rounded-sm"></div>
              <h2 className="text-lg font-semibold">Common Lobbyist</h2>
            </div>
          </Link>
        </div>
        {/* Navigation links */}
        <div className="hidden md:flex items-center space-x-6"></div>
        {/* Account menu */}
        <div className="flex items-center">
          <AccountMenu />
        </div>
      </div>
      <DAOCreationStepper />
    </>
  );
}
