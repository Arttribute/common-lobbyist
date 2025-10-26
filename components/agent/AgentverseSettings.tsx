"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface AgentverseStatus {
  registered: boolean;
  agentverseConfigured: boolean;
  agentverse?: {
    address: string;
    name: string;
    domain?: string;
    running: boolean;
    compiled: boolean;
    description?: string;
    protocols?: string[];
    interactions: number;
    avatarUrl?: string;
    created: string;
    updated: string;
  };
  localAgent?: {
    id: string;
    name: string;
    organizationId: string;
    lastSynced?: string;
    discoverable?: boolean;
  };
}

interface AgentverseSettingsProps {
  organizationId: string;
  agentName: string;
}

export default function AgentverseSettings({
  organizationId,
  agentName,
}: AgentverseSettingsProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<AgentverseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Load Agentverse status
  useEffect(() => {
    loadStatus();
  }, [organizationId]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/agent/${organizationId}/agentverse/status`
      );

      if (!response.ok) {
        throw new Error("Failed to load Agentverse status");
      }

      const data = await response.json();
      console.log('=== AgentverseSettings Debug ===');
      console.log('Full status response:', data);
      console.log('agentverseConfigured:', data.agentverseConfigured);
      console.log('registered:', data.registered);
      console.log('debug info:', data.debug);
      console.log('===============================');
      setStatus(data);
    } catch (error) {
      console.error("Error loading Agentverse status:", error);
      toast({
        title: "Error",
        description: "Failed to load Agentverse status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      const response = await fetch(
        `/api/agent/${organizationId}/agentverse/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description,
            avatarUrl,
            discoverable: true,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to register agent");
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: "Agent registered on Agentverse!",
      });

      // Reload status
      await loadStatus();
    } catch (error) {
      console.error("Error registering agent:", error);
      toast({
        title: "Registration Failed",
        description:
          error instanceof Error ? error.message : "Failed to register agent",
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agentverse Integration</CardTitle>
          <CardDescription>
            Deploy your agent to Agentverse for multiagent communication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-500">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not configured
  if (!status?.agentverseConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agentverse Integration</CardTitle>
          <CardDescription>
            Deploy your agent to Agentverse for multiagent communication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Agentverse is not configured. Please add{" "}
              <code className="bg-yellow-100 px-2 py-1 rounded">
                AGENTVERSE_API_KEY
              </code>{" "}
              to your environment variables to enable Agentverse integration.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Already registered
  if (status.registered && status.agentverse) {
    const agent = status.agentverse;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Agentverse Integration</CardTitle>
          <CardDescription>
            Your agent is deployed on Agentverse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge variant={agent.running ? "default" : "secondary"}>
              {agent.running ? "Running" : "Stopped"}
            </Badge>
            {agent.compiled && <Badge variant="outline">Compiled</Badge>}
          </div>

          {/* Agent Details */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Agent Address</Label>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                  {agent.address}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(agent.address);
                    toast({
                      title: "Copied",
                      description: "Agent address copied to clipboard",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            {agent.domain && (
              <div>
                <Label className="text-sm font-medium">Domain</Label>
                <p className="mt-1 text-sm">{agent.domain}</p>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium">Name</Label>
              <p className="mt-1 text-sm">{agent.name}</p>
            </div>

            {agent.description && (
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="mt-1 text-sm text-gray-600">{agent.description}</p>
              </div>
            )}

            {agent.protocols && agent.protocols.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Protocols</Label>
                <div className="mt-1 flex gap-2">
                  {agent.protocols.map((protocol) => (
                    <Badge key={protocol} variant="outline">
                      {protocol}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium">Interactions</Label>
              <p className="mt-1 text-sm">{agent.interactions} total</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs text-gray-500">Created</Label>
                <p className="mt-1">
                  {new Date(agent.created).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Last Updated</Label>
                <p className="mt-1">
                  {new Date(agent.updated).toLocaleDateString()}
                </p>
              </div>
            </div>

            {status.localAgent?.lastSynced && (
              <div className="text-xs text-gray-500">
                Last synced:{" "}
                {new Date(status.localAgent.lastSynced).toLocaleString()}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t flex gap-2">
            <Button variant="outline" onClick={loadStatus}>
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not registered - show registration form
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agentverse Integration</CardTitle>
        <CardDescription>
          Deploy {agentName} to Agentverse for multiagent communication and
          discoverability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Benefits */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            Benefits of Agentverse
          </h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Make your agent discoverable by other agents</li>
            <li>• Enable multiagent collaboration and communication</li>
            <li>• Access agent marketplace and ecosystem</li>
            <li>• Track agent performance and interactions</li>
          </ul>
        </div>

        {/* Registration Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what your agent does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be visible to other agents on Agentverse
            </p>
          </div>

          <div>
            <Label htmlFor="avatarUrl">Avatar URL (Optional)</Label>
            <Input
              id="avatarUrl"
              type="url"
              placeholder="https://example.com/avatar.png"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Register Button */}
        <Button
          onClick={handleRegister}
          disabled={registering}
          className="w-full"
        >
          {registering ? "Registering..." : "Register on Agentverse"}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          By registering, your agent will be deployed to the Agentverse network
          and will be discoverable by other agents.
        </p>
      </CardContent>
    </Card>
  );
}
