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
        <div className="">
          <div className="bg-emerald-200 w-44 h-6 -mb-7 ml-1 rounded-sm"></div>
          <h2 className="text-lg tracking-tight text-gray-900 dark:text-gray-100 mb-2">
            DAO Discussion Forum
          </h2>
        </div>
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
      </div>
    </div>
  );
}
