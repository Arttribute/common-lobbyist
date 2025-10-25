// components/onboarding/forum-creation-step.tsx
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ForumData {
  name: string;
  slug: string;
  description?: string;
}

interface ForumCreationStepProps {
  data: ForumData;
  onChange: (data: Partial<ForumData>) => void;
  errors?: Partial<Record<keyof ForumData, string>>;
  disabled?: boolean;
  daoName?: string;
}

export function ForumCreationStep({
  data,
  onChange,
  errors,
  disabled,
  daoName,
}: ForumCreationStepProps) {
  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (name: string) => {
    onChange({
      name,
      slug: generateSlug(name),
    });
  };

  const handleSlugChange = (slug: string) => {
    onChange({ slug: generateSlug(slug) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          DAO Forum
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Create a discussion forum where your DAO members can propose ideas,
          vote on proposals, and build consensus.
        </p>
      </div>

      <div className="space-y-6">
        {/* Forum Name */}
        <div>
          <Label
            htmlFor="forumName"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Forum Name *
          </Label>
          <Input
            id="forumName"
            type="text"
            value={data.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder={daoName ? `${daoName} Discussion` : "Main Discussion"}
            className="mt-1"
            required
            disabled={disabled}
            autoFocus
          />
          {errors?.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Forum Slug */}
        <div>
          <Label
            htmlFor="forumSlug"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Forum URL Slug *
          </Label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
              /forum/
            </span>
            <Input
              id="forumSlug"
              type="text"
              value={data.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="main-discussion"
              className="rounded-l-none border-l-0"
              required
              disabled={disabled}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            This will be the URL for your forum. Only lowercase letters,
            numbers, and hyphens allowed.
          </p>
          {errors?.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
          )}
        </div>

        {/* Forum Description */}
        <div>
          <Label
            htmlFor="forumDescription"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Forum Description (Optional)
          </Label>
          <Textarea
            id="forumDescription"
            value={data.description || ""}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Describe the purpose of this forum and what topics will be discussed..."
            rows={3}
            className="mt-1"
            disabled={disabled}
          />
          <p className="mt-1 text-xs text-gray-500">
            Help members understand what this forum is for and what kind of
            discussions are welcome.
          </p>
          {errors?.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Forum Features */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Forum Features
          </h3>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Quadratic Voting:</strong> Members can signal support
                for proposals with weighted votes
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <strong>AI Agent Integration:</strong> Your community agent will
                provide insights and analysis
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Signal Registry:</strong> Track community sentiment and
                proposal history on-chain
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Sybil Resistance:</strong> Built-in protection against
                spam and manipulation
              </div>
            </div>
          </div>
        </div>

        {/* Forum Preview */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
            Forum Preview
          </h4>
          <div className="text-sm text-green-800 dark:text-green-200">
            <p>
              <strong>Name:</strong> {data.name || "Main Discussion"}
            </p>
            <p>
              <strong>URL:</strong> /forum/{data.slug || "main-discussion"}
            </p>
            <p>
              <strong>Description:</strong>{" "}
              {data.description || "No description provided"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
