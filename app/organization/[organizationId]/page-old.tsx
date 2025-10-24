// app/organization/[organizationId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Settings } from "lucide-react";
import Link from "next/link";
import ForumCard from "@/components/forum-card";
import type { Organization, Forum } from "@/types/forum";

interface PageParams {
  params: Promise<{
    organizationId: string;
  }>;
}

export default function OrganizationPage({ params }: PageParams) {
  const [resolvedParams, setResolvedParams] = useState<{
    organizationId: string;
  } | null>(null);

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForum, setShowCreateForum] = useState(false);
  const [newForumName, setNewForumName] = useState("");
  const [newForumSlug, setNewForumSlug] = useState("");

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (resolvedParams) {
      fetchOrganizationData();
    }
  }, [resolvedParams]);

  const fetchOrganizationData = async () => {
    if (!resolvedParams) return;

    try {
      setLoading(true);

      // Fetch organization
      const orgRes = await fetch(
        `/api/organization?organizationId=${resolvedParams.organizationId}`
      );
      const orgData = await orgRes.json();
      setOrganization(orgData);

      // Fetch forums
      const forumsRes = await fetch(
        `/api/organization/forums?organizationId=${resolvedParams.organizationId}`
      );
      const forumsData = await forumsRes.json();
      setForums(Array.isArray(forumsData) ? forumsData : []);
    } catch (error) {
      console.error("Error fetching organization data:", error);
      setForums([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedParams || !newForumName || !newForumSlug) return;

    try {
      const res = await fetch("/api/organization/forums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          daoId: resolvedParams.organizationId,
          name: newForumName,
          slug: newForumSlug,
        }),
      });

      if (res.ok) {
        setNewForumName("");
        setNewForumSlug("");
        setShowCreateForum(false);
        await fetchOrganizationData();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create forum");
      }
    } catch (error) {
      console.error("Error creating forum:", error);
      alert("Failed to create forum");
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  if (loading || !resolvedParams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Organizations
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {organization?.name?.charAt(0).toUpperCase() || "O"}
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                    {organization?.name || "Organization"}
                  </h1>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                    Chain ID: {organization?.onchain?.chainId}
                  </p>
                </div>
              </div>

              {organization?.description && (
                <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl">
                  {organization.description}
                </p>
              )}
            </div>

            <button
              onClick={() => setShowCreateForum(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              New Forum
            </button>
          </div>
        </div>

        {/* Create Forum Modal */}
        {showCreateForum && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                Create New Forum
              </h2>
              <form onSubmit={handleCreateForum} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Forum Name
                  </label>
                  <input
                    type="text"
                    value={newForumName}
                    onChange={(e) => {
                      setNewForumName(e.target.value);
                      setNewForumSlug(generateSlug(e.target.value));
                    }}
                    placeholder="General Discussion"
                    className="w-full px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={newForumSlug}
                    onChange={(e) => setNewForumSlug(e.target.value)}
                    placeholder="general-discussion"
                    className="w-full px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    URL-friendly identifier
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForum(false)}
                    className="flex-1 px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Forums Grid */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Forums
          </h2>

          {forums.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                No forums yet. Create your first forum to get started!
              </p>
              <button
                onClick={() => setShowCreateForum(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Forum
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forums.map((forum) => (
                <ForumCard
                  key={forum._id}
                  forum={forum}
                  organizationId={resolvedParams.organizationId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
