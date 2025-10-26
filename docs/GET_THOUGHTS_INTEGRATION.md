# Get Thoughts Feature Integration Guide

This guide explains how to integrate the "Get Thoughts" feature into your pages, allowing users to get AI-powered insights from the community agent about their content before posting.

## Overview

The Get Thoughts feature consists of three main components:
1. **GetThoughtsButton** - A simple button UI component
2. **AgentChatWidget** - The chat interface (with ref support)
3. **ContentEditor** - Integrates the button into the editing flow

## How It Works

When a user clicks "Get Thoughts":
1. The button triggers a callback with the content
2. The chat widget opens automatically
3. A user message "Get content thoughts" is displayed
4. The actual prompt sent to the agent includes the content and asks for collective memory insights
5. The agent responds with insights based on DAO discussions and memory

## Integration Steps

### 1. Import Required Components

```typescript
import { useRef } from "react";
import AgentChatWidget, { AgentChatWidgetRef } from "@/components/agent/AgentChatWidget";
import ContentEditor from "@/components/forum/content-editor";
```

### 2. Create a Ref for the Chat Widget

```typescript
const chatWidgetRef = useRef<AgentChatWidgetRef>(null);
```

### 3. Create a Handler Function

```typescript
const handleGetThoughts = (content: string) => {
  if (chatWidgetRef.current) {
    chatWidgetRef.current.sendThoughtsQuery(content);
  }
};
```

### 4. Pass Props to ContentEditor

```typescript
<ContentEditor
  type="post"
  onSubmit={handleSubmit}
  organizationId={organizationId}
  onGetThoughts={handleGetThoughts}  // Add this
  enableAgentInsights={true}
/>
```

### 5. Add the Chat Widget with Ref

```typescript
<AgentChatWidget
  ref={chatWidgetRef}
  organizationId={organizationId}
  organizationName={organizationName}
/>
```

## Complete Example

See `/app/forum/[organizationId]/[forumId]/new/page.tsx` for a complete working example.

```typescript
export default function NewPostPage() {
  const chatWidgetRef = useRef<AgentChatWidgetRef>(null);
  const [dao, setDao] = useState<Organization | null>(null);

  const handleGetThoughts = (content: string) => {
    if (chatWidgetRef.current) {
      chatWidgetRef.current.sendThoughtsQuery(content);
    }
  };

  return (
    <div>
      <ContentEditor
        type="post"
        onSubmit={handleSubmit}
        organizationId={organizationId}
        onGetThoughts={handleGetThoughts}
      />

      {dao && (
        <AgentChatWidget
          ref={chatWidgetRef}
          organizationId={organizationId}
          organizationName={dao.name}
        />
      )}
    </div>
  );
}
```

## UI Behavior

- The "Get Thoughts" button only appears when there's content (title or text)
- The button is positioned on the left side of the submit button
- When clicked, the chat widget opens automatically and is not minimized
- The user sees "Get content thoughts" as their message
- The agent receives the full content and collective memory context

## Customization

You can customize the feature by:
- Changing the button text/icon in `GetThoughtsButton.tsx`
- Modifying the prompt template in `AgentChatWidget.tsx` (`sendThoughtsQuery` method)
- Adjusting when the button appears by modifying the condition in `ContentEditor.tsx`

## Notes

- The feature requires the organization to have an active agent configured
- The chat widget handles authentication automatically
- The agent response is rendered with ReactMarkdown for proper formatting
