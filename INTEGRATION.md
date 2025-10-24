# Common Lobbyist Integration Guide

This document explains how all the moving parts work together: smart contracts, Privy authentication, MongoDB, and the frontend.

## 🔄 Complete Flow: Creating a DAO

### Step 1: User Authentication (Privy)

```typescript
// User clicks "Login" button
// context/auth-context.tsx handles this

// Privy modal appears
await privy.login()

// User authenticates via:
// - Wallet (MetaMask, etc.)
// - Email
// - Google/Discord/Twitter

// Privy returns:
// - userId
// - wallet address
// - access token (JWT)

// AuthContext stores:
authState = {
  idToken: "eyJhbGciOi...",
  username: "user@example.com",
  walletAddress: "0x1234...",
  profileImage: "https://..."
}
```

### Step 2: Frontend DAO Creation

```typescript
// app/new/page.tsx

const handleSubmit = async () => {
  // 1. User fills in form:
  const daoData = {
    name: "Ethereum Governance",
    tokenName: "Ethereum Governance Token",
    tokenSymbol: "EGT",
    initialSupply: "1000000"
  }

  // 2. Call smart contract via useContracts hook
  const result = await createDAO({
    name: tokenName,
    symbol: tokenSymbol,
    initialSupply,
    metadataCid: "dao:ethereum-governance"
  })

  // Behind the scenes (lib/contracts/dao-factory.ts):
  // - Convert supply to wei (parseUnits)
  // - Call factory.createDAO(name, symbol, supply, cid)
  // - Wait for transaction confirmation
  // - Parse DaoCreated event
  // - Extract token and registry addresses

  // result = {
  //   tokenAddress: "0xABCD...",
  //   registryAddress: "0xEF01...",
  //   txHash: "0x5678..."
  // }
}
```

### Step 3: Smart Contract Execution

```solidity
// onchain/contracts/DaoFactory.sol

function createDAO(
    string calldata name_,
    string calldata symbol_,
    uint256 initialSupply,
    string calldata metadataCid
) external returns (address tokenAddr, address registryAddr) {
    // 1. Deploy GovernanceToken
    GovernanceToken token = new GovernanceToken(
        name_,
        symbol_,
        msg.sender,  // owner = deployer
        initialSupply
    );

    // 2. Deploy SignalRegistry
    SignalRegistry registry = new SignalRegistry(
        msg.sender,
        token
    );

    // 3. Store DAO info
    daos[address(registry)] = DaoInfo({
        daoOwner: msg.sender,
        token: address(token),
        signalRegistry: address(registry),
        metadataCid: metadataCid,
        exists: true
    });

    // 4. Emit event
    emit DaoCreated(
        msg.sender,
        address(token),
        address(registry),
        metadataCid
    );

    return (address(token), address(registry));
}
```

### Step 4: Database Storage

```typescript
// After contract deployment succeeds

// Frontend calls API with auth token
const res = await fetch("/api/organization", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${authState.idToken}`
  },
  body: JSON.stringify({
    name: "Ethereum Governance",
    description: "...",
    tokenName: "Ethereum Governance Token",
    tokenSymbol: "EGT",
    initialSupply: "1000000",
    onchain: {
      chainId: 84532,  // Base Sepolia
      factory: "0x7e5adb9...",
      registry: result.registryAddress,
      token: result.tokenAddress,
      txHash: result.txHash,
      deployedBy: walletAddress
    }
  })
})

// API validates (app/api/organization/route.ts)
// 1. Verify JWT token
const user = await getAuthenticatedUser(request)

// 2. Verify wallet ownership
if (user.walletAddress !== onchain.deployedBy) {
  throw new Error("Unauthorized")
}

// 3. Save to MongoDB
const org = new Organization({
  name,
  description,
  tokenName,
  tokenSymbol,
  initialSupply,
  onchain: {
    chainId,
    factory,
    registry,
    token,
    deployedAt: new Date(),
    txHash
  },
  creatorAddress: user.walletAddress
})

await org.save()
```

## 🎯 Complete Flow: Placing Signals on Content

### Step 1: Content Creation

```typescript
// User creates a post/comment

// 1. Upload to IPFS (lib/ipfs/upload.ts)
const ipfsResult = await uploadToIPFS({
  title: "My proposal",
  text: "Let's do X, Y, Z",
  type: "post",
  author: walletAddress,
  daoId: daoId,
  forumId: forumId,
  createdAt: new Date().toISOString()
})

// ipfsResult = {
//   cid: "bafybeib...",
//   size: 1234,
//   url: "https://ipfs.io/ipfs/bafybeib..."
// }

