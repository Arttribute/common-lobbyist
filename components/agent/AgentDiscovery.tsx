"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface DiscoveredAgent {
  address: string;
  name: string;
  description?: string;
  domain?: string;
  running: boolean;
  protocols?: string[];
  interactions: number;
  avatarUrl?: string;
  readme?: string;
  created: string;
  updated: string;
}

interface AgentDiscoveryProps {
  organizationId: string;
  onSelectAgent?: (agent: DiscoveredAgent) => void;
}

export default function AgentDiscovery({
  organizationId,
  onSelectAgent,
}: AgentDiscoveryProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [agents, setAgents] = useState<DiscoveredAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<DiscoveredAgent | null>(null);
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 20,
    total: 0,
  });

  const handleSearch = async (offset = 0) => {
    try {
      setSearching(true);
      const response = await fetch(
        `/api/agent/${organizationId}/agentverse/discover`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: query.trim() || undefined,
            runningOnly: true,
            limit: pagination.limit,
            offset,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to search agents");
      }

      const data = await response.json();
      setAgents(data.agents);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error searching agents:", error);
      toast({
        title: "Search Failed",
        description:
          error instanceof Error ? error.message : "Failed to search agents",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSelectAgent = (agent: DiscoveredAgent) => {
    setSelectedAgent(agent);
    if (onSelectAgent) {
      onSelectAgent(agent);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Discover Agents</CardTitle>
          <CardDescription>
            Search for agents on Agentverse to collaborate with
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search by name, description, or function..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(0);
                  }
                }}
              />
            </div>
            <Button onClick={() => handleSearch(0)} disabled={searching}>
              {searching ? "Searching..." : "Search"}
            </Button>
          </div>

          {pagination.total > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Found {pagination.total} agent{pagination.total !== 1 ? "s" : ""}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {agents.length > 0 && (
        <div className="space-y-3">
          {agents.map((agent) => (
            <Card
              key={agent.address}
              className={`cursor-pointer transition-colors hover:border-blue-300 ${
                selectedAgent?.address === agent.address
                  ? "border-blue-500 bg-blue-50"
                  : ""
              }`}
              onClick={() => handleSelectAgent(agent)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  {agent.avatarUrl && (
                    <img
                      src={agent.avatarUrl}
                      alt={agent.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}

                  {/* Agent Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{agent.name}</h3>
                      <Badge
                        variant={agent.running ? "default" : "secondary"}
                        className="ml-auto shrink-0"
                      >
                        {agent.running ? "Running" : "Stopped"}
                      </Badge>
                    </div>

                    {agent.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {agent.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {agent.domain && (
                        <span className="truncate">{agent.domain}</span>
                      )}
                      <span>{agent.interactions} interactions</span>
                    </div>

                    {agent.protocols && agent.protocols.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {agent.protocols.slice(0, 3).map((protocol) => (
                          <Badge key={protocol} variant="outline" className="text-xs">
                            {protocol}
                          </Badge>
                        ))}
                        {agent.protocols.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{agent.protocols.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedAgent?.address === agent.address && agent.readme && (
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-sm font-medium mb-2">About</Label>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {agent.readme}
                      </p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(agent.address);
                          toast({
                            title: "Copied",
                            description: "Agent address copied to clipboard",
                          });
                        }}
                      >
                        Copy Address
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleSearch(pagination.offset - pagination.limit)}
                disabled={pagination.offset === 0 || searching}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSearch(pagination.offset + pagination.limit)}
                disabled={
                  pagination.offset + pagination.limit >= pagination.total ||
                  searching
                }
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {!searching && agents.length === 0 && pagination.total === 0 && query && (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No agents found. Try a different search query.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
