// components/onboarding/dao-details-step.tsx
"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface DAODetailsData {
  name: string;
  description: string;
  tokenName: string;
  tokenSymbol: string;
  initialSupply: string;
}

interface DAODetailsStepProps {
  data: DAODetailsData;
  onChange: (data: Partial<DAODetailsData>) => void;
  errors?: Partial<Record<keyof DAODetailsData, string>>;
  disabled?: boolean;
}

export function DAODetailsStep({
  data,
  onChange,
  errors,
  disabled,
}: DAODetailsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          DAO Details
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Set up your DAO's basic information and governance token.
        </p>
      </div>

      <div className="space-y-6">
        {/* Organization Name */}
        <div>
          <Label
            htmlFor="name"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            DAO Name *
          </Label>
          <Input
            id="name"
            type="text"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Ethereum Governance"
            className="mt-1"
            required
            disabled={disabled}
            autoFocus
          />
          {errors?.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label
            htmlFor="description"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Describe your DAO's purpose and goals..."
            rows={3}
            className="mt-1"
            disabled={disabled}
          />
          {errors?.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Token Details Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Governance Token Details
          </h3>

          <div className="space-y-4">
            <div>
              <Label
                htmlFor="tokenName"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Token Name *
              </Label>
              <Input
                id="tokenName"
                type="text"
                value={data.tokenName}
                onChange={(e) => onChange({ tokenName: e.target.value })}
                placeholder="e.g. Ethereum Governance Token"
                className="mt-1"
                required
                disabled={disabled}
              />
              {errors?.tokenName && (
                <p className="mt-1 text-sm text-red-600">{errors.tokenName}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="tokenSymbol"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Token Symbol *
              </Label>
              <Input
                id="tokenSymbol"
                type="text"
                value={data.tokenSymbol}
                onChange={(e) =>
                  onChange({ tokenSymbol: e.target.value.toUpperCase() })
                }
                placeholder="e.g. EGT"
                maxLength={6}
                className="mt-1"
                required
                disabled={disabled}
              />
              {errors?.tokenSymbol && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.tokenSymbol}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="initialSupply"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Initial Supply *
              </Label>
              <Input
                id="initialSupply"
                type="number"
                value={data.initialSupply}
                onChange={(e) => onChange({ initialSupply: e.target.value })}
                placeholder="1000000"
                min="1"
                className="mt-1"
                required
                disabled={disabled}
              />
              <p className="mt-1 text-xs text-gray-500">
                Initial tokens will be minted to your wallet
              </p>
              {errors?.initialSupply && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.initialSupply}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Network Info */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Network:</strong> Base Sepolia (Testnet)
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <strong>Factory Contract:</strong> Will be deployed automatically
          </p>
        </div>
      </div>
    </div>
  );
}
