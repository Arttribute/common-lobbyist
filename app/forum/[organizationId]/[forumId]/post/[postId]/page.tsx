// app/forum/[organizationId]/[forumId]/post/[postId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bell, ArrowUp, MessageCircle, Bookmark, Square, Edit } from "lucide-react";
import MarkdownRenderer from "@/components/forum/markdown-renderer";
import { useAuth } from "@/context/auth-context";
import TokenBalance from "@/components/dao/token-balance";
import SignalButton from "@/components/forum/signal-button";

interface PageParams {
  params: Promise<{
    organizationId: string;
    forumId: string;
    postId: string;
  }>;
}

export default function PostDetailPage({ params }: PageParams) {
  const { authenticated, authState, login } = useAuth();
  const [resolvedParams, setResolvedParams] = useState<{
    organizationId: string;
    forumId: string;
    postId: string;
  } | null>(null);

  const [post, setPost] = useState<any>(null);
  const [dao, setDao] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (resolvedParams) {
      fetchPostData();
    }
  }, [resolvedParams]);

  const fetchPostData = async () => {
    if (!resolvedParams) return;

    try {
      setLoading(true);

      // Fetch DAO details
      const daoRes = await fetch(
        `/api/organization/${resolvedParams.organizationId}`
      );
      const daoData = await daoRes.json();
      setDao(daoData);

      // Fetch all contents for this forum
      const contentsRes = await fetch(
        `/api/organization/forums/contents?forumId=${resolvedParams.forumId}`
      );
      const contentsData = await contentsRes.json();

      // Find the specific post
      const currentPost = contentsData.find(
        (c: any) => c._id === resolvedParams.postId
      );
      setPost(currentPost);

      // Find all comments for this post (based on rootId or parentId)
      const postComments = contentsData.filter(
        (c: any) =>
          c.type === "comment" &&
          (c.rootId === resolvedParams.postId ||
            c.parentId === resolvedParams.postId)
      );
      setComments(postComments);
    } catch (error) {
      console.error("Error fetching post data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (parentId: string | null = null) => {
    if (!resolvedParams || !replyText.trim()) return;

    // Check authentication
    if (!authenticated) {
      alert("Please login to comment");
      await login();
      return;
    }

    try {
      const payload = {
        forumId: resolvedParams.forumId,
        daoId: resolvedParams.organizationId,
        type: "comment",
        content: { text: replyText },
        authorId: authState.walletAddress || authState.username || "anonymous",
        parentId: parentId || resolvedParams.postId,
      };

      const res = await fetch("/api/organization/forums/contents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.idToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setReplyText("");
        setReplyingTo(null);
        await fetchPostData();
      }
    } catch (error) {
      console.error("Error creating reply:", error);
    }
  };

  if (loading || !resolvedParams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-neutral-100 rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold mb-4">Post not found</h1>
          <Link
            href={`/forum/${resolvedParams.organizationId}/${resolvedParams.forumId}`}
            className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
          >
            Back to forum
          </Link>
        </div>
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
            {dao && <TokenBalance organizationId={dao._id} compact />}
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

      {/* Post Content */}
      <main className="max-w-[1336px] mx-auto px-6 py-12">
        <article className="max-w-[680px] mx-auto">
          {/* Post Title */}
          <h1 className="text-[42px] font-serif font-bold text-black dark:text-white mb-4 leading-tight">
            {post.content.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-neutral-200 dark:border-neutral-800">
            <div className="w-12 h-12 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-black dark:text-white">
                  User {post.authorId.slice(0, 8)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span>
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span>·</span>
                <span>5 min read</span>
              </div>
            </div>
          </div>

          {/* Post Actions Bar */}
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-4">
              {dao?.onchain?.registry && dao?.onchain?.token ? (
                <SignalButton
                  contentId={post._id}
                  daoId={dao._id}
                  registryAddress={dao.onchain.registry}
                  tokenAddress={dao.onchain.token}
                  currentSignals={post.onchain?.totalRaw || post.counters?.placedRaw || "0"}
                  userSignal={
                    authState.walletAddress
                      ? post.userSignals?.find(
                          (s: any) => s.userId === authState.walletAddress
                        )?.amount
                      : undefined
                  }
                  onSignalComplete={fetchPostData}
                />
              ) : (
                <button className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                  <ArrowUp className="w-6 h-6" />
                  <span className="text-sm">{post.counters?.placedRaw || "0"}</span>
                </button>
              )}
              <button className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                <MessageCircle className="w-6 h-6" />
                <span className="text-sm">{comments.length}</span>
              </button>
            </div>
            <button className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              <Bookmark className="w-6 h-6" />
            </button>
          </div>

          {/* Post Body */}
          <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none mb-12">
            <MarkdownRenderer content={post.content.text} />
          </div>

          {/* Claps and Actions Footer */}
          <div className="flex items-center justify-between py-8 border-t border-neutral-200 dark:border-neutral-800 mb-12">
            <div className="flex items-center gap-4">
              {dao?.onchain?.registry && dao?.onchain?.token ? (
                <SignalButton
                  contentId={post._id}
                  daoId={dao._id}
                  registryAddress={dao.onchain.registry}
                  tokenAddress={dao.onchain.token}
                  currentSignals={post.onchain?.totalRaw || post.counters?.placedRaw || "0"}
                  userSignal={
                    authState.walletAddress
                      ? post.userSignals?.find(
                          (s: any) => s.userId === authState.walletAddress
                        )?.amount
                      : undefined
                  }
                  onSignalComplete={fetchPostData}
                />
              ) : (
                <button className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                  <ArrowUp className="w-6 h-6" />
                  <span className="text-sm">{post.counters?.placedRaw || "0"}</span>
                </button>
              )}
              <button className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
                <MessageCircle className="w-6 h-6" />
                <span className="text-sm">{comments.length}</span>
              </button>
            </div>
            <button className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              <Bookmark className="w-6 h-6" />
            </button>
          </div>

          {/* Comments Section */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-12">
            <h2 className="text-2xl font-bold mb-8">
              Responses ({comments.length})
            </h2>

            {/* Reply Box */}
            <div className="mb-12">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-300 dark:bg-neutral-700 flex-shrink-0" />
                <div className="flex-1">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="What are your thoughts?"
                    className="w-full p-4 border border-neutral-200 dark:border-neutral-800 rounded-md bg-transparent focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 resize-none text-base"
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() => handleReply(null)}
                      disabled={!replyText.trim()}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-full text-sm font-medium transition-colors"
                    >
                      Respond
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-8">
              {comments.length === 0 ? (
                <p className="text-center text-neutral-500 py-12">
                  No responses yet. Be the first to share your thoughts.
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="border-b border-neutral-200 dark:border-neutral-800 pb-8"
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-300 dark:bg-neutral-700 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="mb-2">
                          <span className="font-medium text-black dark:text-white">
                            User {comment.authorId.slice(0, 8)}
                          </span>
                          <span className="text-neutral-500 text-sm ml-2">
                            {new Date(comment.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="prose prose-neutral dark:prose-invert max-w-none mb-4">
                          <MarkdownRenderer content={comment.content.text} />
                        </div>
                        <div className="flex items-center gap-4">
                          {dao?.onchain?.registry && dao?.onchain?.token ? (
                            <SignalButton
                              contentId={comment._id}
                              daoId={dao._id}
                              registryAddress={dao.onchain.registry}
                              tokenAddress={dao.onchain.token}
                              currentSignals={comment.onchain?.totalRaw || comment.counters?.placedRaw || "0"}
                              userSignal={
                                authState.walletAddress
                                  ? comment.userSignals?.find(
                                      (s: any) => s.userId === authState.walletAddress
                                    )?.amount
                                  : undefined
                              }
                              onSignalComplete={fetchPostData}
                            />
                          ) : (
                            <button className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors text-sm">
                              <ArrowUp className="w-4 h-4" />
                              <span>{comment.counters?.placedRaw || "0"}</span>
                            </button>
                          )}
                          <button
                            onClick={() => setReplyingTo(comment._id)}
                            className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                          >
                            Reply
                          </button>
                        </div>

                        {/* Nested Reply Box */}
                        {replyingTo === comment._id && (
                          <div className="mt-4 ml-4 pl-4 border-l-2 border-neutral-200 dark:border-neutral-800">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a reply..."
                              className="w-full p-3 border border-neutral-200 dark:border-neutral-800 rounded-md bg-transparent focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 resize-none text-sm"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText("");
                                }}
                                className="px-3 py-1 text-sm text-neutral-600 hover:text-black dark:hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReply(comment._id)}
                                disabled={!replyText.trim()}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-full text-sm"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
