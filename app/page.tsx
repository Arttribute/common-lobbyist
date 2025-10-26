"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AccountMenu from "@/components/account/account-menu";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
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
      {/* Hero Section */}
      <section className="border-b border-black dark:border-white">
        <div className="max-w-[88%] mx-auto px-6 py-16 md:py-20">
          <div className="max-w-[70%]">
            <h1 className="text-7xl leading-[85px]  text-black dark:text-white mb-6 tracking-tight">
              Collective memory for decentralized governance.
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-12 leading-relaxed">
              Create forums and autonomous agents that organize discussion,
              preserve insight, and represent the collective will of your
              community.
            </p>
            <Link
              href="/new"
              className="inline-block px-16 py-2 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black rounded-lg font-medium transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-[88%] mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="">
                <div className="bg-yellow-200 w-60 h-6 -mb-7 ml-1 rounded-sm"></div>
                <h3 className="text-2xl tracking-tight mb-4">
                  Create DAOs & Forums
                </h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {
                  "Deploy your DAO governance tokens and build dedicated spaces for your organization to discuss ideas, and share updates."
                }
              </p>
            </div>
            <div>
              <div className="">
                <div className="bg-lime-200 w-68 h-6 -mb-7 ml-1 rounded-sm"></div>
                <h3 className="text-2xl tracking-tight mb-4">
                  Deploy a Lobbyist Agent
                </h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {
                  "The agent listens to your governance platforms and articulates shared community positions with verifiable references."
                }
              </p>
            </div>
            <div>
              <div className="">
                <div className="bg-teal-200 w-72 h-6 -mb-7 ml-1 rounded-sm"></div>
                <h3 className="text-2xl tracking-tight mb-4">
                  Signal Ideas with Tokens
                </h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {
                  "Members guide the agent’s focus by placing tokens on ideas worth remembering and can withdraw to let them fade."
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-[88%] mx-auto px-6 text-center">
          <h2 className="text-4xl mb-6 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
            Create your organization and start building your community today.
          </p>
          <div className="flex gap-2 justify-center">
            <Link
              href="/new"
              className="inline-flex items-center gap-2 px-12 py-2 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black rounded-lg text-sm font-medium transition-colors"
            >
              Create organization
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/organizations"
              className="inline-block px-8 py-2 border border-black dark:border-white hover:bg-neutral-100 dark:hover:bg-neutral-900 text-black dark:text-white rounded-lg text-sm font-medium transition-colors"
            >
              Browse organizations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
