# Agent Chat Styling Guide

This document describes the enhanced markdown styling implementation for the Common Lobbyist agent chat interface.

## Overview

The agent chat uses a custom markdown renderer ([AgentMarkdownRenderer.tsx](../components/agent/AgentMarkdownRenderer.tsx)) to display citations and responses with elegant, user-friendly styling.

## Key Features

### 1. **Enhanced Citation Links**
- Clickable links with hover effects
- External link icon appears on hover
- Blue color scheme for consistency
- Opens in new tab automatically

### 2. **On-Chain Significance Display**
- Special formatting for "Supported by" lines
- Icons for members (Users) and tokens (Coins)
- Smaller, subtle text to not overwhelm the citation
- Grouped with relevance scores

### 3. **Numbered List Styling**
- Each citation has a left border that changes color on hover
- Hover effect adds subtle background color
- Proper spacing between citations
- Visual hierarchy for easy scanning

### 4. **Code Block Styling**
- Inline code: Gray background with rounded corners
- Block code: Dark theme with syntax-friendly colors
- Proper spacing and readability

### 5. **Contextual DAO ID**
- Agent receives DAO ID automatically with each message
- System context ensures accurate `lobbyistSemanticSearch` queries
- No manual configuration needed by users

## Visual Examples

### Citation Display

```markdown
I found 3 relevant discussions:

1. **[Vulnerability disclosure: incorrect blob preimages](link)** • 72% match
   Supported by 0 members

   This discusses a security vulnerability in Optimism's fault proof system.

2. **[Community Treasury Allocation](link)** • 85% match
   Supported by 45 members • 3,200 tokens staked

   This proposal outlines the treasury allocation strategy with strong support.
```

**Rendered with:**
- Bold titles with clickable links
- External link icon on hover
- Blue left border on list items
- Icons next to "Supported by" text
- Hover effects for interactivity

## Component Architecture

### AgentMarkdownRenderer.tsx

Custom React Markdown component with styled elements:

```typescript
const components: Components = {
  a: CustomLink,           // Enhanced links
  p: SmartParagraph,       // Context-aware paragraphs
  strong: StyledStrong,    // Bold text
  ol: StyledOrderedList,   // Numbered lists
  li: CitationListItem,    // List items with borders
  code: CodeBlock,         // Code formatting
  // ... more components
};
```

### Key Components

#### 1. Enhanced Links
```tsx
<a className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800
   font-medium hover:underline transition-colors group">
  {children}
  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
</a>
```

**Features:**
- Flexbox layout for icon alignment
- Group hover for coordinated transitions
- Smooth opacity animation
- Opens in new tab

#### 2. Smart Paragraphs
Detects special content patterns:
- "Supported by N members" → Adds user/coin icons
- Relevance scores → Smaller, subtle styling
- Regular text → Standard paragraph formatting

#### 3. Citation List Items
```tsx
<li className="relative pl-1 border-l-2 border-blue-200
   hover:border-blue-400 transition-colors">
  <div className="pl-4 pr-2 py-2 hover:bg-blue-50/50 rounded-r">
    {children}
  </div>
</li>
```

**Features:**
- Left border visual indicator
- Color change on hover
- Subtle background on hover
- Rounded corners for polish

## Color Scheme

### Primary Colors
- **Links**: `text-blue-600` → `hover:text-blue-800`
- **Borders**: `border-blue-200` → `hover:border-blue-400`
- **Background**: `hover:bg-blue-50/50` (subtle)

### Text Colors
- **Headings**: `text-gray-900` (dark, high contrast)
- **Body**: `text-gray-800` (slightly softer)
- **Meta info**: `text-gray-600` (de-emphasized)
- **Timestamps**: `text-gray-500` (lightest)

### Code Colors
- **Inline**: Gray background (`bg-gray-100`)
- **Blocks**: Dark theme (`bg-gray-900`, `text-gray-100`)

## Spacing & Typography

### Text Sizing
- **Body**: `text-sm` (14px)
- **Meta info**: `text-xs` (12px)
- **Icons**: `w-3 h-3` (12px × 12px)

### Spacing
- **Paragraph margins**: `mb-3` (12px bottom)
- **List spacing**: `space-y-4` (16px between items)
- **Citation padding**: `pl-4 pr-2 py-2` (comfortable touch targets)

### Line Height
- **Body text**: `leading-relaxed` (1.625)
- **Headings**: Default (1.5)

## Integration with Agent

### DAO Context Flow

```typescript
// 1. Frontend sends daoId
fetch('/api/agent/[organizationId]/chat', {
  body: JSON.stringify({
    message: userMessage,
    daoId: organizationId
  })
})

// 2. Backend prepares context
const contextMessage = `[CONTEXT] You are operating in DAO with ID: ${daoId}.
When using the lobbyistSemanticSearch tool, always use this daoId parameter.`

// 3. Agent receives context
messages: [
  { role: "system", content: contextMessage },
  { role: "user", content: userMessage }
]

// 4. Agent uses correct daoId in tool calls
lobbyistSemanticSearch({
  query: "user's question",
  daoId: daoId,  // ← Automatically from context
  limit: "10",
  minScore: "0.7",
  includeOnChainData: "true"
})
```

