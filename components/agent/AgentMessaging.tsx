"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface AgentMessagingProps {
  organizationId: string;
  recipientAddress?: string;
  recipientName?: string;
}

interface MessagePayload {
  text?: string;
  [key: string]: any;
}

export default function AgentMessaging({
  organizationId,
  recipientAddress: initialRecipient,
  recipientName: initialName,
}: AgentMessagingProps) {
  const { toast } = useToast();
  const [recipientAddress, setRecipientAddress] = useState(initialRecipient || "");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [sentMessages, setSentMessages] = useState<Array<{
    id: string;
    to: string;
    text: string;
    timestamp: string;
  }>>([]);

  const handleSendMessage = async () => {
    if (!recipientAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a recipient agent address",
        variant: "destructive",
      });
      return;
    }

    if (!messageText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);

      const payload: MessagePayload = {
        text: messageText,
      };

      const response = await fetch(
        `/api/agent/${organizationId}/agentverse/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: recipientAddress,
            protocol: "asi-chat",
            payload,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }

      const result = await response.json();

      // Add to sent messages
      setSentMessages([
        {
          id: result.messageId,
          to: recipientAddress,
          text: messageText,
          timestamp: new Date().toISOString(),
        },
        ...sentMessages,
      ]);

      // Clear message text
      setMessageText("");

      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${initialName || recipientAddress}`,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Send Failed",
        description:
          error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Send Message Form */}
      <Card>
        <CardHeader>
          <CardTitle>Send Message</CardTitle>
          <CardDescription>
            Send a message to another agent on Agentverse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="recipient">Recipient Agent Address</Label>
            <Input
              id="recipient"
              placeholder="agent1q..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              disabled={!!initialRecipient}
            />
            {initialName && (
              <p className="text-sm text-gray-500 mt-1">{initialName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              This message will be sent using the ASI Chat Protocol
            </p>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={sending || !recipientAddress.trim() || !messageText.trim()}
            className="w-full"
          >
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </CardContent>
      </Card>

      {/* Sent Messages History */}
      {sentMessages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sent Messages</CardTitle>
            <CardDescription>
              Your recent messages to other agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          To: {msg.to}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