// 2. Save to MongoDB
const content = new Content({
  type: "post",
  daoId,
  forumId,
  content: {
    title: "My proposal",
    text: "Let's do X, Y, Z"
  },
  ipfs: {
    cid: ipfsResult.cid,
    pinned: true
  },
  onchain: {
    synced: false,  // Not yet on-chain
    totalRaw: "0",
    totalQuadWeight: "0",
    supporters: 0
  },
  authorId: userId
})

await content.save()
```

### Step 2: User Places Signal

```typescript
// hooks/useContracts.ts

const placeSignalOnContent = async (
  tokenAddress,
  { registryAddress, cid, amount }
) => {
  // 1. Approve registry to spend tokens
  await governanceToken.approve(registryAddress, amountWei)

  // 2. Call signal function
  await signalRegistry.signal(cid, amountWei)

  // 3. Wait for confirmation and parse event
  const receipt = await publicClient.waitForTransactionReceipt({ hash })

  // Event emitted:
  // event Signaled(
  //   address indexed dao,
  //   bytes32 indexed cidHash,
  //   string cid,
  //   address indexed user,
  //   uint256 amountIn,
  //   uint256 userRawAfter,
  //   uint256 userSqrtAfter,
  //   uint256 totalRawAfter,
  //   uint256 totalQuadAfter
  // )

  return {
    txHash: hash,
    userRawAfter: event.args.userRawAfter,
    userSqrtAfter: event.args.userSqrtAfter,
    totalRawAfter: event.args.totalRawAfter,
    totalQuadAfter: event.args.totalQuadAfter
  }
}
```

### Step 3: Smart Contract Updates State

```solidity
// onchain/contracts/SignalRegistry.sol

function signal(string calldata cid, uint256 amount) external {
    bytes32 cidHash = keccak256(bytes(cid));

    // 1. Transfer tokens from user to registry
    require(token.transferFrom(msg.sender, address(this), amount));

    // 2. Update user position
    UserPosition storage p = positions[cidHash][msg.sender];
    uint256 newRaw = p.rawAmount + amount;
    uint256 newSqrt = Math.sqrt(newRaw);  // Quadratic!

    p.rawAmount = newRaw;
    p.sqrtWeight = newSqrt;

    // 3. Update aggregate
    MemoryAggregate storage m = memories[cidHash];
    if (p.rawAmount == amount) {
        m.supporters += 1;  // First time signaling
    }
    m.totalRaw += amount;
    m.totalQuadWeight = m.totalQuadWeight + newSqrt - prevSqrt;

    // 4. Emit event
    emit Signaled(
        owner(),
        cidHash,
        cid,
        msg.sender,
        amount,
        newRaw,
        newSqrt,
        m.totalRaw,
        m.totalQuadWeight
    );
}
```

### Step 4: Sync to Database

```typescript
// After transaction confirms, frontend syncs to DB

