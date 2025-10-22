// components/forum/content-editor.tsx
"use client";

import { useState } from "react";

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
  placeholder = "Tell your story...",
  buttonText = "Publish",
}: ContentEditorProps) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  const handleSubmit = () => {
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
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  return (
    <div className="max-w-[740px] mx-auto py-8">
      {type === "post" && (
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full text-[42px] font-serif font-medium placeholder:text-neutral-300 dark:placeholder:text-neutral-700 focus:outline-none resize-none bg-transparent mb-2"
          rows={1}
          style={{ minHeight: "60px" }}
        />
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="w-full text-xl font-serif placeholder:text-neutral-300 dark:placeholder:text-neutral-700 focus:outline-none resize-none bg-transparent leading-relaxed"
        rows={10}
        style={{ minHeight: "200px" }}
      />

      {type === "poll" && (
        <div className="mt-8 space-y-3">
          <p className="text-lg font-medium mb-4">Poll Options</p>
          {pollOptions.map((option, index) => (
            <input
              key={index}
              type="text"
              value={option}
              onChange={(e) => updatePollOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-800 rounded-md bg-transparent focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 text-base"
            />
          ))}
          <button
            type="button"
            onClick={addPollOption}
            className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
          >
            + Add option
          </button>
        </div>
      )}

      <div className="mt-8 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
