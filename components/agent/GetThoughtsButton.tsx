"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GetThoughtsButtonProps {
  content: string;
  organizationId: string;
  onGetThoughts: (content: string) => void;
  disabled?: boolean;
}

export default function GetThoughtsButton({
  content,
  organizationId,
  onGetThoughts,
  disabled = false,
}: GetThoughtsButtonProps) {
  const handleClick = () => {
    if (content.trim()) {
      onGetThoughts(content.trim());
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || !content.trim()}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Sparkles className="w-4 h-4" />
      Get Thoughts
    </Button>
  );
}
