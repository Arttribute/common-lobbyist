// components/onboarding/agent-creation-step.tsx
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AgentData {
  name: string;
  persona: string;
  instructions?: string;
  temperature: number;
  maxTokens: number;
}

interface AgentCreationStepProps {
  data: AgentData;
  onChange: (data: Partial<AgentData>) => void;
  errors?: Partial<Record<keyof AgentData, string>>;
  disabled?: boolean;
  daoName?: string;
}

export function AgentCreationStep({
  data,
  onChange,
  errors,
  disabled,
  daoName,
}: AgentCreationStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Community Agent
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Create an AI agent to help your DAO members understand community
          priorities and provide insights on proposals.
        </p>
      </div>

      <div className="space-y-6">
        {/* Agent Name */}
        <div>
          <Label
            htmlFor="agentName"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Agent Name *
          </Label>
          <Input
            id="agentName"
            type="text"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={
              daoName ? `${daoName} Community Agent` : "Community Agent"
            }
            className="mt-1"
            required
            disabled={disabled}
            autoFocus
          />
          {errors?.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Agent Persona */}
        <div>
          <Label
            htmlFor="persona"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Agent Persona *
          </Label>
          <Textarea
            id="persona"
            value={data.persona}
            onChange={(e) => onChange({ persona: e.target.value })}
            placeholder="e.g. A thoughtful advocate focused on environmental sustainability and long-term community growth. Values transparency and data-driven decision making..."
            rows={4}
            className="mt-1"
            required
            disabled={disabled}
          />
          <p className="mt-1 text-xs text-gray-500">
            Define your agent's personality, values, and approach to help guide
            community discussions.
          </p>
          {errors?.persona && (
            <p className="mt-1 text-sm text-red-600">{errors.persona}</p>
          )}
        </div>

        {/* Custom Instructions */}
        <div>
          <Label
            htmlFor="instructions"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Custom Instructions (Optional)
          </Label>
          <Textarea
            id="instructions"
            value={data.instructions || ""}
            onChange={(e) => onChange({ instructions: e.target.value })}
            placeholder="Additional specific instructions for how the agent should behave..."
            rows={3}
            className="mt-1"
            disabled={disabled}
          />
          <p className="mt-1 text-xs text-gray-500">
            Provide specific guidelines for how the agent should interact with
            community members.
          </p>
          {errors?.instructions && (
            <p className="mt-1 text-sm text-red-600">{errors.instructions}</p>
          )}
        </div>

        {/* AI Parameters */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            AI Parameters
          </h3>

          <div className="space-y-4">
            <div>
              <Label
                htmlFor="temperature"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Temperature: {data.temperature}
              </Label>
              <input
                id="temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={data.temperature}
                onChange={(e) =>
                  onChange({ temperature: parseFloat(e.target.value) })
                }
                className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                disabled={disabled}
              />
              <p className="mt-1 text-xs text-gray-500">
                Controls randomness (0 = focused, 2 = creative)
              </p>
            </div>

            <div>
              <Label
                htmlFor="maxTokens"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Max Response Length
              </Label>
              <Input
                id="maxTokens"
                type="number"
                value={data.maxTokens}
                onChange={(e) =>
                  onChange({ maxTokens: parseInt(e.target.value) })
                }
                min="100"
                max="4000"
                step="100"
                className="mt-1"
                disabled={disabled}
              />
              <p className="mt-1 text-xs text-gray-500">
                Maximum number of tokens in agent responses (100-4000)
              </p>
              {errors?.maxTokens && (
                <p className="mt-1 text-sm text-red-600">{errors.maxTokens}</p>
              )}
            </div>
          </div>
        </div>

        {/* Agent Preview */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Agent Preview
          </h4>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p>
              <strong>Name:</strong> {data.name || "Community Agent"}
            </p>
            <p>
              <strong>Persona:</strong>{" "}
              {data.persona
                ? `${data.persona.substring(0, 100)}${
                    data.persona.length > 100 ? "..." : ""
                  }`
                : "Not specified"}
            </p>
            <p>
              <strong>Temperature:</strong> {data.temperature} (Creativity
              level)
            </p>
            <p>
              <strong>Max Response Length:</strong> {data.maxTokens} tokens
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
