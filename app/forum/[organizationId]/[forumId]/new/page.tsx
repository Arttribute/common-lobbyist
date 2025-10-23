// app/forum/[organizationId]/[forumId]/new/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Square } from "lucide-react";
import ContentEditor, { ContentData } from "@/components/forum/content-editor";

interface PageParams {
  params: Promise<{
    organizationId: string;
    forumId: string;
  }>;
}

export default function NewPostPage({ params }: PageParams) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{
    organizationId: string;
    forumId: string;
  } | null>(null);
  const [contentType, setContentType] = useState<"post" | "poll">("post");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const handleCreateContent = async (data: ContentData) => {
    if (!resolvedParams) return;

    try {
      setIsSubmitting(true);
      const payload = {
        forumId: resolvedParams.forumId,
        daoId: resolvedParams.organizationId,
        type: contentType,
        content: data,
        authorId: "temp-user-id", // Replace with actual user ID from auth
      };

      const res = await fetch("/api/organization/forums/contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push(
          `/forum/${resolvedParams.organizationId}/${resolvedParams.forumId}`
        );
      } else {
        alert("Failed to create post. Please try again.");
      }
    } catch (error) {
      console.error("Error creating content:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!resolvedParams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-neutral-100 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Simple Header */}
      <header className="sticky top-0 bg-white dark:bg-black border-b border-black dark:border-white z-50">
        <div className="max-w-[1336px] mx-auto px-6 h-[57px] flex items-center justify-between">
          <Link
            href={`/forum/${resolvedParams.organizationId}/${resolvedParams.forumId}`}
            className="flex items-center gap-2"
          >
            <Square className="w-11 h-11 fill-black dark:fill-white stroke-none" />
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleCreateContent}
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-full text-sm font-medium transition-colors"
            >
              {isSubmitting ? "Publishing..." : "Publish"}
            </button>
            <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="max-w-[1336px] mx-auto px-6 py-12">
        <div className="max-w-[740px] mx-auto">
          {/* Content Type Tabs */}
          <div className="flex gap-6 mb-8 border-b border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setContentType("post")}
              className={`pb-3 text-base transition-colors ${
                contentType === "post"
                  ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
              }`}
            >
              Story
            </button>
            <button
              onClick={() => setContentType("poll")}
              className={`pb-3 text-base transition-colors ${
                contentType === "poll"
                  ? "text-black dark:text-white border-b-2 border-black dark:border-white"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
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
                ? "Tell your story..."
                : "Ask your question..."
            }
            buttonText={contentType === "post" ? "Publish" : "Create Poll"}
          />
        </div>
      </main>
    </div>
  );
}
