"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Plus, Clock, History } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Session {
  _id: string;
  sessionId: string;
  title: string;
  lastMessageAt: string;
  messageCount: number;
  createdAt: string;
}

interface SessionHistoryProps {
  organizationId: string;
  currentSessionId: string | null;
  authToken: string | null;
  onSelectSession: (sessionId: string | null, title: string) => void;
  children: React.ReactNode; // Trigger button
}

export default function SessionHistory({
  organizationId,
  currentSessionId,
  authToken,
  onSelectSession,
  children,
}: SessionHistoryProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && authToken) {
      loadSessions();
    }
  }, [isOpen, organizationId, authToken]);

  const loadSessions = async () => {
    if (!authToken) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/agent/${organizationId}/sessions`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSessions(data.data || []);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleNewChat = () => {
    onSelectSession(null, "New Chat");
    setIsOpen(false);
  };

  const handleSelectSession = (session: Session) => {
    onSelectSession(session.sessionId, session.title);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-[400px] p-0"
        sideOffset={8}
      >
        {/* Header */}
        <DropdownMenuLabel className="py-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4" />
            <span>Chat History</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* New Chat Button */}
        <DropdownMenuItem
          onClick={handleNewChat}
          className="flex items-center gap-2 py-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">New Chat</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {/* Sessions List */}
        <ScrollArea className="max-h-[300px]">
          {isLoading ? (
            <div className="p-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No previous chats</p>
              <p className="text-xs mt-1">Start a new conversation!</p>
            </div>
          ) : (
            <div className="py-1">
              {sessions.map((session) => (
                <DropdownMenuItem
                  key={session._id}
                  onClick={() => handleSelectSession(session)}
                  className={`cursor-pointer px-3 py-2.5 ${
                    currentSessionId === session.sessionId ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 w-full">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {session.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(session.lastMessageAt)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {session.messageCount} msg
                        </span>
                      </div>
                    </div>
                    {currentSessionId === session.sessionId && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 shrink-0"></div>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
