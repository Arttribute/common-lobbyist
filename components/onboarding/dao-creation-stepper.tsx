// components/onboarding/dao-creation-stepper.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useContracts } from "@/hooks/use-contracts";
import { getDaoFactoryAddress } from "@/lib/contracts/config";
import { baseSepolia } from "viem/chains";
import {
  Stepper,
  StepperContent,
  StepperActions,
} from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { DAODetailsStep } from "./dao-details-step";
import { AgentCreationStep } from "./agent-creation-step";
import { ForumCreationStep } from "./forum-creation-step";

interface DAODetailsData {
  name: string;
  description: string;
  tokenName: string;
  tokenSymbol: string;
  initialSupply: string;
}

interface AgentData {
  name: string;
  persona: string;
  instructions?: string;
  temperature: number;
  maxTokens: number;
}

interface ForumData {
  name: string;
  slug: string;
  description?: string;
}

interface CreationState {
  daoDetails: DAODetailsData;
  agent: AgentData;
  forum: ForumData;
}

const initialDAODetails: DAODetailsData = {
  name: "",
  description: "",
  tokenName: "",
  tokenSymbol: "",
  initialSupply: "1000000",
};

const initialAgent: AgentData = {
  name: "",
  persona: "",
  instructions: "",
  temperature: 0.7,
  maxTokens: 2000,
};

const initialForum: ForumData = {
  name: "",
  slug: "",
  description: "",
};

