// components/forum-card.tsx
"use client";

import Link from "next/link";
import { MessageCircle, TrendingUp, Clock, ChevronRight } from "lucide-react";

interface ForumCardProps {
  forum: {
    _id: string;
    name: string;
    slug: string;
    daoId: string;
  };
  organizationId: string;
  stats?: {
    posts: number;
    lastActivity?: string;
  };
}

export default function ForumCard({
  forum,
  organizationId,
  stats,
}: ForumCardProps) {
  const timeAgo = (date?: string) => {
    if (!date) return "No activity yet";

    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    );

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
      }
    }
    return "just now";
  };

  return (
    <Link
      href={`/forum/${organizationId}/${forum._id}`}
      className="group block border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors py-4"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-serif font-medium text-neutral-900 dark:text-neutral-100 mb-1.5 group-hover:underline">
            {forum.name}
          </h3>
          <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
            <span>{stats?.posts || 0} posts</span>
            <span>·</span>
            <span>{timeAgo(stats?.lastActivity)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
