# $COMMON Token Faucet Guide

## Overview

The $COMMON Token Faucet allows users to easily acquire $COMMON tokens by exchanging ETH. This is especially useful for testing and getting started with agent funding.

## Quick Access

**Faucet URL**: `/faucet`

Direct link: [Get $COMMON Tokens](/faucet)

## Features

### 1. **Instant Token Exchange**
- Exchange ETH for $COMMON tokens
- Fixed conversion rate from the contract
- Instant delivery to your wallet
- No approval needed

### 2. **User-Friendly Interface**
- Balance display (both ETH and $COMMON)
- Quick amount buttons (0.001, 0.005, 0.01, 0.05 ETH)
- Real-time conversion preview
- Transaction tracking

### 3. **Integrated with Funding**
- Appears in AgentFunding component when balance is low
- Direct link from agent settings
- Seamless user experience

## How to Use

### Getting Tokens

1. **Navigate to Faucet**
   - Visit `/faucet` or
   - Click "Get Tokens" button in agent funding page

2. **Connect Wallet**
   - Connect your wallet if not already connected
   - Ensure you have some ETH for gas + exchange

3. **Enter Amount**
   - Enter ETH amount to exchange
   - Use quick buttons or custom amount
   - See estimated $COMMON in preview

4. **Confirm Transaction**
   - Click "Get $COMMON Tokens"
   - Approve in wallet
   - Wait for confirmation

5. **Receive Tokens**
   - Tokens appear in your wallet instantly
   - Balance updates automatically

### Exchange Rates

The exchange rate is determined by the `ETH_TO_COMMON_RATE` constant in the smart contract.

**Example Rates** (actual rate depends on contract):
```
0.001 ETH  = ~100,000 $COMMON
0.005 ETH  = ~500,000 $COMMON
0.01 ETH   = ~1,000,000 $COMMON
0.05 ETH   = ~5,000,000 $COMMON
```

*Check the faucet UI for current conversion rate*

## Technical Implementation

### Hook: `use-common-token`

Location: `/lib/hooks/use-common-token.ts`

**Functions:**
```typescript
const {
  // Balance checking
  useCommonBalance,

  // Transfer tokens
  transferTokens,
  isTransferPending,
  isTransferSuccess,

  // Get tokens (faucet)
  getTokens,
  isBuyPending,
  isBuySuccess,

  // Calculations
  calculateCommonAmount,
  calculateEthNeeded,

  // Constants
  COMMON_TOKEN_ADDRESS,
  ethToCommonRate,
} = useCommonToken();
```

**Usage Example:**
```typescript
import { useCommonToken } from '@/lib/hooks/use-common-token';
import { useAccount } from 'wagmi';

function MyComponent() {
  const { address } = useAccount();
  const { useCommonBalance, getTokens } = useCommonToken();
  const { balance } = useCommonBalance(address);

  const handleGetTokens = () => {
    getTokens('0.01'); // Get tokens with 0.01 ETH
  };

  return (
    <div>
      <p>Balance: {balance} $COMMON</p>
      <button onClick={handleGetTokens}>Get Tokens</button>
    </div>
  );
}
```

### Component: `CommonTokenFaucet`

Location: `/components/common-token/CommonTokenFaucet.tsx`

**Features:**
- Balance display (ETH and $COMMON)
- Amount input with validation
- Quick amount buttons
- Conversion preview
- Transaction status
- Success/error messages
- Contract info display

**Usage:**
```tsx
import CommonTokenFaucet from '@/components/common-token/CommonTokenFaucet';

function FaucetPage() {
  return <CommonTokenFaucet />;
}
```

### Smart Contract Integration

The faucet interacts with the $COMMON token contract:

**Contract Address**: `0x09d3e33fBeB985653bFE868eb5a62435fFA04e4F`

