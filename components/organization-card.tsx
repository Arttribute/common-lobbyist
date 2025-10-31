// components/organization-card.tsx
"use client";

import Link from "next/link";
import type { Organization } from "@/types/forum";

interface OrganizationCardProps {
  organization: Organization;
  forumCount?: number;
}

const chainNames: Record<number, string> = {
  1: "Ethereum",
  137: "Polygon",
  10: "Optimism",
  42161: "Arbitrum",
  8453: "Base",
  84532: "Base Sepolia",
};

// Generate initials from organization name
const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Generate a consistent gradient based on the organization name
const getAvatarGradient = (name: string): string => {
  const gradients = [
    "bg-gradient-to-br from-red-200 via-yellow-200 to-green-200",
    "bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200",
    "bg-gradient-to-br from-indigo-200 via-fuchsia-200 to-orange-200",
    "bg-gradient-to-br from-teal-200 via-green-200 to-lime-200",
    "bg-gradient-to-br from-rose-200 via-pink-200 to-purple-200",
    "bg-gradient-to-br from-cyan-200 via-sky-200 to-blue-200",
    "bg-gradient-to-br from-violet-200 via-purple-200 to-fuchsia-200",
    "bg-gradient-to-br from-emerald-200 via-green-200 to-lime-200",
    "bg-gradient-to-br from-amber-200 via-yellow-200 to-lime-200",
    "bg-gradient-to-br from-red-300 via-yellow-300 to-green-300",
    "bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300",
    "bg-gradient-to-br from-indigo-300 via-fuchsia-300 to-orange-300",
    "bg-gradient-to-br from-teal-300 via-green-300 to-lime-300",
    "bg-gradient-to-br from-rose-300 via-pink-300 to-purple-300",
    "bg-gradient-to-br from-cyan-300 via-sky-300 to-blue-300",
    "bg-gradient-to-br from-violet-300 via-purple-300 to-fuchsia-300",
    "bg-gradient-to-br from-emerald-300 via-green-300 to-lime-300",
    "bg-gradient-to-br from-amber-300 via-yellow-300 to-lime-300",
  ];

  // Generate a hash from the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use the hash to select a gradient
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

export default function OrganizationCard({
  organization,
  forumCount = 0,
}: OrganizationCardProps) {
  const initials = getInitials(organization.name);
  const avatarGradient = getAvatarGradient(organization.name);
  return (
    <article className="py-8 border-b border-neutral-200 dark:border-neutral-800">
      <Link href={`/organization/${organization._id}`} className="group block">
        <div className="flex gap-10 items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-neutral-900 dark:text-neutral-100">
                {organization.onchain?.chainId ? chainNames[organization.onchain.chainId] || "Unknown Network" : "Not Deployed"}
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

          {/* Organization Avatar */}
          <div className={`hidden md:flex w-28 h-28 ${avatarGradient} flex-shrink-0 rounded-lg items-center justify-center`}>
            <span className="text-black text-3xl font-semibold drop-shadow-sm">
              {initials}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
