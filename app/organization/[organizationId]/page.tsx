// app/organization/[organizationId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ForumCard from "@/components/forum-card";
import TokenBalance from "@/components/dao/token-balance";

interface PageParams {
  params: Promise<{
    organizationId: string;
  }>;
}

export default function OrganizationPage({ params }: PageParams) {
  const [resolvedParams, setResolvedParams] = useState<{
    organizationId: string;
  } | null>(null);

  const [organization, setOrganization] = useState<any>(null);
  const [forums, setForums] = useState<any[]>([]);
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
        `/api/organization/${resolvedParams.organizationId}`
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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-neutral-100 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-serif font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                {organization?.name || "Organization"}
              </h1>
              {organization?.description && (
                <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {organization.description}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowCreateForum(true)}
              className="px-5 py-2 text-sm bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-full font-medium transition-colors"
            >
              New Forum
            </button>
          </div>

          {/* Token Balance Display */}
          {organization && (
            <div className="mt-8">
              <TokenBalance organizationId={organization._id} />
            </div>
          )}

          {/* DAO Info */}
          {organization?.onchain && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  Token
                </p>
                <p className="text-sm font-mono text-neutral-900 dark:text-neutral-100">
                  {organization.tokenSymbol}
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  Chain
                </p>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Base Sepolia
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  Total Supply
                </p>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {parseFloat(organization.initialSupply).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Create Forum Modal */}
      {showCreateForum && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-serif font-bold text-neutral-900 dark:text-neutral-100 mb-4">
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
                  className="w-full px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-md bg-transparent focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
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
                  className="w-full px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-md bg-transparent focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForum(false)}
                  className="flex-1 px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-md text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-md text-sm font-medium transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forums List */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {forums.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-base text-neutral-500 dark:text-neutral-400 mb-6">
              No forums yet. Create your first forum to get started.
            </p>
            <button
              onClick={() => setShowCreateForum(true)}
              className="px-6 py-2.5 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-full text-sm font-medium transition-colors"
            >
              Create Forum
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-lg font-serif font-semibold text-neutral-900 dark:text-neutral-100">
              Forums
            </h2>
            <div className="space-y-0">
              {forums.map((forum) => (
                <ForumCard
                  key={forum._id}
                  forum={forum}
                  organizationId={resolvedParams.organizationId}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
