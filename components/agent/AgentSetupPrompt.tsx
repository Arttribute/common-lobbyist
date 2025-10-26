"use client";

import { useState } from "react";
import { Bot, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface AgentSetupPromptProps {
  organizationId: string;
  organizationName: string;
  isCreator: boolean;
  onAgentCreated?: () => void;
}

export default function AgentSetupPrompt({
  organizationId,
  organizationName,
  isCreator,
  onAgentCreated,
}: AgentSetupPromptProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [persona, setPersona] = useState("");
  const [showPersonaInput, setShowPersonaInput] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const { authState } = useAuth();

  const handleCreateAgent = async () => {
    setIsCreating(true);
    setMessage(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (authState.idToken) {
        headers["Authorization"] = `Bearer ${authState.idToken}`;
      }

      const response = await fetch(`/api/agent/${organizationId}/create`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          persona: persona.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create agent");
      }

      setMessage({
        type: "success",
        text: "Agent created successfully! Refreshing page...",
      });

      // Call the callback if provided
      if (onAgentCreated) {
        onAgentCreated();
      }

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Error creating agent:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to create agent. Please try again.",
      });
      setIsCreating(false);
    }
  };

  if (!isCreator) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">
              Agent Not Available
            </h3>
            <p className="text-sm text-amber-800">
              {
                "This DAO doesn't have a community agent configured yet. Please contact the DAO creator to set up the agent."
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 rounded-full p-3">
          <Bot className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-2">
            Set Up Your Community Agent
          </h3>
          <p className="text-sm text-blue-800 mb-4">
            Your DAO needs a community agent to help members understand
            priorities, get insights on content, and facilitate discussions.
          </p>

          {!showPersonaInput ? (
            <div className="flex gap-3">
              <button
                onClick={handleCreateAgent}
                disabled={isCreating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Agent...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    Create Default Agent
                  </>
                )}
              </button>
              <button
                onClick={() => setShowPersonaInput(true)}
                disabled={isCreating}
                className="px-4 py-2 bg-white hover:bg-blue-50 border border-blue-300 text-blue-700 text-sm font-medium rounded-lg transition-colors"
              >
                Customize Persona
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  Agent Persona
                </label>
                <textarea
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  placeholder="Describe your agent's personality and focus areas..."
                  rows={4}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  disabled={isCreating}
                />
                <p className="mt-1 text-xs text-blue-700">
                  Optional: Customize how your agent should interact with the
                  community
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateAgent}
                  disabled={isCreating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4" />
                      Create Agent
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowPersonaInput(false)}
                  disabled={isCreating}
                  className="px-4 py-2 bg-white hover:bg-blue-50 border border-blue-300 text-blue-700 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
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
        </div>
      </div>
    </div>
  );
}
