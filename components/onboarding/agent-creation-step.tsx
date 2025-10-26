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
        <div className="">
          <div className="bg-lime-200 w-52 h-6 -mb-7 ml-1 rounded-sm"></div>
          <h2 className="text-xl tracking-tight text-gray-900 dark:text-gray-100 mb-2">
            Community Agent Setup
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure your community agent that handles collective memory
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
            placeholder="e.g. A thoughtful advocate focused on environmental sustainability and long-term community growth..."
            rows={4}
            className="mt-1 text-xs"
            required
            disabled={disabled}
          />
          <p className="mt-1 text-xs text-gray-500">
            {
              "Define your agent's personality, values, and approach to help guide community discussions."
            }
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
      </div>
    </div>
  );
}
