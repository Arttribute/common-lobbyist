"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  Bot,
  AlertCircle,
  CheckCircle,
  Settings,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import AgentFunding from "./AgentFunding";

interface AgentSettingsProps {
  organizationId: string;
  organizationName: string;
  isCreator: boolean;
  onUpdate?: () => void;
}

type TabType = "configuration" | "funding";

export default function AgentSettings({
  organizationId,
  organizationName,
  isCreator,
}: AgentSettingsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("configuration");
  const [persona, setPersona] = useState("");
  const [instructions, setInstructions] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [enabled, setEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [agentId, setAgentId] = useState<string>("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadAgentConfig();
  }, [organizationId]);

  const loadAgentConfig = async () => {
    try {
      const response = await fetch(`/api/agent/${organizationId}`, {
        headers: {
          Authorization: `Bearer <actual token>}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.agent) {
          setAgentId(data.agent.agentId || "");
          setPersona(data.agent.persona || "");
          setInstructions(data.agent.instructions || "");
          setTemperature(data.agent.temperature || 0.7);
          setMaxTokens(data.agent.maxTokens || 2000);
          setEnabled(data.agent.enabled ?? true);
        }
      } else {
        // Agent not configured yet - this is fine, user can configure it
        console.log("Agent not configured yet");
      }
    } catch (error) {
      console.error("Error loading agent config:", error);
      showMessage("error", "Failed to load agent configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSave = async () => {
    if (!isCreator) {
      showMessage("error", "Only the DAO creator can update agent settings");
      return;
    }

    {
      /*if (!user) {
      showMessage("error", "Please connect your wallet");
      return;
    }*/
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/agent/${organizationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer <actual token>`,
        },
        body: JSON.stringify({
          persona,
          instructions,
          temperature,
          maxTokens,
          enabled,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update agent configuration");
      }

      showMessage("success", "Agent configuration saved successfully!");
    } catch (error) {
      console.error("Error saving agent config:", error);
      showMessage("error", "Failed to save agent configuration");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900">View Only</h3>
            <p className="text-sm text-yellow-800 mt-1">
              Only the DAO creator can modify agent settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <Bot className="w-6 h-6" />
        <div>
          <h2 className="text-2xl tracking-tight text-gray-900">Agent Settings</h2>
          <p className="text-sm text-gray-600">
            Configure the {organizationName} community agent
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab("configuration")}
            className={`px-4 py-2 text-sm transition-colors border-b-2 ${
              activeTab === "configuration"
                ? "border-black text-black"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuration
            </div>
          </button>
          <button
            onClick={() => setActiveTab("funding")}
            className={`px-4 py-2 text-sm transition-colors border-b-2 ${
              activeTab === "funding"
                ? "border-black text-black"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Funding
            </div>
          </button>
        </nav>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-lg p-4 flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <p
            className={`text-sm ${
              message.type === "success" ? "text-green-800" : "text-red-800"
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === "configuration" && (
        <>
          {/* Enable/Disable Toggle */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="tracking-tight text-gray-900">Agent Status</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Enable or disable the agent for this DAO
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Persona */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block">
              <span className="tracking-tight text-gray-900 mb-2 block">
                Agent Persona
              </span>
              <p className="text-sm text-gray-600 mb-3">
                Define the character and voice of your agent. How should it
                represent your community?
              </p>
              <textarea
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder="e.g., You are a thoughtful, analytical advocate for [DAO Name]..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={6}
              />
            </label>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <label className="block">
              <span className="tracking-tight text-gray-900 mb-2 block">
                Agent Instructions
              </span>
              <p className="text-sm text-gray-600 mb-3">
                Provide specific guidelines and rules for how the agent should
                operate and respond.
              </p>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g., When analyzing proposals, always consider..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={8}
              />
            </label>
          </div>

          {/* Advanced Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="tracking-tight text-gray-900 mb-4">
              Advanced Settings
            </h3>
            <div className="space-y-4">
              {/* Temperature */}
              <div>
                <label className="block">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Temperature: {temperature}
                    </span>
                    <span className="text-xs text-gray-500">
                      Lower = more focused, Higher = more creative
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </label>
              </div>

              {/* Max Tokens */}
              <div>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 mb-2 block">
                    Max Response Length
                  </span>
                  <input
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    min="100"
                    max="4000"
                    step="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of tokens (roughly 4 characters per token)
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-md"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Funding Tab */}
      {activeTab === "funding" && agentId && (
        <AgentFunding
          organizationId={organizationId}
          organizationName={organizationName}
          agentId={agentId}
          isCreator={isCreator}
        />
      )}
    </div>
  );
}