**Key Functions Used:**
1. `receive()` - Payable function to exchange ETH for tokens
2. `balanceOf(address)` - Check token balance
3. `ETH_TO_COMMON_RATE` - Get conversion rate
4. `transfer(address, uint256)` - Transfer tokens

## Integration Points

### 1. **Agent Funding Component**

The faucet is integrated into `AgentFunding.tsx`:

```tsx
{/* User Balance & Faucet */}
<div className="bg-white rounded-lg border border-gray-200 p-6">
  <div className="flex items-center justify-between mb-4">
    <h3>Your $COMMON Balance</h3>
    <p>{userCommonBalance} $COMMON</p>
  </div>

  {/* Faucet Link - appears when balance < 10 */}
  {parseFloat(userCommonBalance) < 10 && (
    <Link href="/faucet" className="btn">
      Get Tokens
    </Link>
  )}
</div>
```

### 2. **Chat Widget**

Future enhancement: Add faucet link in chat widget when user has low balance.

### 3. **Navigation**

Consider adding faucet link to main navigation:

```tsx
<nav>
  <Link href="/faucet">Get $COMMON</Link>
</nav>
```

## User Experience Flow

### First-Time User Journey

1. **Arrives at DAO**
   - Wants to fund agent
   - Sees they need $COMMON tokens

2. **Discovers Faucet**
   - Sees "Get Tokens" button
   - Clicks to navigate to faucet

3. **Gets Tokens**
   - Connects wallet
   - Exchanges small amount of ETH
   - Receives $COMMON instantly

4. **Returns to Fund Agent**
   - Goes back to agent settings
   - Funds agent with new tokens
   - Agent is operational

### Returning User Journey

1. **Checks Balance**
   - Views agent funding page
   - Sees both agent and user balance

2. **Refills if Needed**
   - Low balance alert appears
   - Clicks "Get Tokens"
   - Quick refill from faucet

3. **Continues Usage**
   - Funds agent or donates
   - Interacts with community

## Best Practices

### For Users

1. **Start Small**
   - Try with 0.001 ETH first
   - Confirm tokens arrive
   - Get more as needed

2. **Plan Ahead**
   - Get enough for multiple agent fundings
   - Reduces number of transactions
   - Saves on gas fees

3. **Keep Some ETH**
   - Need ETH for gas on all transactions
   - Don't convert all ETH to $COMMON
   - Keep buffer for fees

4. **Track Spending**
   - Monitor agent consumption
   - Refill before running out
   - Avoid agent downtime

### For Developers

1. **Error Handling**
   - Check user has sufficient ETH
   - Validate input amounts
   - Clear error messages

2. **Loading States**
   - Show pending/confirming states
   - Disable button during transaction
   - Success feedback

3. **Balance Updates**
   - Refetch after successful transaction
   - Update UI immediately
   - Handle refresh properly

4. **Gas Optimization**
   - Batch transactions when possible
   - Educate users on gas costs
   - Suggest optimal amounts

## Troubleshooting

### Transaction Failed

**Problem**: Transaction reverts or fails

**Solutions**:
- Check you have enough ETH for gas + exchange
- Ensure you're on correct network (Base Sepolia)
- Try smaller amount
- Check contract is not paused

### Tokens Not Received

**Problem**: Sent ETH but no tokens

**Solutions**:
- Wait for transaction confirmation (can take 10-30 seconds)
- Check transaction on BaseScan
- Verify correct contract address
- Refresh page to update balance

### Incorrect Exchange Rate

**Problem**: Received different amount than expected

**Solutions**:
- Rate is determined by contract
- Check `ETH_TO_COMMON_RATE` on contract
- UI shows estimated amount (may vary slightly)
- Verify transaction on BaseScan for actual amount

### Balance Not Updating

**Problem**: UI shows old balance after transaction

**Solutions**:
- Wait a few seconds for state update
- Manually refresh page
- Check wallet for actual balance
- Clear browser cache if persistent

## API Reference

### useCommonToken Hook

