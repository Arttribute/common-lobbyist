// components/forum/forum-stats.tsx
"use client";

import { TrendingUp, MessageSquare, Users, Activity } from "lucide-react";

interface ForumStatsProps {
  stats: {
    totalPosts: number;
    totalComments: number;
    activeMembers: number;
    todayActivity: number;
  };
}

export default function ForumStats({ stats }: ForumStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        icon={<MessageSquare className="w-5 h-5" />}
        label="Posts"
        value={stats.totalPosts}
        color="blue"
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5" />}
        label="Comments"
        value={stats.totalComments}
        color="green"
      />
      <StatCard
        icon={<Users className="w-5 h-5" />}
        label="Members"
        value={stats.activeMembers}
        color="purple"
      />
      <StatCard
        icon={<Activity className="w-5 h-5" />}
        label="Today"
        value={stats.todayActivity}
        color="orange"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green:
      "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    orange:
      "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {label}
          </p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
