# Agent Integration Setup Checklist

## Quick Start Guide

Follow this checklist to get your AgentCommons integration up and running.

## Prerequisites

- [ ] AgentCommons API access
- [ ] AgentCommons API key (if required)
- [ ] MongoDB configured
- [ ] Privy authentication working

## Environment Setup

### 1. Configure Environment Variables

Add to `.env.local`:

```bash
# AgentCommons Configuration
NEXT_PUBLIC_AGENTCOMMONS_API_URL=https://api.agentcommons.com
AGENTCOMMONS_API_KEY=your_api_key_here  # Add if required by AgentCommons
```

- [ ] Added `NEXT_PUBLIC_AGENTCOMMONS_API_URL`
- [ ] Added `AGENTCOMMONS_API_KEY` (if required)
- [ ] Restarted development server

## Verify Installation

### 2. Check File Structure

Ensure these files were created:

**Services:**
- [ ] `/lib/services/agentcommons.ts` exists

**Types:**
- [ ] `/types/organization.ts` exists

**API Routes:**
- [ ] `/app/api/agent/[organizationId]/chat/route.ts` exists
- [ ] `/app/api/agent/[organizationId]/insights/route.ts` exists
- [ ] `/app/api/agent/[organizationId]/route.ts` exists

**Components:**
- [ ] `/components/agent/AgentChatWidget.tsx` exists
- [ ] `/components/agent/ContentInsights.tsx` exists
- [ ] `/components/agent/AgentSettings.tsx` exists

**Documentation:**
- [ ] `/AGENT_INTEGRATION_GUIDE.md` exists
- [ ] `/AGENT_SETUP_CHECKLIST.md` exists

### 3. Verify Modifications

Check these files were updated:

- [ ] `/models/Organization.ts` has `agent` field
- [ ] `/app/api/organization/route.ts` creates agents
- [ ] `/components/forum/content-editor.tsx` imports ContentInsights
- [ ] `/app/forum/[organizationId]/[forumId]/page.tsx` has AgentChatWidget
- [ ] `/app/forum/[organizationId]/[forumId]/post/[postId]/page.tsx` has AgentChatWidget

## Testing

### 4. Test Agent Creation

**Create a new DAO:**
- [ ] Navigate to DAO creation page
- [ ] Fill in required fields
- [ ] Submit form
- [ ] Check MongoDB - organization should have `agent` field with `agentId`
- [ ] Check browser console - should see no errors
- [ ] Verify agent created in AgentCommons dashboard (if accessible)

**Expected result:**
```json
{
  "agent": {
    "agentId": "0x...",
    "enabled": true,
    "persona": "You are the autonomous advocate for...",
    "instructions": "As the [DAO Name] community agent...",
    "temperature": 0.7,
    "maxTokens": 2000,
    ...
  }
}
```

### 5. Test Chat Widget

**Navigate to forum:**
- [ ] Go to any forum page
- [ ] See floating chat button (bottom-right)
- [ ] Click chat button
- [ ] Widget expands
- [ ] Type a message
- [ ] Press Enter or click Send
- [ ] Receive streaming response
- [ ] See typing indicators
- [ ] Test minimize/maximize
- [ ] Test closing widget

**Expected behavior:**
- Widget appears only when `dao.agent.enabled === true`
- Messages stream token-by-token
- Chat history persists during session
- No console errors

### 6. Test Content Insights

**Create a post:**
- [ ] Go to "New Post" page
- [ ] Start typing title and content
- [ ] ContentInsights panel appears
- [ ] Click "Check Alignment"
- [ ] See loading indicator
- [ ] Receive insights
- [ ] Click "Predict Response"
- [ ] Receive different insights
- [ ] Click "Get Suggestions"
- [ ] Receive suggestions

**Expected behavior:**
- Insights panel shows only when content is present
- Loading states work correctly
- Different insights for different types
- Can expand/collapse panel

### 7. Test Agent Settings

**Access settings (as DAO creator):**
- [ ] Navigate to DAO settings/admin page
- [ ] Include `<AgentSettings />` component
- [ ] See current agent configuration
- [ ] Modify persona text
- [ ] Modify instructions text
- [ ] Adjust temperature slider
- [ ] Click "Save Configuration"
- [ ] See success message
- [ ] Refresh page
- [ ] Changes persisted

**Test non-creator access:**
- [ ] Login as non-creator
- [ ] View agent settings
- [ ] See "View Only" message
- [ ] Cannot modify settings

