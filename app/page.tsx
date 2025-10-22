"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="border-b border-black dark:border-white">
        <div className="max-w-[1192px] mx-auto px-6 py-24 md:py-32">
          <div className="max-w-[600px]">
            <h1 className="text-[106px] leading-[95px] font-serif font-normal text-black dark:text-white mb-12 tracking-tight">
              Human <br />stories & ideas
            </h1>
            <p className="text-2xl text-neutral-600 dark:text-neutral-400 mb-12 leading-relaxed">
              A place to read, write, and deepen your understanding
            </p>
            <Link
              href="/organizations"
              className="inline-block px-12 py-3 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black rounded-full text-xl font-medium transition-colors"
            >
              Start reading
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-[1192px] mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-4">Create forums</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Build dedicated spaces for your DAO or organization to discuss ideas, share updates, and engage your community.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Rich content</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Write with markdown, embed images, create polls, and share your thoughts in a beautiful, distraction-free environment.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Community driven</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Foster meaningful conversations with threaded comments, reactions, and community moderation tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-black dark:border-white py-16">
        <div className="max-w-[1192px] mx-auto px-6 text-center">
          <h2 className="text-4xl font-serif font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
            Create your organization and start building your community today.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/new"
              className="inline-flex items-center gap-2 px-8 py-3 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black rounded-full text-lg font-medium transition-colors"
            >
              Create organization
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/organizations"
              className="inline-block px-8 py-3 border border-black dark:border-white hover:bg-neutral-100 dark:hover:bg-neutral-900 text-black dark:text-white rounded-full text-lg font-medium transition-colors"
            >
              Browse organizations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
