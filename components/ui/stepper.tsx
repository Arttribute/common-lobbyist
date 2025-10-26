// components/ui/stepper.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "current" | "completed" | "error";
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: StepperProps) {
  return (
    <nav className={cn("w-full", className)} aria-label="Progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li
            key={step.id}
            className={cn(
              "flex items-center",
              stepIdx !== steps.length - 1 ? "flex-1" : ""
            )}
          >
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => onStepClick?.(stepIdx)}
                disabled={!onStepClick}
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                  step.status === "completed" &&
                    "bg-green-600 border-green-600 text-white",
                  step.status === "current" &&
                    "bg-blue-600 border-blue-600 text-white",
                  step.status === "error" &&
                    "bg-red-600 border-red-600 text-white",
                  step.status === "pending" &&
                    "bg-white border-gray-300 text-gray-500",
                  onStepClick && "hover:border-gray-400 cursor-pointer",
                  !onStepClick && "cursor-default"
                )}
              >
                {step.status === "completed" ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : step.status === "error" ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{stepIdx + 1}</span>
                )}
              </button>
              <div className="ml-4 min-w-0">
                <div
                  className={cn(
                    "text-sm font-medium",
                    step.status === "current" && "text-blue-600",
                    step.status === "completed" && "text-green-600",
                    step.status === "error" && "text-red-600",
                    step.status === "pending" && "text-gray-500"
                  )}
                >
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-sm text-gray-500 mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            {stepIdx !== steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4",
                  step.status === "completed" ? "bg-green-600" : "bg-gray-300"
                )}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface StepperContentProps {
  children: React.ReactNode;
  className?: string;
}

export function StepperContent({ children, className }: StepperContentProps) {
  return <div className={cn("mt-8", className)}>{children}</div>;
}

interface StepperActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function StepperActions({ children, className }: StepperActionsProps) {
  return (
    <div
      className={cn(
        "flex justify-between items-center mt-8 pt-6 border-t border-gray-200",
        className
      )}
    >
      {children}
    </div>
  );
}
