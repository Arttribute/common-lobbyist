// app/organization/[organizationId]/agents/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Plus,
  Settings,
  Wallet,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import AgentFunding from "@/components/agent/AgentFunding";
import AgentSettings from "@/components/agent/AgentSettings";
import AgentversePanel from "@/components/agent/AgentversePanel";
import { Button } from "@/components/ui/button";
import type { Organization } from "@/types/forum";

interface PageParams {
  params: Promise<{
    organizationId: string;
  }>;
}

interface Agent {
  _id: string;
  name: string;
  organizationId: string;
  agentId: string;
  enabled: boolean;
  persona: string;
  instructions: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  presencePenalty: number;
  frequencyPenalty: number;
  createdBy: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AgentManagementPage({ params }: PageParams) {
  const router = useRouter();
  const { authenticated, authState } = useAuth();
  const [resolvedParams, setResolvedParams] = useState<{
    organizationId: string;
  } | null>(null);

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "funding" | "settings" | "agentverse"
  >("overview");
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (resolvedParams) {
      fetchData();
    }
  }, [resolvedParams]);

  const fetchData = async () => {
    if (!resolvedParams) return;

    try {
      setLoading(true);

      // Fetch organization
      const orgRes = await fetch(
        `/api/organization/${resolvedParams.organizationId}`
      );
      const orgData = await orgRes.json();
      setOrganization(orgData);

      // Check if user is the creator
      if (
        orgData.creatorAddress?.toLowerCase() !==
        authState.walletAddress?.toLowerCase()
      ) {
        router.push(`/organization/${resolvedParams.organizationId}`);
        return;
      }

      // Fetch agents
      const agentsRes = await fetch(
        `/api/agent?organizationId=${resolvedParams.organizationId}`
      );
      const agentsData = await agentsRes.json();
      setAgents(agentsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      showMessage("error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleAgentUpdate = () => {
    fetchData();
    showMessage("success", "Agent updated successfully");
  };

  if (loading || !resolvedParams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-neutral-100 rounded-full animate-spin" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Organization not found
          </h1>
          <Link
            href="/organizations"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to organizations
          </Link>
        </div>
      </div>
    );
  }

  const defaultAgent = agents.find((agent) => agent.isDefault);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/organization/${resolvedParams.organizationId}`}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <Bot className="w-8 h-8" />
              <div>
                <div className="relative">
                  <div className="bg-yellow-200 w-48 h-6 -mb-7 ml-1 rounded-sm"></div>
                  <h1 className="text-2xl tracking-tight text-gray-900 dark:text-gray-100 relative">
                    Agent Management
                  </h1>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Manage agents for {organization.name}
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`rounded-lg p-3 mb-4 flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : message.type === "error"
                  ? "bg-red-50 border border-red-200"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : message.type === "error" ? (
                <AlertCircle className="w-4 h-4 text-red-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-blue-600" />
              )}
              <span
                className={`text-sm ${
                  message.type === "success"
                    ? "text-green-800"
                    : message.type === "error"
                    ? "text-red-800"
                    : "text-blue-800"
                }`}
              >
                {message.text}
              </span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("funding")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "funding"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <Wallet className="w-4 h-4 inline mr-2" />
              Funding
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "settings"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Settings
            </button>
            <button
              onClick={() => setActiveTab("agentverse")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "agentverse"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <Bot className="w-4 h-4 inline mr-2" />
              Agentverse
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Agents List */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg tracking-tight text-gray-900 dark:text-gray-100">
                  Your Agents ({agents.length})
                </h2>
                <Button
                  onClick={() => setActiveTab("settings")}
                  className="flex items-center gap-2 rounded-md"
                >
                  <Plus className="w-4 h-4" />
                  Create Agent
                </Button>
              </div>

              {agents.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No agents yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Create your first agent to help your DAO members with
                    insights and discussions.
                  </p>
                  <Button
                    onClick={() => setActiveTab("settings")}
                    className="rounded-md"
                  >
                    Create Agent
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div
                      key={agent._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bot className="w-6 h-6 text-blue-600" />
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {agent.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {agent.isDefault
                                ? "Default Agent"
                                : "Additional Agent"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              agent.enabled
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {agent.enabled ? "Active" : "Disabled"}
                          </span>
                          <button
                            onClick={() => setActiveTab("settings")}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {agent.persona && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {agent.persona}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Wallet className="w-6 h-6" />
                  <h3 className="tracking-tight text-gray-900 dark:text-gray-100">
                    Agent Funding
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {
                    "Manage your agent's $COMMON token balance to keep it operational."
                  }
                </p>
                <Button
                  onClick={() => setActiveTab("funding")}
                  variant="outline"
                  className="w-full rounded-md"
                >
                  Manage Funding
                </Button>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6" />
                  <h3 className="tracking-tight text-gray-900 dark:text-gray-100">
                    Agent Settings
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {
                    "Configure your agent's personality, instructions, and behavior."
                  }
                </p>
                <Button
                  onClick={() => setActiveTab("settings")}
                  variant="outline"
                  className="w-full rounded-md"
                >
                  Configure Agent
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "funding" && defaultAgent && (
          <AgentFunding
            organizationId={resolvedParams.organizationId}
            organizationName={organization.name}
            agentId={defaultAgent.agentId}
            isCreator={true}
          />
        )}

        {activeTab === "settings" && organization && (
          <AgentSettings
            organizationId={resolvedParams.organizationId}
            organizationName={organization.name}
            isCreator={organization.creatorAddress?.toLowerCase() === authState.walletAddress?.toLowerCase()}
            onUpdate={handleAgentUpdate}
          />
        )}

        {activeTab === "agentverse" && defaultAgent && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Agentverse Integration
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Deploy your agent to Agentverse for multiagent communication,
                  discoverability, and collaboration with other AI agents.
                </p>
              </div>
              <AgentversePanel
                organizationId={resolvedParams.organizationId}
                agentName={defaultAgent.name}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
