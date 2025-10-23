// app/forum/[organizationId]/[forumId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Search, Bell, Square, Edit, ArrowUp, MessageCircle, Bookmark } from "lucide-react";
import Link from "next/link";

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
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Fetch posts only (not comments)
      const contentsRes = await fetch(
        `/api/organization/forums/contents?forumId=${resolvedParams.forumId}`
      );
      const contentsData = await contentsRes.json();
      const postsOnly = contentsData.filter((c: any) => c.type === "post");
      setPosts(postsOnly);
    } catch (error) {
      console.error("Error fetching forum data:", error);
    } finally {
      setLoading(false);
    }
  };


  if (loading || !resolvedParams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-neutral-100 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Medium-style Header */}
      <header className="sticky top-0 bg-white dark:bg-black border-b border-black dark:border-white z-50">
        <div className="max-w-[1336px] mx-auto px-6 h-[57px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Square className="w-11 h-11 fill-black dark:fill-white stroke-none" />
            </Link>
            <div className="relative hidden md:block">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-900 rounded-full text-sm w-60 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href={`/forum/${resolvedParams.organizationId}/${resolvedParams.forumId}/new`}
              className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
            >
              <Edit className="w-6 h-6" />
              <span className="hidden md:inline">Write</span>
            </Link>
            <button className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">
              <Bell className="w-6 h-6" />
            </button>
            <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
          </div>
        </div>
      </header>

      {/* Posts List */}
      <main className="max-w-[1336px] mx-auto px-6 py-12">
        <div className="grid grid-cols-12 gap-12">
          <div className="col-span-12 lg:col-span-8">
            <h1 className="text-4xl font-serif font-bold mb-8">{forum?.name || "Forum"}</h1>
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-base text-neutral-500 dark:text-neutral-400 mb-8">
                  No posts yet. Be the first to write something.
                </p>
                <Link
                  href={`/forum/${resolvedParams.organizationId}/${resolvedParams.forumId}/new`}
                  className="inline-block px-8 py-3 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black rounded-full text-sm font-medium transition-colors"
                >
                  Write a post
                </Link>
              </div>
            ) : (
              <div>
                {posts.map((post) => (
                  <article
                    key={post._id}
                    className="py-8 border-b border-neutral-200 dark:border-neutral-800"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-6 h-6 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">
                            User {post.authorId.slice(0, 8)}
                          </span>
                          <span className="text-neutral-500">·</span>
                          <span className="text-neutral-500">
                            {new Date(post.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/forum/${resolvedParams.organizationId}/${resolvedParams.forumId}/post/${post._id}`}
                      className="block group"
                    >
                      <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:underline">
                        {post.content.title}
                      </h2>
                      <p className="text-base text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3">
                        {post.content.text}
                      </p>
                    </Link>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                          <ArrowUp className="w-6 h-6" />
                          <span className="text-sm">24</span>
                        </button>
                        <button className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                          <MessageCircle className="w-6 h-6" />
                          <span className="text-sm">5</span>
                        </button>
                      </div>
                      <button className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                        <Bookmark className="w-6 h-6" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block col-span-4">
            <div className="sticky top-20">
              <h3 className="text-base font-semibold mb-4">About this forum</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                {forum?.description || "Share your thoughts and engage in meaningful discussions."}
              </p>
              <Link
                href={`/forum/${resolvedParams.organizationId}/${resolvedParams.forumId}/new`}
                className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              >
                Write a new post
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
