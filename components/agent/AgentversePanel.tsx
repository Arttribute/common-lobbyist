"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AgentverseSettings from "./AgentverseSettings";
import AgentDiscovery from "./AgentDiscovery";
import AgentMessaging from "./AgentMessaging";

interface AgentversePanelProps {
  organizationId: string;
  agentName: string;
}

interface SelectedAgent {
  address: string;
  name: string;
  description?: string;
}

export default function AgentversePanel({
  organizationId,
  agentName,
}: AgentversePanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<SelectedAgent | null>(null);
  const [activeTab, setActiveTab] = useState("settings");

  const handleSelectAgent = (agent: any) => {
    setSelectedAgent({
      address: agent.address,
      name: agent.name,
      description: agent.description,
    });
    setActiveTab("messaging");
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="discover">Discover</TabsTrigger>
        <TabsTrigger value="messaging">Messaging</TabsTrigger>
      </TabsList>

      <TabsContent value="settings" className="space-y-4">
        <AgentverseSettings
          organizationId={organizationId}
          agentName={agentName}
        />
      </TabsContent>

      <TabsContent value="discover" className="space-y-4">
        <AgentDiscovery
          organizationId={organizationId}
          onSelectAgent={handleSelectAgent}
        />
      </TabsContent>

      <TabsContent value="messaging" className="space-y-4">
        <AgentMessaging
          organizationId={organizationId}
          recipientAddress={selectedAgent?.address}
          recipientName={selectedAgent?.name}
        />
      </TabsContent>
    </Tabs>
  );
}
