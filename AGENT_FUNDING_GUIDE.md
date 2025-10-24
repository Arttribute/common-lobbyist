# Agent Funding Guide

## Overview

AgentCommons agents require $COMMON tokens to operate. This guide explains how the funding system works and how to use it.

## How It Works

### Agent Wallet
- Each agent has its own wallet (the `agentId` is the wallet address)
- The agent pays for all chat interactions from its own balance
- Users chat with the agent **for free** - no payment required
- The agent's balance decreases with each interaction

### Funding Sources
1. **DAO Creator Funding**: The DAO creator can fund the agent to keep it operational
2. **Community Donations**: Any DAO member can donate $COMMON tokens to support the agent

## $COMMON Token

- **Token Address**: `0x09d3e33fBeB985653bFE868eb5a62435fFA04e4F`
- **Chain**: Base Sepolia (testnet)
- **Symbol**: $COMMON

## Features Implemented

### 1. **Agent Balance Display**
- Visible in the chat widget header
- Shows current $COMMON balance
- Updates when funding is added
- Color-coded status:
  - 🔴 Red: < 10 tokens (critical)
  - 🟡 Yellow: 10-50 tokens (low)
  - 🟢 Green: > 50 tokens (healthy)

### 2. **Funding Interface**
Located in Agent Settings → Funding tab:
- View current balance
- See agent wallet address
- Quick amount buttons (10, 50, 100, 500)
- Custom amount input
- Real-time transaction tracking
- Low balance warnings for creators

### 3. **Donation Button**
In the chat widget:
- Heart icon (❤️) in the header
- Opens donation modal
- Same funding interface as settings
- Easy one-click donations while chatting

## Usage

### For DAO Creators

#### Funding Your Agent

1. **Navigate to Agent Settings**
   ```
   DAO Dashboard → Settings → Agent Settings → Funding Tab
   ```

2. **Check Balance**
   - View current $COMMON balance
   - See wallet address
   - Check for low balance warnings

3. **Add Funds**
   - Enter amount or use quick buttons
   - Click "Fund Agent"
   - Approve transaction in your wallet
   - Wait for confirmation

4. **Recommended Balance**
   - Minimum: 10 $COMMON
   - Recommended: 100+ $COMMON for continuous operation
   - Cost per chat: ~0.1-0.5 $COMMON (varies by message length)

#### Low Balance Warnings

When balance drops below 10 $COMMON:
- Red warning appears in Funding tab
- Agent may stop responding if balance reaches 0
- Recommended: Set up auto-funding or monitor regularly

### For DAO Members

#### Donating to the Agent

**Option 1: From Chat Widget**
1. Open chat widget
2. Click the heart icon (❤️) in header
3. Enter donation amount
4. Click "Donate"
5. Approve transaction

**Option 2: From Settings (if accessible)**
1. Visit Agent Settings → Funding
2. Enter amount
3. Click "Donate"
4. Approve transaction

#### Why Donate?

- Support the agent's continuous operation
- Help your DAO maintain 24/7 agent availability
- Contribute to community infrastructure
- Enable more community members to benefit

## API Endpoints

### Get Agent Balance
```
GET /api/agent/:organizationId/balance
```

**Response:**
```json
{
  "balance": 123.45,
  "walletAddress": "0x...",
  "agentId": "0x..."
}
```

### Fund Agent
```
POST /api/agent/:organizationId/fund
```

**Request Body:**
```json
{
  "txHash": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "agentWalletAddress": "0x...",
  "txHash": "0x...",
  "message": "Funding transaction submitted successfully"
}
```

## Technical Implementation

### Smart Contract Interaction

The funding uses standard ERC-20 `transfer` function:

```typescript
// Transfer $COMMON tokens to agent
await writeContract({
  address: COMMON_TOKEN_ADDRESS,
  abi: ERC20_ABI,
  functionName: "transfer",
  args: [agentWalletAddress, parseEther(amount)],
});
```

### Transaction Flow

1. **User Initiates**:
   - User clicks "Fund" or "Donate"
   - Enters amount

2. **Wallet Interaction**:
   - Wagmi triggers wallet popup
   - User approves transaction
   - Transaction submitted to blockchain

3. **Confirmation**:
   - Transaction confirmed on-chain
   - Balance updates automatically
   - Success message displayed

4. **Balance Update**:
   - Frontend refetches balance
   - New balance displayed
   - Low balance warnings cleared if applicable

### Components

#### AgentFunding
Main funding component with:
- Balance display with color-coding
- Wallet address display
- Amount input with quick buttons
- Transaction handling
- Success/error states
- Low balance warnings

**Props:**
```typescript
interface AgentFundingProps {
  organizationId: string;
  organizationName: string;
  agentId: string;
  isCreator: boolean;
}
```

#### AgentChatWidget (Enhanced)
Chat widget now includes:
- Balance display in header
- Heart button for donations
- Donation modal with full funding interface
- Real-time balance updates

## Cost Analysis

### Agent Operating Costs

