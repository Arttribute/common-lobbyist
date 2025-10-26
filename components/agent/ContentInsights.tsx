"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface ContentInsightsProps {
  organizationId: string;
  content: string;
  onClose?: () => void;
}

type InsightType = "alignment" | "sentiment" | "suggestions";

export default function ContentInsights({
  organizationId,
  content,
  onClose,
}: ContentInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<InsightType>("alignment");
  const { authenticated, authState } = useAuth();

  const getInsights = async (type: InsightType) => {
    if (!authenticated || !content.trim()) return;

    setIsLoading(true);
    setSelectedType(type);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add auth token if available
      if (authState.idToken) {
        headers["Authorization"] = `Bearer ${authState.idToken}`;
      }

      const response = await fetch(`/api/agent/${organizationId}/insights`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: content.trim(),
          type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get insights");
      }

      const data = await response.json();
      setInsights(data.insights);
      setIsExpanded(true);
    } catch (error) {
      console.error("Error getting insights:", error);
      setInsights("Failed to get insights. Please try again.");
      setIsExpanded(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!authenticated) {
    return null;
  }

  return (
    <div className="border border-purple-200 bg-purple-50 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-100 to-blue-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-900">
            Agent Insights
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-purple-600 hover:text-purple-800 transition-colors"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Insight Type Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => getInsights("alignment")}
              disabled={isLoading}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-all ${
                selectedType === "alignment" && insights
                  ? "bg-purple-600 text-white"
                  : "bg-white text-purple-700 border border-purple-300 hover:bg-purple-100"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Check Alignment
            </button>
            <button
              onClick={() => getInsights("sentiment")}
              disabled={isLoading}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-all ${
                selectedType === "sentiment" && insights
                  ? "bg-purple-600 text-white"
                  : "bg-white text-purple-700 border border-purple-300 hover:bg-purple-100"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Predict Response
            </button>
            <button
              onClick={() => getInsights("suggestions")}
              disabled={isLoading}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-all ${
                selectedType === "suggestions" && insights
                  ? "bg-purple-600 text-white"
                  : "bg-white text-purple-700 border border-purple-300 hover:bg-purple-100"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Get Suggestions
            </button>
          </div>

          {/* Insights Display */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              <span className="ml-2 text-sm text-purple-700">
                Analyzing your content...
              </span>
            </div>
          )}

          {!isLoading && insights && (
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="prose prose-sm max-w-none">
                <div className="text-sm text-gray-800 whitespace-pre-wrap">
                  {insights}
                </div>
              </div>
            </div>
          )}

          {!isLoading && !insights && (
            <div className="text-center py-4 text-sm text-gray-600">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <p>
                Click a button above to get AI-powered insights on your
                content.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
