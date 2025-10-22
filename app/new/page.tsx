// app/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewOrganization() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [chainId, setChainId] = useState("1");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          onchain: {
            chainId: parseInt(chainId),
            factory: "0x0000000000000000000000000000000000000000",
            registry: "0x0000000000000000000000000000000000000000",
            token: "0x0000000000000000000000000000000000000000",
          },
        }),
      });

      if (res.ok) {
        const org = await res.json();
        router.push(`/organization/${org._id}`);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create organization");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      alert("Failed to create organization");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Simple Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            Create a new organization
          </h1>
          <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Start building your community forum. Organizations can have multiple
            forums for different discussion topics.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ethereum Foundation"
              className="w-full px-0 py-2.5 text-xl border-0 border-b-2 border-neutral-200 dark:border-neutral-800 bg-transparent focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your organization..."
              rows={4}
              className="w-full px-0 py-2.5 text-base border-0 border-b-2 border-neutral-200 dark:border-neutral-800 bg-transparent focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors resize-none placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Blockchain Network
            </label>
            <select
              value={chainId}
              onChange={(e) => setChainId(e.target.value)}
              className="w-full px-4 py-2.5 text-base border-2 border-neutral-200 dark:border-neutral-800 rounded-md bg-transparent focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 transition-colors"
            >
              <option value="1">Ethereum Mainnet</option>
              <option value="137">Polygon</option>
              <option value="10">Optimism</option>
              <option value="42161">Arbitrum</option>
              <option value="8453">Base</option>
            </select>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-6 py-2.5 text-sm bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Organization"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
