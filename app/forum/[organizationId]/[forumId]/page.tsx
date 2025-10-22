// app/forum/[organizationId]/[forumId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, Sparkles } from "lucide-react";
import ContentEditor, { ContentData } from "@/components/forum/content-editor";
import ContentList from "@/components/forum/content-list";
import ForumStats from "@/components/forum/forum-stats";

interface PageParams {
  params: Promise<{
    organizationId: string;
    forumId: string;
  }>;
}

export default function ForumPage({ params }: PageParams) {
  const [resolvedParams, setResolvedParams] = useState<{
    organizationId: string;
    forumId: string;
  } | null>(null);

  const [forum, setForum] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [contentType, setContentType] = useState<"post" | "poll">("post");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "post" | "poll">("all");

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (resolvedParams) {
      fetchForumData();
    }
  }, [resolvedParams]);

  const fetchForumData = async () => {
    if (!resolvedParams) return;

    try {
      setLoading(true);

      // Fetch forum details
      const forumRes = await fetch(
        `/api/organization/forums?organizationId=${resolvedParams.organizationId}`
      );
      const forums = await forumRes.json();
      const currentForum = forums.find(
        (f: any) => f._id === resolvedParams.forumId
      );
      setForum(currentForum);

      // Fetch contents
      const contentsRes = await fetch(
        `/api/organization/forums/contents?forumId=${resolvedParams.forumId}`
      );
      const contentsData = await contentsRes.json();
      setContents(contentsData);
    } catch (error) {
      console.error("Error fetching forum data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async (data: ContentData) => {
    if (!resolvedParams) return;

    try {
      const payload = {
        forumId: resolvedParams.forumId,
        daoId: resolvedParams.organizationId,
        type: contentType,
        content: data,
        authorId: "temp-user-id", // Replace with actual user ID from auth
        rootId: "temp", // Will be set on server
        path: "temp", // Will be set on server
        depth: 0,
      };

      const res = await fetch("/api/organization/forums/contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowEditor(false);
        await fetchForumData();
      }
    } catch (error) {
      console.error("Error creating content:", error);
    }
  };

  const handleReply = async (contentId: string, replyText: string) => {
    if (!resolvedParams) return;

    try {
      const payload = {
        forumId: resolvedParams.forumId,
        daoId: resolvedParams.organizationId,
        type: "comment",
        content: { text: replyText },
        authorId: "temp-user-id", // Replace with actual user ID
        parentId: contentId,
      };

      const res = await fetch("/api/organization/forums/contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchForumData();
      }
    } catch (error) {
      console.error("Error creating reply:", error);
    }
  };

  const filteredContents = contents.filter((content) => {
    // Filter by type
    if (filterType !== "all" && content.type !== filterType) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const titleMatch = content.content.title
        ?.toLowerCase()
        .includes(searchLower);
      const textMatch = content.content.text
        ?.toLowerCase()
        .includes(searchLower);
      return titleMatch || textMatch;
    }

    return true;
  });

  const stats = {
    totalPosts: contents.filter((c) => c.type === "post").length,
    totalComments: contents.filter((c) => c.type === "comment").length,
    activeMembers: new Set(contents.map((c) => c.authorId)).size,
    todayActivity: contents.filter(
      (c) =>
        new Date(c.createdAt).toDateString() === new Date().toDateString()
    ).length,
  };

  if (loading || !resolvedParams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-neutral-100 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                {forum?.name || "Forum"}
              </h1>
              <p className="text-base text-neutral-600 dark:text-neutral-400">
                {stats.totalPosts} posts · {stats.activeMembers} members
              </p>
            </div>
            <button
              onClick={() => setShowEditor(!showEditor)}
              className="px-5 py-2 text-sm bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-full font-medium transition-colors"
            >
              Write
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-6 pr-4 py-2 text-sm border-0 border-b border-neutral-200 dark:border-neutral-800 bg-transparent focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors placeholder:text-neutral-400"
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* New Content Editor */}
        {showEditor && (
          <div className="mb-8 pb-8 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setContentType("post")}
                className={`text-sm font-medium pb-2 transition-colors ${
                  contentType === "post"
                    ? "text-neutral-900 dark:text-neutral-100 border-b-2 border-neutral-900 dark:border-neutral-100"
                    : "text-neutral-500 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                }`}
              >
                Post
              </button>
              <button
                onClick={() => setContentType("poll")}
                className={`text-sm font-medium pb-2 transition-colors ${
                  contentType === "poll"
                    ? "text-neutral-900 dark:text-neutral-100 border-b-2 border-neutral-900 dark:border-neutral-100"
                    : "text-neutral-500 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                }`}
              >
                Poll
              </button>
            </div>
            <ContentEditor
              type={contentType}
              onSubmit={handleCreateContent}
              placeholder={
                contentType === "post"
                  ? "Share your thoughts..."
                  : "Ask your question..."
              }
              buttonText={contentType === "post" ? "Publish" : "Create Poll"}
            />
          </div>
        )}

        {/* Content List */}
        <ContentList
          contents={filteredContents}
          onReply={handleReply}
          showNested={true}
        />
      </main>
    </div>
  );
}