await fetch("/api/content/signal", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${authState.idToken}`
  },
  body: JSON.stringify({
    contentId: content._id,
    daoId: daoId,
    totalRaw: result.totalRawAfter.toString(),
    totalQuadWeight: result.totalQuadAfter.toString(),
    supporters: newSupporterCount,
    txHash: result.txHash
  })
})

// API updates MongoDB (app/api/content/signal/route.ts)
content.onchain = {
  synced: true,
  lastSyncedAt: new Date(),
  totalRaw: totalRaw.toString(),
  totalQuadWeight: totalQuadWeight.toString(),
  supporters: supporters
}

await content.save()
```

## 🔐 Authentication Deep Dive

### JWT Flow

```
1. User logs in with Privy
   ↓
2. Privy returns access token (JWT)
   ↓
3. Frontend stores in AuthContext
   authState.idToken = "eyJhbGciOi..."
   ↓
4. API requests include header:
   Authorization: Bearer eyJhbGciOi...
   ↓
5. Server verifies (lib/auth/middleware.ts)
   const claims = await privyClient.verifyAuthToken(token)
   ↓
6. Extract user info
   userId: claims.userId
   walletAddress: user.linkedAccounts[0].address
   ↓
7. Check permissions
   if (user.walletAddress !== requiredAddress) {
     throw new Error("Unauthorized")
   }
```

### Protected Routes

```typescript
// Client-side protection
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function MyPage() {
  return (
    <ProtectedRoute requireWallet={true}>
      {/* Only authenticated users with wallets can see this */}
      <CreateDAOForm />
    </ProtectedRoute>
  )
}

// Server-side protection
import { withAuth } from "@/lib/auth/middleware"

export async function POST(request: NextRequest) {
  return withAuth(request, async (authenticatedReq) => {
    // authenticatedReq.userId is guaranteed to exist
    // authenticatedReq.walletAddress available if wallet linked

    const userId = authenticatedReq.userId
    const wallet = authenticatedReq.walletAddress

    // ... handle request
  })
}
```

## 🎨 Frontend Architecture

### Hooks Structure

```typescript
// useAuth() - Authentication state
const {
  authenticated,      // boolean
  ready,             // boolean (Privy loaded)
  authState,         // { idToken, username, walletAddress }
  login,             // () => Promise<void>
  logout             // () => Promise<void>
} = useAuth()

// useContracts() - Blockchain interactions
const {
  isLoading,              // boolean
  error,                  // string | null
  walletAddress,          // string | undefined
  isConnected,            // boolean

  createDAO,              // Deploy new DAO
  placeSignalOnContent,   // Signal content
  withdrawSignalFromContent, // Withdraw signal

  fetchTokenBalance,      // Get user's token balance
  fetchUserPosition,      // Get user's position on content
  fetchMemoryAggregate    // Get content's total signals
} = useContracts()
```

### Component Hierarchy

```
App
├── Providers (Privy)
│   └── AuthProvider (Auth state)
│       ├── Navbar (Global nav with AccountMenu)
│       └── Page Content
│           ├── Protected Routes (Auth check)
│           └── Regular Routes
```

## 📊 Data Flow Diagrams

### DAO Creation Flow

```
User                Frontend            Smart Contract      Database
 │                     │                      │               │
 │──login()──────────> │                      │               │
 │                     │                      │               │
 │                     │<──JWT token──────────│               │
 │                     │                      │               │
 │──fillDAOForm()────> │                      │               │
 │                     │                      │               │
 │                     │──createDAO()───────> │               │
 │                     │                      │               │
 │                     │                      │──deploy────> Token
 │                     │                      │               │
 │                     │                      │──deploy────> Registry
 │                     │                      │               │
 │                     │<──addresses─────────│               │
 │                     │                      │               │
 │                     │──POST /api/org──────────────────────> │
 │                     │   (with JWT)         │               │
 │                     │                      │               │
 │                     │<──DAO saved─────────────────────────│
 │                     │                      │               │
 │<──redirect to DAO──│                      │               │
```

### Signal Placement Flow

```
User                Frontend            Smart Contract      Database
 │                     │                      │               │
 │──placeSignal()────> │                      │               │
 │                     │                      │               │
 │                     │──approve()─────────> Token          │
 │                     │                      │               │
 │<──confirm tx───────│                      │               │
 │                     │                      │               │
 │                     │──signal()──────────> Registry       │
 │                     │                      │               │
 │                     │                      │──updateState  │
 │                     │                      │               │
 │<──confirm tx───────│                      │               │
 │                     │                      │               │
 │                     │<──Signaled event────│               │
 │                     │                      │               │
 │                     │──POST /api/signal───────────────────> │
 │                     │   (sync data)        │               │
 │                     │                      │               │
 │                     │<──synced────────────────────────────│
 │                     │                      │               │
 │<──UI updates───────│                      │               │
```

## 🔍 Key Design Decisions

### 1. Why deploy contracts first, then save to DB?

**Rationale:** Blockchain is the source of truth. If contract deployment fails, we don't want orphaned DB records. If DB save fails, we can always recreate from on-chain events.

### 2. Why sync signal data to MongoDB?

**Rationale:**
- Fast queries (don't need to hit blockchain for every read)
- Support complex queries (filter by weight, supporters, etc.)
- Enable offline/historical analysis
- Reduce RPC calls

### 3. Why use quadratic voting?

**Rationale:** Prevents whale dominance. A user with 100 tokens has weight of 10 (√100), not 100. Encourages broader participation.

### 4. Why IPFS for content?

**Rationale:**
- Immutable storage
- Censorship resistant
- Decentralized
- Content-addressed (CID = hash of content)

## 🚀 Future Enhancements

### AI Agent Integration

```typescript
// Potential implementation

// 1. Fetch top-signaled content
const topContent = await Content.find({ daoId })
  .sort({ "onchain.totalQuadWeight": -1 })
  .limit(10)

// 2. Generate AI summary
const summary = await aiAgent.summarize(topContent)

// 3. Post as lobbyist
const lobbyistPost = await Content.create({
  type: "post",
  content: {
    title: "Community Priorities Summary",
    text: summary
  },
  authorId: "lobbyist-agent"
})
```

### Decay Mechanism

```solidity
// Time-based decay of signal weight

function getEffectiveWeight(bytes32 cidHash) public view returns (uint256) {
    MemoryAggregate memory m = memories[cidHash];
    uint256 age = block.timestamp - m.createdAt;
    uint256 halfLife = 90 days;

    // Weight decays exponentially
    return m.totalQuadWeight * 0.5 ** (age / halfLife);
}
```

## 📚 References

- [Smart Contracts](/onchain/contracts/)
- [API Routes](/app/api/)
- [Contract Utilities](/lib/contracts/)
- [Auth Middleware](/lib/auth/middleware.ts)
- [Database Models](/models/)
- [Setup Guide](/SETUP.md)
