# Common Lobbyist Protocol

> A governance coordination layer that gives DAOs a living collective memory through autonomous Lobbyist Agents and token-based signaling

## Table of Contents
- [Introduction](#introduction)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [How It Works](#how-it-works)
- [System Architecture](#system-architecture)
  - [DAO Factory](#dao-factory)
  - [DAOs and Governance Tokens](#daos-and-governance-tokens)
  - [Forums](#forums)
  - [Lobbyist Agents](#lobbyist-agents)
- [Collective Memory System](#collective-memory-system)
- [Smart Contracts](#smart-contracts)
- [How It's Built](#how-its-built)
- [Quick Start](#quick-start)
- [Documentation](#documentation)

## Introduction

Decentralized Autonomous Organizations (DAOs) are collectives that use blockchain technology to coordinate and make decisions without a central authority. Their rules and operations are encoded in transparent smart contracts, while members shape the organization's direction by proposing, discussing, and voting on shared initiatives.

The Common Lobbyist Protocol introduces a new paradigm for DAO governance: **autonomous, on-chain agents that listen across governance platforms, organize discussion, and articulate the community's shared positions** using transparent logic and verifiable data references.

## The Problem

DAOs depend on open community participation through discussions, proposals, and voting. As these ecosystems scale, they face a major coordination problem:

- **Volume overload**: The volume, diversity, and unstructured nature of input far exceeds what human delegates or moderators can process
- **Lost insights**: Important insights are buried in forum threads and never surface
- **Repetitive debates**: Discussions become repetitive without institutional memory
- **Context limitations**: Even AI systems have context limitations that make long-term recall of complex, evolving community discussions challenging

Human delegates and moderators simply cannot reliably surface and preserve the most important community inputs as DAOs grow. Valuable context is scattered across forum threads and proposals, making it hard to keep current with community priorities.

## the Solution

The Common Lobbyist Protocol solves this through a combination of **on-chain signaling** and **autonomous AI agents**:

### Place-to-Remember, Withdraw-to-Forget Signaling

Members guide the agent's focus by **placing tokens on comments, proposals, or perspectives** they want remembered and championed. When tokens are withdrawn from older or less relevant ideas, their influence fades naturally. This creates a **living collective memory** that reflects what the community values most.

### Lobbyist Agents

These autonomous agents act as continuous community advocates. They:
- **Listen** across governance platforms and forums
- **Organize** and distill public discussion into clear insights
- **Synthesize** large volumes of community input into actionable intelligence
- **Articulate** the community's shared positions using transparent logic
- **Verify** all claims with on-chain data references and Blockscout explorer links

Through this token-based signaling mechanism, communities decide what to preserve and what to let fade, creating a new layer of transparent, data-driven participation that gives DAOs a scalable way to understand themselves and govern effectively.

## How It Works

### 1. Deploy a DAO

Use the **DAOFactory** contract to deploy your DAO with a single transaction:
- Creates a **GovernanceToken** (ERC-20) for your community
- Deploys a **SignalRegistry** contract to track collective memory
- Records metadata (name, description, IPFS CID) on-chain

```solidity
DAOFactory.createDAO(
  name: "My DAO",
  symbol: "MDAO",
  initialSupply: 1000000,
  metadataCid: "ipfs://Qm..."
)
```

### 2. Community Participation

Members engage in governance through forums integrated with the protocol:
- Create proposals and discussion threads
- Comment on existing content
- All content is pinned to IPFS for immutability and censorship resistance

### 3. Signal Priorities (Place-to-Remember)

Members allocate governance tokens to content they want the collective to remember:

```solidity
SignalRegistry.signal(
  cid: "ipfs://Qm...", // Content identifier
  amount: 100          // Tokens to allocate
)
```

**What happens:**
- Tokens are transferred from the user to the SignalRegistry contract
- User's allocation is recorded with quadratic weighting: `weight = √(tokens)`
- Total community support is aggregated: `totalQuadWeight = Σ √(user_tokens)`
- Content gains influence in proportion to **broad community support**, not just raw token amount

### 4. Update Priorities (Withdraw-to-Forget)

When priorities change, members withdraw tokens to let old ideas fade:

```solidity
SignalRegistry.withdraw(
  cid: "ipfs://Qm...",
  amount: 50
)
```

**What happens:**
- Tokens are returned to the user
- Quadratic weight is recalculated
- Content's influence decreases
- Agents de-prioritize this content in their analysis

### 5. Lobbyist Agents Synthesize

Autonomous AI agents continuously:
- **Monitor** signal activity across all content
- **Retrieve** high-signal content from IPFS and MongoDB
- **Analyze** using semantic search (vector embeddings) to understand context
- **Verify** all claims with on-chain data from the SignalRegistry
- **Generate** summaries and recommendations representing community consensus
- **Provide** Blockscout explorer links for complete transparency

### 6. Natural Evolution

As the community's priorities evolve:
- New proposals gain signals → emerge in agent summaries
- Old ideas lose signals → fade from collective memory
- Trending topics are automatically identified
- **The collective memory stays current without manual curation**

## System Architecture

### DAO Factory

**Contract**: [`onchain/contracts/DaoFactory.sol`](onchain/contracts/DaoFactory.sol)

The DAOFactory is the entry point for creating new DAOs. It orchestrates the deployment of all necessary contracts and records metadata.

**Key Function**:
```solidity
function createDAO(
    string calldata name_,
    string calldata symbol_,
    uint256 initialSupply,
    string calldata metadataCid
) external returns (address tokenAddr, address registryAddr)
```

**What it does**:
1. Deploys a new `GovernanceToken` contract with the specified parameters
2. Deploys a new `SignalRegistry` contract linked to the token
3. Records DAO information in the `daos` mapping
4. Emits `DaoCreated` event with all addresses
5. Returns both contract addresses for the frontend to use

**Deployed Address**:
- **Base Sepolia**: `0x7e5adb9add98bf0c9450cb814c3746f655fde93f`
- Configuration: [`lib/contracts/config.ts`](lib/contracts/config.ts)
- [View on Blockscout](https://base-sepolia.blockscout.com/address/0x7e5adb9add98bf0c9450cb814c3746f655fde93f)

### DAOs and Governance Tokens

**Contract**: [`onchain/contracts/GovernanceToken.sol`](onchain/contracts/GovernanceToken.sol)

Each DAO gets its own ERC-20 governance token with enhanced features:

**Features**:
- **ERC-20 Standard**: Fully compatible with wallets and exchanges
- **EIP-2612 Permit**: Gasless approvals for better UX (users can approve and signal in one transaction)
- **Mintable**: DAO owner can mint additional tokens for distribution
- **Ownable**: Controlled by the DAO creator (can be transferred to governance contract)

**Usage**:
```solidity
// Owner can mint new tokens
GovernanceToken.mint(recipient, amount)

// Members use these tokens to signal on content
// Tokens must be approved before signaling
token.approve(signalRegistry, amount)
registry.signal(cid, amount)
```

### Forums

Forums are the discussion layer where community members:
- **Create proposals** with titles, descriptions, and supporting content
- **Post comments** and engage in threaded discussions
- **Reference content** via IPFS CIDs for immutability

**Data Storage**:
- **On-chain**: Signal allocations, token balances (SignalRegistry)
- **IPFS**: Content text, images, and metadata (immutable, censorship-resistant)
- **MongoDB**: Indexed content for fast semantic search, user activity tracking

**Integration with Signaling**:
- Each forum post/comment gets an IPFS CID
- Users can signal directly from the UI
- Real-time sync between blockchain state and database
- Agents monitor both on-chain events and database changes

### Lobbyist Agents

**Implementation**: AgentCommons + Agentverse integration

Lobbyist Agents are autonomous AI agents that serve as community advocates. They operate continuously to understand and represent community priorities.

**Agent Capabilities**:

1. **Semantic Search** ([`lib/services/memory.ts`](lib/services/memory.ts))
   - Uses OpenAI embeddings (text-embedding-3-small) to understand content meaning
   - Performs MongoDB Atlas Vector Search for contextual retrieval
   - Finds relevant discussions by semantic similarity, not just keywords

2. **Context Awareness** ([`lib/services/memory.ts`](lib/services/memory.ts))
   - Retrieves parent/child relationships (proposal → comments)
   - Discovers similar content and related discussions
   - Tracks user contribution history and activity patterns
   - Identifies trending topics based on recent signal activity

3. **On-Chain Verification** ([`lib/services/onchain.ts`](lib/services/onchain.ts))
   - Queries SignalRegistry for current signal totals
   - Verifies supporter counts and quadratic weights
   - Provides Blockscout explorer links for every claim
   - Accesses governance token balances and transfer history

4. **Blockscout Integration** ([`lib/services/blockscout.ts`](lib/services/blockscout.ts))
   - Fetches transaction history for contracts and users
   - Retrieves token transfer events
   - Provides explorer URLs for transparent verification
   - Monitors recent on-chain activity

**Agent Tools** ([`lib/tools/memory-tools.ts`](lib/tools/memory-tools.ts)):

Eight specialized tools enable agents to serve the community:

| Tool | Purpose |
|------|---------|
| `searchDaoContent` | Semantic search on DAO forum content with similarity scoring |
| `getContentContext` | Comprehensive context including parent/child relationships and similar content |
| `getUserActivity` | User's posts, comments, and signal allocations |
| `getTrendingContent` | Currently popular content based on recent signal activity |
| `getVerifiableReferences` | On-chain proof and Blockscout explorer links |
| `getContentOnChainProof` | Detailed blockchain evidence for specific content |
| `getDaoTokenInfo` | DAO token metrics, supply, and holder information |
| `getUserDaoTokens` | User's token balance and staking activity |

**Agentverse Integration** ([`docs/AGENTVERSE_INTEGRATION.md`](docs/AGENTVERSE_INTEGRATION.md)):

Agents can be deployed to Agentverse for:
- **Discoverability**: Register agents in the Agentverse marketplace
- **Multiagent Communication**: Enable agent-to-agent collaboration via ASI Chat Protocol
- **Managed Infrastructure**: Cloud hosting without self-hosting requirements
- **Agent Marketplace**: Access ecosystem of specialized AI agents

**Registration Process**:
1. Configure agent persona and capabilities in the UI
2. Click "Register on Agentverse" in the agent management panel
3. Agent receives a unique address (e.g., `agent1q...`)
4. Webhook URL configured for receiving messages
5. Agent becomes discoverable in Agentverse marketplace

## Collective Memory System

The collective memory is implemented through **token voting with quadratic aggregation** on the SignalRegistry contract.

### How Collective Memory Works

**Contract**: [`onchain/contracts/SignalRegistry.sol`](onchain/contracts/SignalRegistry.sol)

For each piece of content (identified by IPFS CID), the registry maintains:

```solidity
struct MemoryAggregate {
    string  cid;                // IPFS content identifier
    address dao;                // Owning DAO address
    uint256 totalRaw;           // Total tokens allocated (raw sum)
    uint256 totalQuadWeight;    // Quadratic weight = Σ √(user_tokens)
    uint32  supporters;         // Count of unique wallets with allocation > 0
    bool    exists;             // Whether this CID has been signaled
}
```

### Quadratic Voting Mechanism

Unlike simple token voting (1 token = 1 vote), the protocol uses **quadratic voting** to reduce whale dominance and encourage broad participation:

**Formula**: `user_weight = floor(√(tokens_allocated))`

**Example**:
```
User A allocates 100 tokens  → weight = 10
User B allocates 100 tokens  → weight = 10
User C allocates 100 tokens  → weight = 10
Total: 300 tokens, weight = 30

vs.

User D allocates 10,000 tokens → weight = 100

Result: Three users with 100 tokens each (300 total) have weight 30.
        One whale with 10,000 tokens has weight 100, not 10,000!
```

**Impact**:
- A whale with 100x more tokens only gets ~10x more influence
- Broad consensus is valued over raw capital
- Encourages coalition-building and community alignment

### Per-User Position Tracking

```solidity
struct UserPosition {
    uint256 rawAmount;   // Tokens this user allocated to this CID
    uint256 sqrtWeight;  // floor(√(rawAmount)) - user's contribution to quadratic total
}

mapping(bytes32 => mapping(address => UserPosition)) public positions;
```

Each user's allocation is tracked individually, allowing:
- Transparent audit of who supports what
- Withdrawal of exact amounts previously allocated
- Recalculation of quadratic weights on every change

### Signal Placement (Place-to-Remember)

**Function**: `signal(string calldata cid, uint256 amount)`

**What happens when a user signals**:
1. Tokens are transferred from user to SignalRegistry contract
2. User's position is updated:
   - `rawAmount` increases by `amount`
   - `sqrtWeight` recalculated: `√(new_rawAmount)`
3. Aggregate is updated:
   - `totalRaw` increases by `amount`
   - `totalQuadWeight` adjusted: `old_total - old_user_sqrt + new_user_sqrt`
   - `supporters` increments if this is user's first signal on this CID
4. Event `Signaled` emitted with all details for off-chain indexing

**Event signature**:
```solidity
event Signaled(
    address indexed dao,
    bytes32 indexed cidHash,
    string cid,
    address indexed user,
    uint256 amountIn,
    uint256 userRawAfter,
    uint256 userSqrtAfter,
    uint256 totalRawAfter,
    uint256 totalQuadAfter
);
```

### Signal Withdrawal (Withdraw-to-Forget)

**Function**: `withdraw(string calldata cid, uint256 amount)`

**What happens when a user withdraws**:
1. Contract verifies user has sufficient allocated tokens
2. User's position is updated:
   - `rawAmount` decreases by `amount`
   - `sqrtWeight` recalculated: `√(new_rawAmount)`
3. Aggregate is updated:
   - `totalRaw` decreases by `amount`
   - `totalQuadWeight` adjusted: `old_total - old_user_sqrt + new_user_sqrt`
   - `supporters` decrements if user's allocation becomes 0
4. Tokens returned to user
5. Event `Withdrawn` emitted

**Event signature**:
```solidity
event Withdrawn(
    address indexed dao,
    bytes32 indexed cidHash,
    string cid,
    address indexed user,
    uint256 amountOut,
    uint256 userRawAfter,
    uint256 userSqrtAfter,
    uint256 totalRawAfter,
    uint256 totalQuadAfter
);
```

### Memory Retrieval

**Query functions**:
```solidity
// Get memory by CID hash
function getMemoryByHash(bytes32 cidHash)
    external view returns (MemoryAggregate memory)

// Compute CID hash (for off-chain tools)
function cidHashOf(string calldata cid)
    external pure returns (bytes32)
```

**Off-chain indexing**:
- Events are indexed by Blockscout and custom indexers
- MongoDB stores aggregated data for fast queries
- Agents use semantic search to find related content
- Trending algorithm weighs recent signal changes heavily

### How Agents Use Collective Memory

1. **Monitor Events**: Listen to `Signaled` and `Withdrawn` events via WebSocket or polling
2. **Identify High-Signal Content**: Query content with highest `totalQuadWeight`
3. **Fetch Content**: Retrieve IPFS content using the CID
4. **Semantic Analysis**: Generate embeddings and perform similarity search
5. **Synthesize**: Create summaries prioritizing broadly-supported content
6. **Verify**: Include on-chain proof (totalRaw, supporters, Blockscout links)
7. **Respond**: Provide insights backed by verifiable blockchain data

**Example Agent Response**:
```
"The community's top priority is 'Proposal: Treasury Diversification Strategy'
with verifiable on-chain support:
- 67 unique supporters
- 5,420 tokens staked (totalRaw)
- Quadratic weight: 248.3 (indicates broad consensus)
- View on Blockscout: https://base-sepolia.blockscout.com/address/0x...
- Content: ipfs://QmX..."
```

## Smart Contracts

All contracts are deployed on **Base Sepolia** testnet (production will be on Base mainnet).

### DAOFactory Contract

**Address**: `0x7e5adb9add98bf0c9450cb814c3746f655fde93f`
**Blockscout**: [View Contract](https://base-sepolia.blockscout.com/address/0x7e5adb9add98bf0c9450cb814c3746f655fde93f)
**Source**: [`onchain/contracts/DaoFactory.sol`](onchain/contracts/DaoFactory.sol)

**Purpose**: Factory contract for deploying new DAOs

**Key Methods**:
- `createDAO(name, symbol, initialSupply, metadataCid)` - Deploy new DAO
- `daos(address)` - Get DAO info by registry address

**Events**:
- `DaoCreated(address indexed daoOwner, address token, address signalRegistry, string metadataCid)`

### GovernanceToken Contract

**Address**: Per-DAO (created by factory)
**Source**: [`onchain/contracts/GovernanceToken.sol`](onchain/contracts/GovernanceToken.sol)

**Purpose**: ERC-20 governance token with permit functionality

**Inherits**:
- OpenZeppelin ERC20
- OpenZeppelin ERC20Permit (EIP-2612)
- OpenZeppelin Ownable

**Key Methods**:
- `mint(address to, uint256 amount)` - Mint new tokens (owner only)
- `permit(...)` - Gasless approval via signature (EIP-2612)
- Standard ERC-20: `transfer`, `approve`, `transferFrom`, `balanceOf`

### SignalRegistry Contract

**Address**: Per-DAO (created by factory)
**Source**: [`onchain/contracts/SignalRegistry.sol`](onchain/contracts/SignalRegistry.sol)

**Purpose**: Core collective memory contract - manages token allocations to content

**Key Methods**:
- `signal(string cid, uint256 amount)` - Allocate tokens to content
- `withdraw(string cid, uint256 amount)` - Remove tokens from content
- `getMemoryByHash(bytes32 cidHash)` - Query aggregate data
- `cidHashOf(string cid)` - Compute CID hash

**Events**:
- `Signaled(...)` - Emitted when tokens are allocated
- `Withdrawn(...)` - Emitted when tokens are withdrawn

**Storage**:
- `memories` mapping: CID hash → MemoryAggregate
- `positions` mapping: CID hash → user address → UserPosition

### Contract Verification

All contracts are verified on Blockscout for transparency:
- View source code directly on the explorer
- Interact with contracts through the Blockscout UI
- Monitor events and transactions in real-time

## How It's Built

The Common Lobbyist Protocol is built with a modern, robust technology stack optimized for decentralized governance.

### Frontend Stack

- **Next.js 15** - React framework with App Router for server-side rendering
- **React 19** - UI library with latest features
- **TypeScript** - Type safety across the entire codebase
- **Tailwind CSS** - Utility-first styling
- **Viem** - Ethereum library for blockchain interactions (faster and lighter than ethers.js)
- **Privy** - Authentication (wallet, email, social)
- **Radix UI** - Accessible component primitives

### Backend Stack

- **MongoDB** - Database for off-chain content indexing
- **Mongoose** - Object-document mapping with schema validation
- **MongoDB Atlas Vector Search** - Semantic search using vector embeddings
- **OpenAI API** - Text embeddings (text-embedding-3-small model)

### Blockchain Stack

- **Solidity 0.8.24** - Smart contract language
- **OpenZeppelin Contracts 5.4.0** - Battle-tested contract libraries
- **Base Sepolia** - L2 testnet (low fees, fast finality)
- **Viem** - Type-safe contract interactions

### AI & Agent Stack

- **OpenAI SDK** - LLM integration for agent intelligence
- **AgentCommons** - Agent framework for autonomous DAO agents
- **Agentverse** - Agent marketplace and multiagent communication platform

### Development Tools

Three key technologies power the development and monitoring infrastructure:

#### 1. Hardhat

**What it is**: Ethereum development environment for compiling, testing, and deploying Solidity contracts

**How we use it**:

**Development**:
- **Compilation**: Compiles Solidity contracts with optimizer settings
```bash
cd onchain
npx hardhat compile
```

- **Testing**: Runs comprehensive test suites with Viem integration
```bash
npx hardhat test
```
Tests located in [`onchain/test/`](onchain/test/):
- `core.spec.ts` - Core contract functionality
- Tests for DAOFactory, GovernanceToken, SignalRegistry

- **Local Development**: Runs local Ethereum node for testing
```bash
npx hardhat node
```

**Deployment**:
- **Network Configuration**: [`onchain/hardhat.config.ts`](onchain/hardhat.config.ts)
  - Configured networks: Base Sepolia, Base Mainnet, Sepolia
  - Hardhat EDR for simulated L1 and OP chains

- **Deployment Scripts**: [`onchain/scripts/deploy.ts`](onchain/scripts/deploy.ts)
```bash
# Deploy to Base Sepolia
npm run deploy:base-sepolia

# Deploy to Base Mainnet (production)
npm run deploy:base-mainnet
```

**Features Used**:
- **Hardhat Toolbox Viem**: Modern plugin with Viem integration
- **Optimizer**: Enabled with 200 runs for gas efficiency
- **Multiple Networks**: Easy switching between testnets and mainnet
- **TypeScript Support**: Full type safety in deployment scripts

**Configuration**:
```typescript
// onchain/hardhat.config.ts
solidity: {
  version: "0.8.28",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}
```

#### 2. Blockscout

**What it is**: Open-source blockchain explorer for EVM networks

**How we use it**:

**Contract Transparency**:
- **Source Verification**: All contracts verified on Blockscout
- **Public Inspection**: Anyone can view contract source code and ABI
- **Direct Interaction**: Read/write contract functions through UI

**Transaction Monitoring** ([`lib/services/blockscout.ts`](lib/services/blockscout.ts)):
```typescript
// Get transaction history
blockscoutService.getTransactions(address)

// Get token transfers
blockscoutService.getTokenTransfers(tokenAddress, address)

// Get address info
blockscoutService.getAddressInfo(address)
```

**Agent Integration**:
- Agents fetch real-time on-chain data via Blockscout API
- Transaction history informs user activity analysis
- Token transfers track signal placement/withdrawal
- All agent claims include Blockscout explorer links for verification

**Explorer URLs**:
- Factory Contract: https://base-sepolia.blockscout.com/address/0x7e5adb9add98bf0c9450cb814c3746f655fde93f
- Per-DAO contracts viewable at their deployed addresses
- Transaction hashes link directly to explorer pages

**API Endpoints Used**:
- `/api/v2/addresses/{address}/transactions` - Transaction history
- `/api/v2/addresses/{address}/token-transfers` - Token movements
- `/api/v2/addresses/{address}` - Account information
- `/api/v2/tokens/{address}` - Token metadata

**Benefits**:
- **Transparency**: All on-chain activity publicly auditable
- **Verification**: Agents provide proof with every claim
- **Debugging**: Easy to trace transactions during development
- **Trust**: Users can verify agent statements independently

#### 3. Agentverse

**What it is**: Cloud platform for deploying and managing autonomous AI agents with multiagent communication

**How we use it**:

**Agent Deployment** ([`docs/AGENTVERSE_INTEGRATION.md`](docs/AGENTVERSE_INTEGRATION.md)):
- **Registration**: Deploy Lobbyist Agents to Agentverse cloud
- **Managed Hosting**: No need to self-host agent infrastructure
- **Automatic Configuration**: UI generates agent code and README
- **Webhook Setup**: Automatic endpoint configuration for receiving messages

**Service Layer** ([`lib/services/agentverse.ts`](lib/services/agentverse.ts)):
```typescript
// Register agent on Agentverse
await registerAgent({
  name: "DAO Lobbyist Agent",
  protocols: ["asi-chat"],
  webhook_url: "https://yourdomain.com/api/agent/[id]/agentverse/webhook"
})

// Search for other agents
await searchAgents({
  text: "governance",
  semantic_search: true,
  filters: { state: "running" }
})

// Send message to another agent
await sendAgentMessage({
  from: "agent1q...",
  to: "agent1q...",
  protocol: "asi-chat",
  payload: { text: "Hello!" }
})
```

**Multiagent Communication**:
- **ASI Chat Protocol**: Standard protocol for agent messaging
- **Discovery**: Find specialized agents in the marketplace
- **Collaboration**: Agents can request help from other agents
- **Message History**: Track conversations between agents

**API Routes**:
- `POST /api/agent/[id]/agentverse/register` - Register agent
- `GET /api/agent/[id]/agentverse/status` - Check agent status
- `POST /api/agent/[id]/agentverse/discover` - Find other agents
- `POST /api/agent/[id]/agentverse/message` - Send message
- `POST /api/agent/[id]/agentverse/webhook` - Receive messages

**UI Components** ([`components/agent/`](components/agent/)):
- `<AgentverseSettings />` - Registration and configuration
- `<AgentDiscovery />` - Browse and search agents
- `<AgentMessaging />` - Send messages to other agents
- `<AgentversePanel />` - All-in-one management interface

**Features Used**:
- **Agent Registry**: Make agents discoverable by other DAOs
- **Semantic Search**: Find agents by capabilities and description
- **Protocol Support**: ASI Chat for standardized communication
- **Performance Analytics**: Track agent interactions and usage
- **Managed Infrastructure**: Cloud hosting with automatic scaling

**Environment Configuration**:
```bash
# .env.local
AGENTVERSE_API_KEY=your_api_key_here
AGENTVERSE_API_URL=https://agentverse.ai/v1
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

**Benefits**:
- **Discoverability**: DAOs can find each other's agents
- **Interoperability**: Agents communicate via standard protocols
- **Scalability**: Cloud infrastructure handles load
- **Ecosystem**: Access to marketplace of specialized agents
- **Collaboration**: Multi-DAO coordination through agent networks

### Additional Technologies

- **IPFS**: Content storage (Pinata for pinning)
- **Git**: Version control
- **ESLint**: Code linting
- **Prettier**: Code formatting

### Project Structure

```
common-lobbyist/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── agent/               # Agent management APIs
│   │   ├── memory/              # Memory & search APIs
│   │   ├── organizations/       # DAO CRUD operations
│   │   └── auth/                # Authentication
│   ├── new/                     # Create DAO page
│   └── [organizationId]/        # DAO dashboard
├── components/                   # React components
│   ├── agent/                   # Agent UI (Agentverse integration)
│   ├── auth/                    # Authentication components
│   ├── forum/                   # Forum and discussion UI
│   └── layout/                  # Layout components
├── lib/                         # Core libraries
│   ├── contracts/               # Contract configs and addresses
│   ├── services/                # Service layer
│   │   ├── agentverse.ts       # Agentverse integration
│   │   ├── blockscout.ts       # Blockscout API client
│   │   ├── memory.ts           # Semantic search & memory
│   │   ├── onchain.ts          # On-chain data queries
│   │   └── embedding.ts        # OpenAI embeddings
│   ├── tools/                   # Agent tools
│   │   └── memory-tools.ts     # 8 tools for agents
│   └── dbConnect.ts            # MongoDB connection
├── models/                      # MongoDB schemas
│   ├── Organization.ts         # DAO model
│   ├── Content.ts              # Posts/comments with embeddings
│   └── Agent.ts                # Lobbyist agent model
├── onchain/                     # Smart contracts
│   ├── contracts/              # Solidity source
│   │   ├── DaoFactory.sol
│   │   ├── GovernanceToken.sol
│   │   └── SignalRegistry.sol
│   ├── scripts/                # Deployment scripts
│   ├── test/                   # Contract tests
│   └── hardhat.config.ts       # Hardhat configuration
├── scripts/                     # Utility scripts
│   └── index-content.ts        # Index content for vector search
└── docs/                        # Documentation
    ├── AGENTVERSE_INTEGRATION.md
    ├── MEMORY_SYSTEM_SUMMARY.md
    └── ...
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Wallet with Base Sepolia ETH ([get from faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet))
- OpenAI API key (for semantic search)
- Agentverse API key (optional, for agent deployment)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/common-lobbyist.git
cd common-lobbyist
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```bash
# Privy (get from https://dashboard.privy.io)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_secret

# MongoDB
MONGODB_URI=mongodb://localhost:27017/common-lobbyist
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/common-lobbyist

# OpenAI (for semantic search)
OPENAI_API_KEY=your_openai_key

# Agentverse (optional)
AGENTVERSE_API_KEY=your_agentverse_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. **Set up MongoDB Atlas Vector Search** (required for semantic search):

Follow instructions in [`docs/MEMORY_SYSTEM_SETUP.md`](docs/MEMORY_SYSTEM_SETUP.md) to create the vector search index.

5. **Run development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deploy Contracts (Optional)

If you want to deploy your own factory:

```bash
cd onchain
cp .env.example .env

# Add your private key to .env
PRIVATE_KEY=your_private_key

# Deploy to Base Sepolia
npm run deploy:base-sepolia
```

Update [`lib/contracts/config.ts`](lib/contracts/config.ts) with your factory address.

### Index Content

After creating some DAOs and content:

```bash
# Index all content
npm run index-content -- --all

# Index specific DAO
npm run index-content -- --daoId=507f1f77bcf86cd799439011

# Check indexing status
npm run index-content -- --status
```

### Test Contracts

```bash
cd onchain
npx hardhat test
```

## Documentation

### Setup & Integration
- [**SETUP.md**](SETUP.md) - Detailed setup instructions
- [**INTEGRATION.md**](INTEGRATION.md) - Architecture and integration guide
- [**TESTING.md**](TESTING.md) - Testing procedures

### Memory System
- [**MEMORY_SYSTEM_SETUP.md**](docs/MEMORY_SYSTEM_SETUP.md) - Vector search configuration
- [**MEMORY_SYSTEM_SUMMARY.md**](docs/MEMORY_SYSTEM_SUMMARY.md) - Memory system overview
- [**MEMORY_SYSTEM_QUICKSTART.md**](MEMORY_SYSTEM_QUICKSTART.md) - Quick setup guide

### Agent Integration
- [**AGENTVERSE_INTEGRATION.md**](docs/AGENTVERSE_INTEGRATION.md) - Agentverse setup and usage
- [**AGENT_INTEGRATION_GUIDE.md**](AGENT_INTEGRATION_GUIDE.md) - Agent integration details
- [**AGENT_SETUP_CHECKLIST.md**](AGENT_SETUP_CHECKLIST.md) - Step-by-step agent setup
- [**AGENT_FUNDING_GUIDE.md**](AGENT_FUNDING_GUIDE.md) - Funding agent wallets
- [**AGENT_TOKEN_IMPLEMENTATION.md**](AGENT_TOKEN_IMPLEMENTATION.md) - Token handling in agents

### Implementation
- [**IMPLEMENTATION_SUMMARY.md**](IMPLEMENTATION_SUMMARY.md) - What was built
- [**SIGNAL_PLACEMENT_FIX.md**](SIGNAL_PLACEMENT_FIX.md) - Signal placement implementation

## Vision & Impact

### The Vision

DAOs face a fundamental coordination problem: **the volume of community input far exceeds what humans can process**. The Common Lobbyist Protocol creates a governance coordination layer where:

1. **Communities signal priorities** through transparent token allocation
2. **AI agents synthesize** highly-signaled content into actionable insights
3. **Collective memory emerges** from distributed participation
4. **Priorities evolve naturally** as tokens shift over time

This enables DAOs to **understand themselves and govern effectively at scale**.

### Impact

**For Communities**:
- **Scalable Governance**: Process unlimited community input without bottlenecks
- **Democratic Memory**: Broad consensus valued over raw capital (quadratic voting)
- **Natural Evolution**: Priorities update automatically as community focuses shift
- **Transparency**: All signals verifiable on-chain with Blockscout

**For Members**:
- **Voice Amplification**: Signal what matters most to you
- **Verifiable Influence**: See exactly how your signals affect collective memory
- **AI Advocacy**: Agents champion your priorities 24/7
- **Reduced Overhead**: Agents handle synthesis, you focus on governance

**For DAOs**:
- **Institutional Memory**: Never lose track of important discussions
- **Trend Awareness**: Automatically identify emerging priorities
- **Data-Driven Decisions**: Every recommendation backed by on-chain proof
- **Coordination at Scale**: Handle thousands of participants effectively

## Security & Trust

- **Smart Contract Security**: Built with OpenZeppelin libraries, tested extensively
- **On-Chain Verification**: All signals publicly auditable via Blockscout
- **JWT Authentication**: Privy-based auth with server-side verification
- **Transparent Logic**: Agent decisions traceable to on-chain data
- **Immutable Content**: IPFS ensures content cannot be altered after creation
- **Quadratic Fairness**: Mathematical guarantee against whale dominance

## Contributing

This is an open protocol. Contributions welcome:
- Report issues on GitHub
- Submit pull requests
- Build integrations and extensions
- Deploy for your DAO and share feedback

## License

MIT License - see LICENSE file for details

## Links & Resources

- **Base Network**: https://base.org/
- **Blockscout Explorer**: https://base-sepolia.blockscout.com/
- **Agentverse Platform**: https://agentverse.ai/
- **Privy Auth**: https://docs.privy.io/
- **Hardhat**: https://hardhat.org/
- **Viem**: https://viem.sh/
- **OpenAI**: https://platform.openai.com/
- **IPFS**: https://ipfs.tech/

---

**Built for the future of decentralized governance**

Ready to deploy your first DAO with collective memory? → [Get Started](#quick-start)
