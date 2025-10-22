// components/forum/content-card.tsx
"use client";

import { useState } from "react";
import MarkdownRenderer from "./markdown-renderer";

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
  const [replyText, setReplyText] = useState("");

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

  const handleReplySubmit = () => {
    if (onReply && replyText.trim()) {
      onReply(content._id, replyText);
      setReplyText("");
      setShowReplyBox(false);
    }
  };

  return (
    <article className="py-8 border-b border-neutral-200 dark:border-neutral-800">
      {/* Author info */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {content.authorId.slice(0, 8)}...
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-neutral-500">
            <span>{timeAgo(content.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      {content.type === "post" && content.content.title && (
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 leading-tight">
          {content.content.title}
        </h2>
      )}

      {content.content.text && (
        <div className="prose prose-lg max-w-none text-neutral-700 dark:text-neutral-300 mb-6">
          <MarkdownRenderer content={content.content.text} />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Clap button */}
          <button className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
            <svg width="24" height="24" viewBox="0 0 24 24" className="fill-none stroke-current">
              <path d="M11.37.83L12 3.28l.63-2.45h-1.26zM13.92 3.95l1.52-2.1-1.18-.4-.34 2.5zM8.59 1.84l1.52 2.11-.34-2.5-1.18.4zM18.52 18.92a4.23 4.23 0 0 1-2.62 1.33l.41-.37c2.39-2.4 2.86-4.95 1.4-7.63l-.91-1.6-.8-1.67c-.25-.56-.19-.98.21-1.29a.7.7 0 0 1 .55-.13c.28.05.54.23.72.5l2.37 4.16c.97 1.62 1.14 4.23-1.33 6.7zm-11-.44l-4.15-4.15a.83.83 0 0 1 1.17-1.17l2.16 2.16a.37.37 0 0 0 .51-.52l-2.15-2.16L3.6 11.2a.83.83 0 0 1 1.17-1.17l3.43 3.44a.36.36 0 0 0 .52 0 .36.36 0 0 0 0-.52L5.29 9.51l-.97-.97a.83.83 0 0 1 0-1.16.84.84 0 0 1 1.17 0l.97.97 3.44 3.43a.36.36 0 0 0 .51 0 .37.37 0 0 0 0-.52L6.98 7.83a.82.82 0 0 1-.18-.9.82.82 0 0 1 .76-.51c.22 0 .43.09.58.24l5.8 5.79a.37.37 0 0 0 .58-.42L13.4 9.67c-.26-.56-.2-.98.2-1.29a.7.7 0 0 1 .55-.13c.28.05.55.23.73.5l2.2 3.86c1.3 2.38.87 4.59-1.29 6.75a4.65 4.65 0 0 1-4.19 1.37 7.73 7.73 0 0 1-4.07-2.25z"></path>
            </svg>
            <span className="text-sm">{content.counters.placedRaw || "0"}</span>
          </button>

          {/* Reply button */}
          {showReplies && (
            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" className="fill-none stroke-current">
                <path d="M18 16.8a7.14 7.14 0 0 0 2.24-5.32c0-4.12-3.53-7.48-8.05-7.48C7.67 4 4.14 7.36 4.14 11.48c0 4.13 3.53 7.48 8.05 7.48.28 0 .54-.02.81-.05.33.42.73.81 1.18 1.16A13.28 13.28 0 0 0 12.19 21v.07a.17.17 0 0 0 .09.14c.05.03.1.03.15 0l.28-.14c.12-.06.27-.14.43-.23.11-.06.22-.13.34-.2.11-.08.23-.16.34-.24.12-.09.23-.18.35-.27.11-.09.22-.19.33-.29.11-.1.21-.2.31-.31.11-.1.21-.21.31-.32.1-.1.2-.22.3-.33.09-.11.18-.23.27-.35.09-.12.17-.24.25-.36.08-.12.15-.25.22-.37.07-.12.14-.25.2-.38.06-.13.12-.26.17-.4.05-.13.1-.27.13-.41.04-.14.07-.28.1-.42.03-.14.05-.29.06-.43.02-.15.02-.3.02-.45v-.06zm-15.53-6.23a5.93 5.93 0 0 1 5.94-5.94c3.28 0 5.94 2.66 5.94 5.94a5.93 5.93 0 0 1-5.94 5.94c-.38 0-.75-.04-1.10-.11-.1-.02-.2-.04-.3-.06-.11-.03-.22-.06-.33-.09l-.11-.03-.08-.02-.02-.01h-.01a.74.74 0 0 0-.52.04l-2.99 1.54a.39.39 0 0 1-.53-.5l.72-2.56c.05-.19 0-.38-.11-.52-.77-1.04-1.23-2.33-1.23-3.72z"></path>
              </svg>
              <span className="text-sm">{content.counters.replies || 0}</span>
            </button>
          )}
        </div>

        {/* Bookmark */}
        <button className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
          <svg width="25" height="25" viewBox="0 0 25 25">
            <path d="M18 2.5a.5.5 0 0 1 1 0V5h2.5a.5.5 0 0 1 0 1H19v2.5a.5.5 0 1 1-1 0V6h-2.5a.5.5 0 0 1 0-1H18V2.5zM7 7a1 1 0 0 1 1-1h3.5a.5.5 0 0 0 0-1H8a2 2 0 0 0-2 2v14a.5.5 0 0 0 .8.4l5.7-4.4 5.7 4.4a.5.5 0 0 0 .8-.4v-8.5a.5.5 0 0 0-1 0v7.48l-5.2-4a.5.5 0 0 0-.6 0l-5.2 4V7z" className="fill-current"></path>
          </svg>
        </button>
      </div>

      {/* Reply Box */}
      {showReplyBox && onReply && (
        <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-700 flex-shrink-0"></div>
            <div className="flex-1">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="What are your thoughts?"
                className="w-full px-0 py-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleReplySubmit}
                  disabled={!replyText.trim()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white rounded-full text-sm font-medium transition-colors"
                >
                  Respond
                </button>
                <button
                  onClick={() => {
                    setShowReplyBox(false);
                    setReplyText("");
                  }}
                  className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
