// app/organizations/page.tsx
"use client";

import type { Organization } from "@/types/forum";

import { useEffect, useState } from "react";
import Link from "next/link";
import AccountMenu from "@/components/account/account-menu";
import OrganizationCard from "@/components/organization-card";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/organization");
      const data = await res.json();
      setOrganizations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Medium-style Header */}
      {/* Navbar */}
      <div className="sticky top-0 z-50 bg-white flex justify-between items-center px-6 py-4">
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

      {/* Organizations List */}
      <main className="max-w-[1336px] mx-auto px-6 py-12">
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-8">
            <h1 className="text-4xl font-bold mb-8">Organizations</h1>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-neutral-100 rounded-full animate-spin" />
              </div>
            ) : organizations.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-base text-neutral-500 dark:text-neutral-400 mb-8">
                  No organizations yet. Be the first to create one.
                </p>
                <Link
                  href="/new"
                  className="inline-block px-8 py-3 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black rounded-full text-sm font-medium transition-colors"
                >
                  Get started
                </Link>
              </div>
            ) : (
              <div>
                {organizations.map((org) => (
                  <OrganizationCard key={org._id} organization={org} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block col-span-4">
            <div className="sticky top-20">
              <h3 className="text-base font-semibold mb-4">
                Discover communities
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                Explore organizations and join conversations that matter to you.
              </p>
              <Link
                href="/new"
                className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              >
                Create new organization
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