```typescript
// Get user balance
const { balance, balanceRaw, isLoading, refetch } = useCommonBalance(address);

// Transfer tokens
transferTokens(toAddress, amount);
// States: isTransferPending, isTransferConfirming, isTransferSuccess

// Get tokens from faucet
getTokens(ethAmount);
// States: isBuyPending, isBuyConfirming, isBuySuccess

// Calculate conversions
const commonAmount = calculateCommonAmount('0.01'); // ETH → $COMMON
const ethNeeded = calculateEthNeeded('1000'); // $COMMON → ETH
```

### CommonTokenFaucet Component

```typescript
interface CommonTokenFaucetProps {
  // No props required - fully self-contained
}

// Usage
<CommonTokenFaucet />
```

## Testing Checklist

### Manual Testing

- [ ] Connect wallet
- [ ] View balances (ETH and $COMMON)
- [ ] Enter custom amount
- [ ] Click quick amount buttons
- [ ] See conversion preview
- [ ] Submit transaction
- [ ] Approve in wallet
- [ ] Wait for confirmation
- [ ] Verify balance updated
- [ ] Check transaction on BaseScan

### Edge Cases

- [ ] Insufficient ETH for gas
- [ ] Insufficient ETH for exchange
- [ ] Zero amount input
- [ ] Negative amount input
- [ ] Very large amount
- [ ] Transaction rejection
- [ ] Network switch during transaction
- [ ] Wallet disconnect during transaction

### UI/UX Testing

- [ ] Responsive design (mobile/desktop)
- [ ] Loading states display correctly
- [ ] Error messages are clear
- [ ] Success feedback is visible
- [ ] Copy address function works
- [ ] External links open correctly
- [ ] Navigation flows smoothly

## Future Enhancements

### Planned Features

1. **Multi-Token Support**
   - Support other ERC-20 tokens
   - Multiple faucet options
   - Token swaps

2. **Faucet Limits**
   - Daily claim limits
   - Prevent abuse
   - Fair distribution

3. **Referral System**
   - Get bonus tokens for referrals
   - Track referral rewards
   - Community growth incentives

4. **Faucet Analytics**
   - Track usage statistics
   - Popular amounts
   - Conversion rates

5. **Mobile Optimization**
   - Native mobile experience
   - QR code support
   - Deep linking

### Community Requests

- Faucet in multiple languages
- Dark mode support
- Historical transaction view
- Batch exchange functionality
- Automated refills

## Security Considerations

### Smart Contract

- Contract is audited ✓
- Rate is immutable ✓
- No admin functions for rate ✓
- Reentrancy protected ✓

### Frontend

- Input validation
- Amount limits
- Transaction verification
- Error boundaries

### User Safety

- Clear warnings about irreversible transactions
- Balance checks before submission
- Network verification
- Contract address display

## Support Resources

### Documentation

- [Agent Integration Guide](/AGENT_INTEGRATION_GUIDE.md)
- [Agent Funding Guide](/AGENT_FUNDING_GUIDE.md)
- [Common Token ABI](/lib/abis/common-token.ts)

### Help

- Check transaction on [BaseScan](https://basescan.org)
- View contract: [0x09d3...4e4F](https://basescan.org/address/0x09d3e33fBeB985653bFE868eb5a62435fFA04e4F)
- Community support in DAO forums

---

## Quick Reference

### Get Tokens Now

```
1. Visit: /faucet
2. Connect wallet
3. Enter ETH amount
4. Click "Get $COMMON Tokens"
5. Approve transaction
6. Done! Tokens in wallet
```

### Use Tokens

```
1. Fund your agent
2. Donate to community agents
3. Participate in governance
4. Support DAO operations
```

**Remember**: Keep some ETH for gas fees!

---

*The $COMMON Token Faucet makes it easy for everyone to participate in the Common Lobbyist ecosystem. Get your tokens and start engaging with your DAO community today!*