### Message Rendering Flow

```typescript
// 1. Agent streams response
for await (const chunk of agentStream) {
  assistantMessage += chunk;
}

// 2. Message stored with role
messages.push({
  role: "assistant",
  content: assistantMessage,
  timestamp: new Date()
})

// 3. Rendered with enhanced styling
{message.role === "assistant" ? (
  <AgentMarkdownRenderer content={message.content} />
) : (
  <p>{message.content}</p>
)}
```

## Hover States & Interactions

### 1. Citation Links
- **Default**: Blue text, no icon
- **Hover**: Darker blue, underline, icon fades in
- **Active**: Pressed state (browser default)

### 2. List Items
- **Default**: Light blue left border
- **Hover**: Darker border + subtle background
- **Transition**: Smooth 150ms ease

### 3. External Links
- **Icon opacity**: 0 → 100 on group hover
- **Link color**: `blue-600` → `blue-800`
- **Cursor**: Pointer (clickable indication)

## Accessibility Features

### 1. Semantic HTML
- Proper heading hierarchy (h1 → h2 → h3)
- Lists use `<ol>` and `<ul>` appropriately
- Links have descriptive text

### 2. Contrast Ratios
- Text colors meet WCAG AA standards
- Links distinguishable from body text
- Hover states clearly visible

### 3. Keyboard Navigation
- All links focusable
- Proper tab order
- Focus indicators visible

### 4. Screen Readers
- External link indicator for screen readers
- List structure properly announced
- Code blocks identified

## Best Practices for Agent Responses

### DO:
✅ Use numbered lists for multiple citations
✅ Include relevance scores in format: "72% match"
✅ Show on-chain data: "Supported by N members • X tokens"
✅ Provide markdown links: `[Title](url)`
✅ Keep explanations concise (1-2 sentences)

### DON'T:
❌ Quote content verbatim
❌ Use HTML tags (use markdown instead)
❌ Create overly long citations
❌ Forget the relevance explanation
❌ Omit the clickable link

## Customization Guide

### Changing Colors

To modify the color scheme, update these classes in [AgentMarkdownRenderer.tsx](../components/agent/AgentMarkdownRenderer.tsx):

```typescript
// Links
className="text-blue-600 hover:text-blue-800"  // Change blue-XXX

// Borders
className="border-blue-200 hover:border-blue-400"  // Change blue-XXX

// Background
className="hover:bg-blue-50/50"  // Change blue-XX
```

### Adjusting Spacing

```typescript
// List spacing
className="space-y-4"  // 16px → change to space-y-2 (8px) or space-y-6 (24px)

// Paragraph margins
className="mb-3"  // 12px → change to mb-2 (8px) or mb-4 (16px)
```

### Icon Sizes

```typescript
// Icons
className="w-3 h-3"  // 12px → change to w-4 h-4 (16px) or w-2 h-2 (8px)
```

## Testing Checklist

When making styling changes, verify:

- [ ] Links are clickable and open in new tabs
- [ ] External link icon appears on hover
- [ ] List items have visible left border
- [ ] Hover effects work smoothly
- [ ] "Supported by" lines show correct icons
- [ ] Code blocks render properly (inline and block)
- [ ] Spacing feels comfortable and readable
- [ ] Mobile responsive (text wraps, touch targets adequate)
- [ ] Dark mode compatible (if applicable)
- [ ] Accessibility: keyboard navigation, screen reader friendly

## Performance Considerations

### Optimizations Applied

1. **CSS Transitions**: Hardware-accelerated properties only
2. **Icon Loading**: Lucide icons tree-shaken automatically
3. **Markdown Parsing**: Single pass with react-markdown
4. **Re-renders**: Memoized components where needed

### Bundle Impact

- **AgentMarkdownRenderer**: ~3KB (gzipped)
- **Dependencies**:
  - react-markdown: ~7KB
  - remark-gfm: ~2KB
  - lucide-react: ~50 bytes per icon (tree-shaken)

## Related Documentation

- [Agent Citation Format](./AGENT_CITATION_FORMAT.md) - How agents should format responses
- [Memory Query Examples](./MEMORY_QUERY_EXAMPLES.md) - Example search queries
- [Memory System Summary](./MEMORY_SYSTEM_SUMMARY.md) - System architecture

## Example Screenshots

### Desktop View
```
┌──────────────────────────────────────────────────────┐
│ I found 3 relevant discussions:                      │
│                                                       │
│ 1. │ [Vulnerability disclosure...] • 72% match      │
│    │ 👥 Supported by 0 members                       │
│    │                                                  │
│    │ This discusses a security vulnerability...      │
│                                                       │
│ 2. │ [Community Treasury...] • 85% match            │
│    │ 👥 Supported by 45 members • 💰 3,200 tokens   │
│    │                                                  │
│    │ This proposal outlines the treasury...          │
└──────────────────────────────────────────────────────┘
```

### Mobile View
- Full width citations
- Touch-friendly targets (44px minimum)
- Reduced padding for space efficiency
- Same visual hierarchy maintained

---

**Last Updated**: 2025
**Component**: [AgentMarkdownRenderer.tsx](../components/agent/AgentMarkdownRenderer.tsx)
**Status**: ✅ Production Ready
