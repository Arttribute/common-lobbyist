# Testing Guide

This guide will walk you through testing the Common Lobbyist implementation.

## Prerequisites

1. Base Sepolia ETH - Get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. MetaMask or compatible wallet
3. Privy account configured (see SETUP.md)
4. MongoDB running locally or via Atlas

## Test 1: Authentication Flow

### 1.1 Wallet Login

```
Steps:
1. Visit http://localhost:3000
2. Click "Login" in navbar
3. Select "Wallet" option
4. Connect MetaMask
5. Approve connection

Expected:
✅ Account menu shows in navbar
✅ Avatar displays with wallet address
✅ Can see username/wallet in dropdown
```

### 1.2 Email Login

```
Steps:
1. Click "Login"
2. Select "Email" option
3. Enter email address
4. Check email for OTP code
5. Enter code

Expected:
✅ Account menu shows in navbar
✅ Email displays as username
✅ Embedded wallet created automatically
```

### 1.3 Logout

```
Steps:
1. Click account avatar
2. Select "Logout"

Expected:
✅ Redirected to home
✅ Account menu shows "Login" button
✅ Protected pages redirect to login
```

## Test 2: DAO Creation

### 2.1 Full DAO Deployment

```
Steps:
1. Login with wallet
2. Navigate to /new or click "Create DAO"
3. Fill in form:
   - DAO Name: "Test DAO"
   - Description: "Testing the protocol"
   - Token Name: "Test Token"
   - Token Symbol: "TEST"
   - Initial Supply: 1000000
4. Click "Deploy DAO"
5. Approve transaction in MetaMask
6. Wait for confirmation

Expected:
✅ MetaMask prompts for transaction
✅ Status shows "Deploying contracts on-chain..."
✅ Transaction confirms on Base Sepolia
✅ Status changes to "Saving DAO to database..."
✅ Redirect to DAO page
✅ DAO appears in database
✅ Token balance shows 1,000,000 TEST in wallet

Verify On-Chain:
1. Go to https://sepolia.basescan.org/
2. Search for factory address: 0x7e5adb9add98bf0c9450cb814c3746f655fde93f
3. Find your transaction
4. Verify DaoCreated event emitted
5. Check token and registry addresses

Verify Database:
db.organizations.findOne({ name: "Test DAO" })

Should show:
{
  name: "Test DAO",
  tokenName: "Test Token",
  tokenSymbol: "TEST",
  initialSupply: "1000000",
  onchain: {
    chainId: 84532,
    factory: "0x7e5adb9...",
    registry: "0x...",
    token: "0x...",
    txHash: "0x...",
    deployedAt: ISODate(...)
  },
  creatorAddress: "0x...",
  createdAt: ISODate(...)
}
```

### 2.2 Error Handling

```
Test Case: Not Authenticated
Steps:
1. Logout
2. Navigate to /new
3. Try to submit form

Expected:
✅ Shows login prompt
✅ Form disabled until login
✅ "Please login to create a DAO" message

Test Case: Insufficient Funds
Steps:
1. Use wallet with 0 Base Sepolia ETH
2. Try to create DAO

Expected:
✅ Transaction fails
✅ Error message displays
✅ Form remains editable
✅ Can retry after adding ETH

Test Case: Network Mismatch
Steps:
1. Switch MetaMask to wrong network (e.g., Ethereum Mainnet)
2. Try to create DAO

Expected:
✅ Privy shows network switch prompt
✅ Or clear error about wrong network
```

## Test 3: Contract Interactions

### 3.1 Check Token Balance

```
Test with browser console:

const { useContracts } = require('@/hooks/useContracts')
const { fetchTokenBalance } = useContracts()

const balance = await fetchTokenBalance("0xYOUR_TOKEN_ADDRESS")
console.log("Balance:", balance)

Expected:
✅ Returns "1000000.0" for newly created DAO
```

### 3.2 View On-Chain DAO Info

