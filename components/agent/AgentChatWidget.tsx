"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Minimize2, Maximize2, Heart, Coins } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import AgentFunding from "./AgentFunding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AgentChatWidgetProps {
  organizationId: string;
  organizationName: string;
}

export default function AgentChatWidget({
  organizationId,
  organizationName,
}: AgentChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [agentId, setAgentId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { authenticated, authState } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && authenticated) {
      loadAgentBalance();
    }
  }, [isOpen, authenticated]);

  const loadAgentBalance = async () => {
    try {
      const headers: Record<string, string> = {};

      // Add auth token if available
      if (authState.idToken) {
        headers["Authorization"] = `Bearer ${authState.idToken}`;
      }

      const response = await fetch(`/api/agent/${organizationId}/balance`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
        setAgentId(data.agentId);
      }
    } catch (error) {
      console.error("Error loading agent balance:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !authenticated) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add auth token if available
      if (authState.idToken) {
        headers["Authorization"] = `Bearer ${authState.idToken}`;
      }

      const response = await fetch(`/api/agent/${organizationId}/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: input,
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      // Create initial assistant message
      const assistantMessageObj: Message = {
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessageObj]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "token") {
                assistantMessage += data.content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    ...newMessages[newMessages.length - 1],
                    content: assistantMessage,
                  };
                  return newMessages;
                });
              } else if (data.type === "done") {
                // Stream completed
                break;
              }
            } catch (e) {
              console.warn("Failed to parse SSE data:", line);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-white border border-black shadow-md hover:shadow-xl rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110"
        aria-label="Open agent chat"
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-2xl border border-black transition-all duration-200 ${
        isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
      }`}
    >
      {/* Header */}
      <div className="bg-white p-4 rounded-t-lg border-b border-black">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div>
              <h3 className="font-semibold text-sm">
                {organizationName} Agent
              </h3>
              <p className="text-xs opacity-90">Community Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-gray-200 rounded p-1 transition-colors"
              aria-label={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-gray-200 rounded p-1 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {balance !== null && (
          <div className="flex items-center gap-1 text-xs opacity-90">
            <Coins className="w-3 h-3" />
            <span>{balance.toFixed(2)} $COMMON</span>
          </div>
        )}
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[430px] bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  Hello! I'm the {organizationName} community agent.
                </p>
                <p className="text-xs mt-2">
                  Ask me about community priorities, proposals, or how your
                  ideas align with our goals.
                </p>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-sky-100"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === "user"
                        ? "text-gray-500"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-400 p-4">
            {!authenticated ? (
              <div className="text-center text-sm text-gray-500">
                Please connect your wallet to chat
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask the agent anything..."
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Donate Modal */}
      {showDonateModal && agentId && (
        <div className="absolute top-full mt-2 right-0 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50 max-h-[500px] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Support Agent</h3>
            <button
              onClick={() => setShowDonateModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <AgentFunding
            organizationId={organizationId}
            organizationName={organizationName}
            agentId={agentId}
            isCreator={false}
          />
        </div>
      )}
    </div>
  );
}
