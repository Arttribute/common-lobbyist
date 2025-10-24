// components/forum/content-card.tsx
"use client";

import { useState } from "react";
import { MessageSquare, MoreVertical, ThumbsUp, Flag } from "lucide-react";
import MarkdownRenderer from "./markdown-renderer";
import ContentEditor from "./content-editor";
import PollDisplay from "./poll-display";

interface ContentCardProps {
  content: {
    _id: string;
    type: "post" | "comment" | "poll";
    content: {
      title?: string;
      text?: string;
      poll?: {
        options: Array<{ id: string; label: string }>;
        closesAt?: Date;
      };
    };
    authorId: string;
    createdAt: string;
    counters: {
      replies: number;
      placedRaw: string;
      qWeight: string;
    };
    depth: number;
  };
  onReply?: (contentId: string, replyText: string) => void;
  showReplies?: boolean;
  compact?: boolean;
}

export default function ContentCard({
  content,
  onReply,
  showReplies = true,
  compact = false,
}: ContentCardProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);

  const timeAgo = (date: string) => {
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

  const handleReplySubmit = (data: { text: string }) => {
    if (onReply) {
      onReply(content._id, data.text);
      setShowReplyBox(false);
    }
  };

  return (
    <article
      className={`bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 ${
        content.depth > 0 ? "ml-8" : ""
      }`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {content.authorId.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-neutral-900 dark:text-neutral-100">
                {content.authorId.slice(0, 8)}...
              </div>
              <div className="text-sm text-neutral-500">
                {timeAgo(content.createdAt)}
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors">
            <MoreVertical className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        {content.type === "post" && content.content.title && (
          <h2 className="text-2xl font-bold mb-3 text-neutral-900 dark:text-neutral-100">
            {content.content.title}
          </h2>
        )}

        {content.type === "poll" && content.content.poll ? (
          <PollDisplay
            poll={content.content.poll}
            contentId={content._id}
            introText={content.content.text}
          />
        ) : (
          content.content.text && (
            <div
              className={`${
                !isExpanded && compact ? "line-clamp-3" : ""
              } text-neutral-700 dark:text-neutral-300`}
            >
              <MarkdownRenderer content={content.content.text} />
            </div>
          )
        )}

        {compact && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
          >
            Show more
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <button className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <ThumbsUp className="w-5 h-5" />
            <span className="text-sm font-medium">
              {content.counters.placedRaw || "0"}
            </span>
          </button>

          {showReplies && (
            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">
                {content.counters.replies || 0} replies
              </span>
            </button>
          )}

          <button className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors ml-auto">
            <Flag className="w-5 h-5" />
          </button>
        </div>

        {/* Reply Box */}
        {showReplyBox && onReply && (
          <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <ContentEditor
              type="comment"
              onSubmit={handleReplySubmit}
              placeholder="Write a reply..."
              buttonText="Reply"
            />
          </div>
        )}
      </div>
    </article>
  );
}