```
Test with browser console or script:

import { getDAOInfo } from '@/lib/contracts/dao-factory'
import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
})

const info = await getDAOInfo(publicClient, "0xREGISTRY_ADDRESS")
console.log(info)

Expected:
{
  daoOwner: "0xYOUR_ADDRESS",
  token: "0xTOKEN_ADDRESS",
  signalRegistry: "0xREGISTRY_ADDRESS",
  metadataCid: "dao:test-dao",
  exists: true
}
```

## Test 4: Content & Signals

### 4.1 Create Content

```
Steps:
1. Navigate to your DAO
2. Create a forum (if not exists)
3. Create a new post
   - Title: "Test Proposal"
   - Content: "This is a test"
4. Submit

Expected:
✅ Post appears in forum
✅ MongoDB content document created
✅ IPFS CID generated
✅ onchain.synced = false initially
```

### 4.2 Place Signal on Content

```
Steps:
1. Find a post in your DAO
2. Click "Signal" or "Support" button
3. Enter amount (e.g., 100 tokens)
4. Approve token spending (MetaMask)
5. Confirm signal transaction (MetaMask)
6. Wait for confirmation

Expected:
✅ Two MetaMask prompts (approve + signal)
✅ Transactions confirm on Base Sepolia
✅ MongoDB content updated:
   - onchain.synced = true
   - onchain.totalRaw = "100000000000000000000" (100 * 10^18)
   - onchain.totalQuadWeight = "10000000000000000000" (sqrt(100) * 10^18)
   - onchain.supporters = 1
✅ UI shows updated signal count

Verify On-Chain:
1. Go to registry contract on BaseScan
2. Find Signaled event
3. Verify amounts match
```

### 4.3 Multiple Users Signal

```
Setup:
1. Create DAO with User A
2. Transfer some tokens to User B

Steps:
1. User A signals 100 tokens → weight = 10
2. User B signals 100 tokens → weight = 10
3. Total: 200 tokens, weight = 20

Expected:
✅ totalRaw = 200 tokens
✅ totalQuadWeight = 20 (10 + 10)
✅ supporters = 2
✅ Quadratic formula working correctly
```

### 4.4 Withdraw Signal

```
Steps:
1. Place 100 tokens on content
2. Click "Withdraw" or "Remove"
3. Enter amount (e.g., 50 tokens)
4. Confirm transaction

Expected:
✅ Tokens returned to wallet
✅ MongoDB updated:
   - totalRaw decreased by 50
   - totalQuadWeight recalculated
   - If withdrew all: supporters decreased
```

## Test 5: API Authentication

### 5.1 Protected Endpoint - Success

```
Test:
const token = authState.idToken

const res = await fetch('/api/organization', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ /* DAO data */ })
})

Expected:
✅ Status 201 Created
✅ DAO saved to database
```

### 5.2 Protected Endpoint - No Token

```
Test:
const res = await fetch('/api/organization', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ /* DAO data */ })
})

Expected:
✅ Status 401 Unauthorized
✅ Error: "Missing or invalid authorization header"
```

### 5.3 Protected Endpoint - Invalid Token

```
Test:
const res = await fetch('/api/organization', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer INVALID_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ /* DAO data */ })
})

Expected:
✅ Status 401 Unauthorized
✅ Error: "Invalid or expired authentication token"
```

## Test 6: Database Sync

### 6.1 Verify On-Chain Data Matches DB

```
Steps:
1. Create DAO and note addresses
2. Place signals on content
3. Query MongoDB
4. Query blockchain
5. Compare values

MongoDB Query:
const content = await Content.findById(contentId)
console.log({
  totalRaw: content.onchain.totalRaw,
  totalQuadWeight: content.onchain.totalQuadWeight,
  supporters: content.onchain.supporters
})

On-Chain Query:
const aggregate = await getMemoryAggregate(
  publicClient,
  registryAddress,
  cid
)
console.log({
  totalRaw: aggregate.totalRaw.toString(),
  totalQuadWeight: aggregate.totalQuadWeight.toString(),
  supporters: aggregate.supporters
})

Expected:
✅ Values match exactly
✅ onchain.synced = true
✅ onchain.lastSyncedAt is recent
```

