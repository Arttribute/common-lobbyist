// app/organizations/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bell } from "lucide-react";
import OrganizationCard from "@/components/organization-card";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
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
      <header className="sticky top-0 bg-white dark:bg-black border-b border-black dark:border-white z-50">
        <div className="max-w-[1336px] mx-auto px-6 h-[57px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <svg width="45" height="45" viewBox="0 0 45 45" className="fill-black dark:fill-white">
                <path d="M5 40V5h35v35H5z"></path>
              </svg>
            </Link>
            <div className="relative hidden md:block">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-900 rounded-full text-sm w-60 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/new"
              className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" className="fill-current">
                <path d="M14 4a.5.5 0 0 0 0-1v1zm-4-1a.5.5 0 0 0 0 1V3zm4.5 12.5l.354.354a.5.5 0 0 0 0-.708L14.5 15.5zm-5 0l-.354.354a.5.5 0 0 0 0-.708L9.5 15.5zM14 3h-4v1h4V3zm0 1a.5.5 0 0 1 .5.5h1A1.5 1.5 0 0 0 14 3v1zm.5.5v10h1v-10h-1zm0 10a.5.5 0 0 1-.146.354l.708.707A1.5 1.5 0 0 0 15.5 14.5h-1zm-.146.354l-5 5 .708.707 5-5-.708-.707zm-5 4.293l-5-5-.708.707 5 5 .708-.707zM9 14.5v-10H8v10h1zm0-10A.5.5 0 0 1 9.5 4V3A1.5 1.5 0 0 0 8 4.5h1z"></path>
              </svg>
              <span className="hidden md:inline">Write</span>
            </Link>
            <button className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
              <Bell className="w-6 h-6" />
            </button>
            <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
          </div>
        </div>
      </header>

      {/* Organizations List */}
      <main className="max-w-[1336px] mx-auto px-6 py-12">
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-8">
            <h1 className="text-4xl font-serif font-bold mb-8">Organizations</h1>
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
              <h3 className="text-base font-semibold mb-4">Discover communities</h3>
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