export function DAOCreationStepper() {
  const router = useRouter();
  const { authenticated, login, authState } = useAuth();
  const {
    createDAO,
    isLoading: contractLoading,
    error: contractError,
    isConnected,
  } = useContracts();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [creationState, setCreationState] = useState<CreationState>({
    daoDetails: initialDAODetails,
    agent: initialAgent,
    forum: initialForum,
  });
  const [errors, setErrors] = useState<Record<string, any>>({});

  const steps = [
    {
      id: "dao-details",
      title: "DAO Details",
      description: "DAO & token details",
      status:
        currentStep === 0
          ? "current"
          : currentStep > 0
          ? "completed"
          : "pending",
    },
    {
      id: "agent-creation",
      title: "Community Agent",
      description: "AI agent configuration",
      status:
        currentStep === 1
          ? "current"
          : currentStep > 1
          ? "completed"
          : "pending",
    },
    {
      id: "forum-creation",
      title: "DAO Forum",
      description: "Discussion forum setup",
      status:
        currentStep === 2
          ? "current"
          : currentStep > 2
          ? "completed"
          : "pending",
    },
  ];

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: Record<string, any> = {};

    if (stepIndex === 0) {
      // Validate DAO details
      if (!creationState.daoDetails.name.trim()) {
        newErrors.daoDetails = {
          ...newErrors.daoDetails,
          name: "DAO name is required",
        };
      }
      if (!creationState.daoDetails.tokenName.trim()) {
        newErrors.daoDetails = {
          ...newErrors.daoDetails,
          tokenName: "Token name is required",
        };
      }
      if (!creationState.daoDetails.tokenSymbol.trim()) {
        newErrors.daoDetails = {
          ...newErrors.daoDetails,
          tokenSymbol: "Token symbol is required",
        };
      }
      if (
        !creationState.daoDetails.initialSupply ||
        parseInt(creationState.daoDetails.initialSupply) <= 0
      ) {
        newErrors.daoDetails = {
          ...newErrors.daoDetails,
          initialSupply: "Initial supply must be greater than 0",
        };
      }
    } else if (stepIndex === 1) {
      // Validate agent
      if (!creationState.agent.name.trim()) {
        newErrors.agent = {
          ...newErrors.agent,
          name: "Agent name is required",
        };
      }
      if (!creationState.agent.persona.trim()) {
        newErrors.agent = {
          ...newErrors.agent,
          persona: "Agent persona is required",
        };
      }
    } else if (stepIndex === 2) {
      // Validate forum
      if (!creationState.forum.name.trim()) {
        newErrors.forum = {
          ...newErrors.forum,
          name: "Forum name is required",
        };
      }
      if (!creationState.forum.slug.trim()) {
        newErrors.forum = {
          ...newErrors.forum,
          slug: "Forum slug is required",
        };
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Check authentication
    if (!authenticated) {
      alert("Please login to create a DAO");
      await login();
      return;
    }

    if (!isConnected) {
      alert("Please connect your wallet to create a DAO");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Deploy contracts on-chain
      console.log("Deploying DAO on-chain...");
      const result = await createDAO({
        name: creationState.daoDetails.tokenName,
        symbol: creationState.daoDetails.tokenSymbol,
        initialSupply: creationState.daoDetails.initialSupply,
        metadataCid: `dao:${creationState.daoDetails.name
          .toLowerCase()
          .replace(/\s+/g, "-")}`,
      });

      if (!result) {
        throw new Error(contractError || "Failed to deploy DAO on-chain");
      }

      console.log("DAO deployed successfully:", result);

      // Step 2: Save to database
      console.log("Saving DAO to database...");

      const res = await fetch("/api/organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.idToken}`,
        },
        body: JSON.stringify({
          name: creationState.daoDetails.name,
          description: creationState.daoDetails.description,
          tokenName: creationState.daoDetails.tokenName,
          tokenSymbol: creationState.daoDetails.tokenSymbol,
          initialSupply: creationState.daoDetails.initialSupply,
          onchain: {
            chainId: baseSepolia.id,
            factory: getDaoFactoryAddress(baseSepolia.id),
            registry: result.registryAddress,
            token: result.tokenAddress,
            txHash: result.txHash,
            deployedBy: authState.walletAddress,
          },
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          error.error || "Failed to save organization to database"
        );
      }

      const org = await res.json();
      console.log("DAO saved to database:", org);

      // Step 3: Create agent
      console.log("Creating agent...");
      const agentRes = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.idToken}`,
        },
        body: JSON.stringify({
          organizationId: org._id,
          name: creationState.agent.name,
          persona: creationState.agent.persona,
          instructions: creationState.agent.instructions,
          temperature: creationState.agent.temperature,
          maxTokens: creationState.agent.maxTokens,
          topP: 1,
          presencePenalty: 0,
          frequencyPenalty: 0,
          isDefault: true,
        }),
      });

      if (!agentRes.ok) {
        console.warn(
          "Failed to create agent, but DAO was created successfully"
        );
      } else {
        console.log("Agent created successfully");
      }

      // Step 4: Create forum
      console.log("Creating forum...");
      const forumRes = await fetch("/api/organization/forums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.idToken}`,
        },
        body: JSON.stringify({
          daoId: org._id,
          name: creationState.forum.name,
          slug: creationState.forum.slug,
        }),
      });

      if (!forumRes.ok) {
        console.warn(
          "Failed to create forum, but DAO was created successfully"
        );
      } else {
        console.log("Forum created successfully");
      }

      // Success! Redirect to the organization page
      router.push(`/organization/${org._id}`);
    } catch (error) {
      console.error("Error creating organization:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create organization"
      );
      setLoading(false);
    }
  };

  const updateDAODetails = (updates: Partial<DAODetailsData>) => {
    setCreationState((prev) => ({
      ...prev,
      daoDetails: { ...prev.daoDetails, ...updates },
    }));
  };

  const updateAgent = (updates: Partial<AgentData>) => {
    setCreationState((prev) => ({
      ...prev,
      agent: { ...prev.agent, ...updates },
    }));
  };

  const updateForum = (updates: Partial<ForumData>) => {
    setCreationState((prev) => ({
      ...prev,
      forum: { ...prev.forum, ...updates },
    }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <main className="max-w-4xl mx-auto px-6 py-4">
        <div className="mb-10">
          <div className="">
            <div className="bg-teal-200 w-64 h-7 -mb-8 ml-2 rounded-sm"></div>
            <h1 className="text-3xl tracking-tight mb-3">Create a new DAO</h1>
          </div>
        </div>

        {!authenticated && (
          <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Please login to create a DAO
            </p>
            <button
              onClick={() => login()}
              className="mt-2 px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium transition-colors"
            >
              Login
            </button>
          </div>
        )}

        <div>
          {/*<Stepper steps={steps as any} currentStep={currentStep} />*/}
          <div className="flex justify-center mt-3 ">
            <div className="border border-black max-w-2xl rounded-sm">
              <StepperContent className="px-8">
                {currentStep === 0 && (
                  <DAODetailsStep
                    data={creationState.daoDetails}
                    onChange={updateDAODetails}
                    errors={errors.daoDetails}
                    disabled={loading}
                  />
                )}
                {currentStep === 1 && (
                  <AgentCreationStep
                    data={creationState.agent}
                    onChange={updateAgent}
                    errors={errors.agent}
                    disabled={loading}
                    daoName={creationState.daoDetails.name}
                  />
                )}
                {currentStep === 2 && (
                  <ForumCreationStep
                    data={creationState.forum}
                    onChange={updateForum}
                    errors={errors.forum}
                    disabled={loading}
                    daoName={creationState.daoDetails.name}
                  />
                )}
              </StepperContent>

              <StepperActions className="border-black p-4">
                <div className="flex justify-between w-full">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0 || loading}
                    className="px-10"
                  >
                    Previous
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={loading || !authenticated || !isConnected}
                    className="px-12"
                  >
                    {loading
                      ? "Creating..."
                      : currentStep === steps.length - 1
                      ? "Create DAO"
                      : "Next"}
                  </Button>
                </div>
              </StepperActions>
            </div>
          </div>

          {/* Status Messages */}
          {loading && (
            <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                ⏳ Creating your DAO... Please confirm any transactions in your
                wallet.
              </p>
            </div>
          )}

          {contractError && (
            <div className="mt-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                Error: {contractError}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
