// components/forum/content-list.tsx
"use client";

import { useState } from "react";
import ContentCard from "./content-card";

interface Content {
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
  parentId: string | null;
  rootId: string;
}

interface ContentListProps {
  contents: Content[];
  onReply?: (contentId: string, replyText: string) => void;
  showNested?: boolean;
}

export default function ContentList({
  contents,
  onReply,
  showNested = true,
}: ContentListProps) {
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  const togglePost = (postId: string) => {
    setExpandedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  // Separate posts and comments
  const posts = contents.filter((c) => c.type === "post" || c.depth === 0);
  const comments = contents.filter((c) => c.depth > 0);

  // Build comment tree
  const getComments = (parentId: string) => {
    return comments.filter((c) => c.parentId === parentId);
  };

  if (contents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 dark:text-neutral-400">
          No content yet. Be the first to post!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const postComments = getComments(post._id);
        const isExpanded = expandedPosts.has(post._id);

        return (
          <div key={post._id} className="space-y-3">
            <div onClick={() => togglePost(post._id)} className="cursor-pointer">
              <ContentCard
                content={post}
                onReply={onReply}
                showReplies={true}
                compact={!isExpanded}
              />
            </div>

            {/* Show comments if expanded and nested view is enabled */}
            {showNested && isExpanded && postComments.length > 0 && (
              <div className="space-y-3 ml-8">
                {postComments.map((comment) => (
                  <ContentCard
                    key={comment._id}
                    content={comment}
                    onReply={onReply}
                    showReplies={true}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
