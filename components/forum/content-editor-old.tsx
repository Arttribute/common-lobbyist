// components/forum/content-editor.tsx
"use client";

import { useState, useRef } from "react";
import { Upload, Eye, EyeOff, Image as ImageIcon, X } from "lucide-react";
import MarkdownRenderer from "./markdown-renderer";

interface ContentEditorProps {
  type: "post" | "comment" | "poll";
  onSubmit: (data: ContentData) => void;
  placeholder?: string;
  buttonText?: string;
}

export interface ContentData {
  title?: string;
  text: string;
  poll?: {
    options: Array<{ id: string; label: string }>;
    closesAt?: Date;
  };
}

export default function ContentEditor({
  type,
  onSubmit,
  placeholder = "Share your thoughts...",
  buttonText = "Post",
}: ContentEditorProps) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setUploading(true);
    try {
      // Convert image to base64 for markdown
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const altText = file.name.split(".")[0];
        const markdownImage = `![${altText}](${base64})`;

        // Insert at cursor position or append
        setText((prev) => prev + "\n\n" + markdownImage + "\n\n");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === "post" && !title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!text.trim() && type !== "poll") {
      alert("Please enter some content");
      return;
    }

    const data: ContentData = { text };

    if (type === "post") {
      data.title = title;
    }

    if (type === "poll") {
      const validOptions = pollOptions.filter((opt) => opt.trim());
      if (validOptions.length < 2) {
        alert("Please provide at least 2 poll options");
        return;
      }
      data.poll = {
        options: validOptions.map((label, i) => ({
          id: `opt_${i}`,
          label,
        })),
      };
    }

    onSubmit(data);

    // Reset form
    setTitle("");
    setText("");
    setPollOptions(["", ""]);
    setShowPreview(false);
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {type === "post" && (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full px-4 py-2 text-lg font-semibold border-b border-neutral-200 dark:border-neutral-800 bg-transparent focus:outline-none focus:border-blue-500"
          />
        )}

        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                title="Upload image"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-neutral-300 border-t-blue-500 rounded-full animate-spin" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
            >
              {showPreview ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Preview
                </>
              )}
            </button>
          </div>

          {showPreview ? (
            <div className="min-h-[200px] p-4 border border-neutral-200 dark:border-neutral-800 rounded-md">
              {text ? (
                <MarkdownRenderer content={text} />
              ) : (
                <p className="text-neutral-400 italic">Nothing to preview</p>
              )}
            </div>
          ) : (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              rows={8}
              className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-800 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono text-sm"
            />
          )}

          {!showPreview && (
            <p className="mt-2 text-xs text-neutral-500">
              Supports markdown formatting
            </p>
          )}
        </div>

        {type === "poll" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Poll Options
            </label>
            {pollOptions.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updatePollOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {pollOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removePollOption(index)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addPollOption}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              + Add option
            </button>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            {buttonText}
          </button>
        </div>
      </form>
    </div>
  );
}