## Integration Points

### 8. Add Settings Page (if not exists)

If you need to create a settings page for DAO creators:

```tsx
// app/dao/[organizationId]/settings/page.tsx
import AgentSettings from "@/components/agent/AgentSettings";

export default function DaoSettingsPage({ params }) {
  const { organizationId } = params;
  const { user } = useAuth();
  const [dao, setDao] = useState(null);

  // Fetch DAO and check if user is creator
  const isCreator = dao?.creatorAddress.toLowerCase() === user?.walletAddress.toLowerCase();

  return (
    <div>
      <h1>DAO Settings</h1>
      <AgentSettings
        organizationId={organizationId}
        organizationName={dao?.name || ""}
        isCreator={isCreator}
      />
    </div>
  );
}
```

- [ ] Created settings page (if needed)
- [ ] Added route to settings
- [ ] Tested access control

### 9. Update Content Editor Usage

Ensure content editors pass `organizationId`:

```tsx
<ContentEditor
  type="post"
  onSubmit={handleSubmit}
  organizationId={organizationId}  // Add this
  enableAgentInsights={true}       // Optional, defaults to true
/>
```

Files to check:
- [ ] `/app/forum/[organizationId]/[forumId]/new/page.tsx`
- [ ] Any other content creation pages

## Troubleshooting

### Common Issues

**Agent not created during DAO creation:**
- [ ] Check console for errors
- [ ] Verify AgentCommons API URL is correct
- [ ] Check API key is valid
- [ ] Review `/app/api/organization/route.ts` logs
- [ ] Ensure MongoDB connection is working

**Chat widget not appearing:**
- [ ] Check `dao.agent.enabled` is `true`
- [ ] Verify `dao.agent.agentId` exists
- [ ] Check browser console for errors
- [ ] Verify imports are correct

**Streaming not working:**
- [ ] Check SSE endpoint returns correct headers
- [ ] Verify browser supports SSE
- [ ] Check network tab for streaming response
- [ ] Review CORS settings

**Insights not loading:**
- [ ] Verify user is authenticated
- [ ] Check content is not empty
- [ ] Review API endpoint response
- [ ] Check AgentCommons API status

## Production Checklist

### Before Deploying

- [ ] All environment variables set in production
- [ ] API keys secured (not in client-side code)
- [ ] Error logging configured
- [ ] Rate limiting considered
- [ ] Database indexes created for `organization.agent.agentId`
- [ ] SSE timeout configured appropriately
- [ ] CORS configured for SSE endpoints
- [ ] Agent API costs understood and budgeted
- [ ] Monitoring set up for agent usage
- [ ] Backup plan if AgentCommons is down

### Security Considerations

- [ ] API keys stored securely (environment variables only)
- [ ] Agent endpoints require authentication
- [ ] Only DAO creators can modify agent settings
- [ ] User input sanitized before sending to agent
- [ ] Rate limiting on agent endpoints
- [ ] Session management secure

### Performance Optimization

- [ ] Agent components lazy-loaded
- [ ] Streaming chunks optimized
- [ ] Database queries indexed
- [ ] Caching strategy for agent responses (if applicable)
- [ ] Error boundaries around agent components

## Next Steps

After completing this checklist:

1. **Test thoroughly** with real users
2. **Monitor usage** to understand patterns
3. **Gather feedback** on agent quality
4. **Iterate on prompts** (persona/instructions)
5. **Consider enhancements** from AGENT_INTEGRATION_GUIDE.md

## Support

If you encounter issues:

1. Check browser console for errors
2. Review network tab for failed requests
3. Check server logs for backend errors
4. Review [AGENT_INTEGRATION_GUIDE.md](AGENT_INTEGRATION_GUIDE.md)
5. Test AgentCommons API directly (Postman/curl)
6. Check AgentCommons documentation
7. Verify MongoDB schema matches expectations

## Success Criteria

✅ **Integration Complete When:**

- [ ] New DAOs automatically get agents
- [ ] Chat widget works on all forum pages
- [ ] Content insights appear in editor
- [ ] Settings page allows configuration
- [ ] All features work for authenticated users
- [ ] No console errors in normal operation
- [ ] Streaming responses work smoothly
- [ ] Error states handled gracefully

---

**Congratulations!** 🎉 Your AgentCommons integration is complete!

For detailed documentation, see [AGENT_INTEGRATION_GUIDE.md](AGENT_INTEGRATION_GUIDE.md).