## Test 7: Edge Cases

### 7.1 Signal with 0 Tokens

```
Expected:
✅ Smart contract reverts with "amount=0"
✅ Frontend shows error
```

### 7.2 Withdraw More Than Placed

```
Expected:
✅ Smart contract reverts with "insufficient allocated"
✅ Frontend shows error
```

### 7.3 Concurrent Signals

```
Steps:
1. Two users signal same content simultaneously

Expected:
✅ Both transactions succeed
✅ Final state correct (sum of both)
✅ No race conditions
```

### 7.4 Very Large Numbers

```
Test:
Initial supply = 1000000000000 (1 trillion)
Signal = 1000000 tokens

Expected:
✅ parseUnits handles correctly
✅ No overflow errors
✅ Quadratic math works with BigInt
```

## Common Issues & Solutions

### Issue: Transaction Stuck

```
Symptoms:
- MetaMask shows "Pending" forever
- No confirmation after 5+ minutes

Solutions:
1. Check Base Sepolia block explorer
2. Speed up transaction in MetaMask
3. Cancel and retry with higher gas
4. Wait - Base Sepolia can be slow
```

### Issue: "Nonce too low"

```
Solution:
1. Settings → Advanced → Reset Account in MetaMask
2. Refresh page
3. Retry transaction
```

### Issue: MongoDB Connection Error

```
Symptoms:
- API returns 500 error
- Console shows "MongooseServerSelectionError"

Solutions:
1. Check MongoDB is running: `brew services list`
2. Verify MONGODB_URI in .env.local
3. For Atlas: check IP whitelist
4. Test connection: `mongosh $MONGODB_URI`
```

### Issue: Privy Authentication Fails

```
Symptoms:
- "Invalid credentials" error
- Login modal doesn't appear

Solutions:
1. Verify NEXT_PUBLIC_PRIVY_APP_ID in .env.local
2. Check PRIVY_APP_SECRET is set (server-side only)
3. Clear browser cache and cookies
4. Try incognito mode
5. Check Privy dashboard for app status
```

### Issue: Contract Call Fails

```
Symptoms:
- Transaction reverts
- "Execution reverted" error

Debug:
1. Check you have enough tokens
2. Verify token approval before signal
3. Check contract addresses are correct
4. View revert reason on BaseScan
5. Test with smaller amounts
```

## Automated Testing

### Unit Tests (Future)

```bash
# Contract tests (Hardhat)
cd onchain
npx hardhat test

# Frontend tests (Jest)
npm run test

# E2E tests (Playwright)
npm run test:e2e
```

## Performance Testing

### Load Test DAO Creation

```
Scenario: 10 DAOs created in quick succession

Expected:
✅ All transactions succeed
✅ All saved to database
✅ No duplicate entries
✅ Reasonable gas costs
```

### Load Test Signal Placement

```
Scenario: 100 signals on same content

Expected:
✅ All transactions process
✅ Final state = sum of all signals
✅ Quadratic math remains accurate
✅ Database sync successful
```

## Checklist for Production

Before deploying to mainnet:

- [ ] All tests pass
- [ ] Gas optimizations reviewed
- [ ] Contract audit completed
- [ ] IPFS pinning configured (Pinata/web3.storage)
- [ ] Rate limiting on API routes
- [ ] Error tracking (Sentry) configured
- [ ] MongoDB indexes created
- [ ] Backup strategy in place
- [ ] Monitoring dashboards set up
- [ ] Security headers configured
- [ ] CORS properly set
- [ ] Environment variables secured
- [ ] Privy production mode enabled
