// app/forum/[organizationId]/[forumId]/new/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Globe, Square } from "lucide-react";
import ContentEditor, { ContentData } from "@/components/forum/content-editor";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import AccountMenu from "@/components/account/account-menu";
import { Organization } from "@/types/organization";

interface PageParams {
  params: Promise<{
    organizationId: string;
    forumId: string;
  }>;
}

export default function NewPostPage({ params }: PageParams) {
  const router = useRouter();
  const { authenticated, authState, login } = useAuth();
  const [resolvedParams, setResolvedParams] = useState<{
    organizationId: string;
    forumId: string;
  } | null>(null);
  const [contentType, setContentType] = useState<"post" | "poll">("post");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dao, setDao] = useState<Organization | null>(null);

  useEffect(() => {
    params.then(async (resolved) => {
      setResolvedParams(resolved);

      try {
        const daoRes = await fetch(
          `/api/organization/${resolved.organizationId}`
        );
        const dao = await daoRes.json();
        setDao(dao);
        // You could use the DAO details here if needed, e.g:
        // const dao = await daoRes.json();
      } catch (error) {
        alert("Failed to fetch DAO details");
        return;
      }
    });
  }, [params]);

  const handleCreateContent = async (data: ContentData) => {
    if (!resolvedParams) return;

    // Check authentication
    if (!authenticated) {
      alert("Please login to create content");
      await login();
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        forumId: resolvedParams.forumId,
        daoId: resolvedParams.organizationId,
        type: contentType,
        content: data,
        authorId: authState.walletAddress || authState.username || "anonymous",
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
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
            </Link>
            <div>
              <p className="text-base tracking-tight">{dao?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={() => handleCreateContent} disabled={isSubmitting}>
              {isSubmitting ? "Publishing..." : "Publish"}
            </Button>
            <div className="flex items-center">
              <AccountMenu />
            </div>
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