| Interaction Type | Approx. Cost | Notes |
|-----------------|--------------|-------|
| Short message (< 100 chars) | 0.01-0.05 $COMMON | Quick questions |
| Medium message (100-500 chars) | 0.1-0.3 $COMMON | Typical discussion |
| Long message (> 500 chars) | 0.3-0.5 $COMMON | Detailed analysis |
| Content insights | 0.2-0.4 $COMMON | Analyzing posts |

### Budget Planning

For a moderately active DAO (50 interactions/day):
- Daily cost: ~5-15 $COMMON
- Monthly cost: ~150-450 $COMMON
- Recommended initial funding: 500 $COMMON

For a very active DAO (200 interactions/day):
- Daily cost: ~20-60 $COMMON
- Monthly cost: ~600-1800 $COMMON
- Recommended initial funding: 2000 $COMMON

## Best Practices

### For DAO Creators

1. **Initial Funding**
   - Fund with at least 100 $COMMON at launch
   - More active DAOs should start with 500+

2. **Monitoring**
   - Check balance weekly
   - Set up alerts for low balance
   - Consider community fundraising for popular agents

3. **Transparency**
   - Share agent costs with community
   - Explain how donations help
   - Regular balance updates

4. **Sustainability**
   - Encourage community donations
   - Consider treasury allocations
   - Plan for ongoing funding

### For DAO Members

1. **Support Active Agents**
   - Donate to agents you use frequently
   - Consider regular small donations vs. large one-time

2. **Respect the Resource**
   - Agent responses consume tokens
   - Be concise when possible
   - Combine questions in one message

3. **Community Coordination**
   - Organize funding drives
   - Share donation links
   - Celebrate funding milestones

## Troubleshooting

### Transaction Failed
- **Insufficient $COMMON**: Check your wallet balance
- **Gas Issues**: Ensure you have ETH for gas on Base
- **Network Congestion**: Try again in a few minutes
- **Wrong Network**: Confirm you're on Base Sepolia

### Balance Not Updating
- **Wait for Confirmation**: Transactions can take 10-30 seconds
- **Refresh Page**: Sometimes UI needs manual refresh
- **Check Transaction**: Verify on BaseScan
- **Cache Issue**: Clear browser cache

### Agent Not Responding
- **Check Balance**: Agent may be out of funds
- **Creator Action Needed**: DAO creator must fund
- **Agent Disabled**: Check settings for enabled status

## FAQ

### Do I need $COMMON to chat with the agent?
**No!** Chatting is completely free for users. The agent pays for all interactions from its own wallet.

### How do I get $COMMON tokens?
- Purchase on exchanges (when available)
- Receive from DAO treasury
- Community airdrops
- Faucets (testnet)

### Can I withdraw funds from the agent?
**No.** Once tokens are sent to the agent wallet, they can only be used for agent operations. This ensures donations go toward their intended purpose.

### What happens if the agent runs out of funds?
The agent will stop responding to chat messages until it's refunded. The DAO creator or community members need to add more $COMMON tokens.

### Is there a minimum donation amount?
While there's no hard minimum, we recommend at least 1 $COMMON to make the transaction gas-efficient.

### Can I see transaction history?
Yes! Click on any transaction hash to view it on BaseScan, which shows the complete transaction details.

## Security Considerations

### Smart Contract Safety
- Uses standard ERC-20 transfer
- No approval needed (direct transfer)
- Transactions are irreversible
- Verify addresses before sending

### Best Practices
- **Double-check amounts**: Transactions cannot be reversed
- **Verify wallet address**: Ensure you're sending to correct agent
- **Start small**: Test with small amount first
- **Keep records**: Save transaction hashes

### Agent Wallet Security
- Agent wallet is managed by AgentCommons
- Private keys stored securely off-chain
- Cannot be accessed by DAO creator
- Used exclusively for agent operations

## Monitoring & Analytics

### Balance Tracking
Monitor agent health:
- Current balance
- Daily spending rate
- Estimated days remaining
- Transaction history

### Usage Patterns
Understanding costs:
- Peak usage times
- Average cost per interaction
- Monthly burn rate
- Funding frequency needed

## Future Enhancements

Potential improvements:
1. **Auto-refill**: Automatic funding when balance drops
2. **Subscription Model**: Regular contributions from members
3. **Treasury Integration**: Direct funding from DAO treasury
4. **Analytics Dashboard**: Detailed cost and usage analytics
5. **Funding Goals**: Community funding campaigns
6. **Multi-token Support**: Accept other tokens for funding

## Support

Need help with funding?
- Check DAO settings and documentation
- Contact DAO administrators
- Review transaction on BaseScan
- Consult AgentCommons documentation

---

## Quick Reference Card

### Creator Quick Start
```
1. Settings → Agent → Funding Tab
2. Check balance (keep > 10 $COMMON)
3. Fund with 100+ $COMMON
4. Monitor weekly
```

### Member Quick Donate
```
1. Click chat bubble
2. Click ❤️ in header
3. Enter amount
4. Approve transaction
```

### Emergency Funding
```
If agent stops responding:
1. Check balance (may be 0)
2. Fund immediately with 10+ $COMMON
3. Wait 1-2 minutes
4. Try chatting again
```

---

**Remember**: A well-funded agent is an available agent! Keep your community agent operational by maintaining a healthy balance.
