// components/organization-card.tsx
"use client";

import Link from "next/link";
import { ArrowUp, MessageCircle, Bookmark } from "lucide-react";

interface OrganizationCardProps {
  organization: {
    _id: string;
    name: string;
    description?: string;
    onchain: {
      chainId: number;
      factory: string;
      registry: string;
      token: string;
    };
  };
  forumCount?: number;
}

const chainNames: Record<number, string> = {
  1: "Ethereum",
  137: "Polygon",
  10: "Optimism",
  42161: "Arbitrum",
  8453: "Base",
};

export default function OrganizationCard({
  organization,
  forumCount = 0,
}: OrganizationCardProps) {
  return (
    <article className="py-8 border-b border-neutral-200 dark:border-neutral-800">
      <Link href={`/organization/${organization._id}`} className="group block">
        <div className="flex gap-10 items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
              <span className="text-sm text-neutral-900 dark:text-neutral-100">
                {chainNames[organization.onchain.chainId] || "Unknown Network"}
              </span>
            </div>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2 group-hover:underline leading-tight">
              {organization.name}
            </h2>

            {organization.description && (
              <p className="text-base text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2 leading-relaxed">
                {organization.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-500">
              <span>{forumCount} forums</span>
            </div>
          </div>

          {/* Placeholder for featured image - you can add this later */}
          <div className="hidden md:block w-28 h-28 bg-neutral-100 dark:bg-neutral-900 flex-shrink-0"></div>
        </div>
      </Link>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
            <ArrowUp className="w-6 h-6" />
            <span className="text-sm">615</span>
          </button>
          <button className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
            <MessageCircle className="w-6 h-6" />
            <span className="text-sm">14</span>
          </button>
        </div>
        <button className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
          <Bookmark className="w-6 h-6" />
        </button>
      </div>
    </article>
  );
}
