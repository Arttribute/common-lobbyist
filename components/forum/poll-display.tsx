// components/forum/poll-display.tsx
"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface PollDisplayProps {
  poll: {
    options: Array<{ id: string; label: string }>;
    closesAt?: Date;
  };
  contentId: string;
  introText?: string;
}

export default function PollDisplay({
  poll,
  contentId,
  introText,
}: PollDisplayProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votes, setVotes] = useState<Record<string, number>>(
    poll.options.reduce((acc, opt) => ({ ...acc, [opt.id]: 0 }), {})
  );

  const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);

  const handleVote = (optionId: string) => {
    if (hasVoted) return;

    setSelectedOption(optionId);
  };

  const submitVote = () => {
    if (!selectedOption) return;

    setVotes((prev) => ({
      ...prev,
      [selectedOption]: prev[selectedOption] + 1,
    }));
    setHasVoted(true);
  };

  const getPercentage = (optionId: string) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes[optionId] / totalVotes) * 100);
  };

  const isClosed = poll.closesAt && new Date(poll.closesAt) < new Date();

  return (
    <div className="space-y-4">
      {introText && (
        <p className="text-neutral-700 dark:text-neutral-300">{introText}</p>
      )}

      <div className="space-y-3">
        {poll.options.map((option) => {
          const percentage = getPercentage(option.id);
          const isSelected = selectedOption === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={hasVoted || isClosed}
              className={`w-full text-left relative overflow-hidden rounded-lg border-2 transition-all ${
                hasVoted
                  ? "cursor-default border-neutral-200 dark:border-neutral-800"
                  : isSelected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700"
              }`}
            >
              {/* Progress bar (shown after voting) */}
              {hasVoted && (
                <div
                  className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-blue-500 bg-blue-500"
                        : "border-neutral-300 dark:border-neutral-600"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {option.label}
                  </span>
                </div>

                {hasVoted && (
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {percentage}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!hasVoted && !isClosed && (
        <button
          onClick={submitVote}
          disabled={!selectedOption}
          className={`w-full py-2 rounded-md font-medium transition-colors ${
            selectedOption
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
          }`}
        >
          Submit Vote
        </button>
      )}

      {hasVoted && (
        <p className="text-sm text-neutral-500 text-center">
          {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
        </p>
      )}

      {isClosed && (
        <p className="text-sm text-red-500 text-center">Poll closed</p>
      )}

      {poll.closesAt && !isClosed && (
        <p className="text-sm text-neutral-500 text-center">
          Closes {new Date(poll.closesAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
