 # Common Lobbyist Protocol

 A governance coordination layer that gives DAOs a living collective memory and deployable Lobbyist Agents to surface and champion community priorities.

 ## Context

 DAOs coordinate through smart contracts and open discussion. As participation scales, signal-to-noise collapses: important threads are missed, debates repeat, and institutional memory decays.

 ## Problem

 Human moderators and delegates can't reliably surface and preserve the most important community inputs as DAOs grow. Valuable context is scattered across forum threads and proposals and is hard to keep current.

 ## Solution

 The Common Lobbyist Protocol combines on-chain signalling with autonomous, auditable AI agents. Communities place tokens on content to "remember" it; withdrawing tokens lets content naturally decay. Off-chain Lobbyist Agents index high-signal content, synthesize it into verifiable outputs, and publish recommendations that represent the community's prioritized memory.

 ## How it works (concise)

 - Deploy a DAO via the `DAOFactory`: the factory creates a `GovernanceToken` and a `SignalRegistry` for that DAO.
 - Members allocate governance tokens to an IPFS CID with `SignalRegistry.signal(cid, amount)` (place-to-remember). Tokens are held in the registry contract.
 - Members withdraw tokens with `SignalRegistry.withdraw(cid, amount)` (withdraw-to-forget); this returns tokens and reduces a CID's influence.
 - Influence is aggregated quadratically: each user's contribution contributes floor(sqrt(tokens)). The registry stores both `totalRaw` (absolute stake) and `totalQuadWeight` (breadth-weighted support). This reduces whale dominance and favors broad consensus.
 - Lobbyist Agents read registry events and high-signal CIDs, fetch the underlying content (IPFS), and synthesize transparent summaries and suggested actions. Agents' outputs are auditable because signals are on-chain.

 ## DAO Factory, DAOs, Forums & Lobbyist Agents

 - DAOFactory (`onchain/contracts/DaoFactory.sol`): `createDAO(name, symbol, initialSupply, metadataCid)` deploys a `GovernanceToken` and a `SignalRegistry`, records `DaoInfo`, and emits `DaoCreated`.
 - GovernanceToken (`onchain/contracts/GovernanceToken.sol`): ERC-20 token with EIP-2612 permit for better UX; mintable by the DAO owner.
 - SignalRegistry (`onchain/contracts/SignalRegistry.sol`): core memory contract. Key public methods: `signal(cid, amount)`, `withdraw(cid, amount)`, `getMemoryByHash(bytes32)`, and `cidHashOf(string)`. Events: `Signaled` and `Withdrawn` provide a complete audit trail.
 - Forum integration: front-end components link forum content to IPFS CIDs; users signal directly from the UI. Agent components (`components/agent/*`) configure and run Lobbyist Agents that synthesize high-signal content.

 ## Collective memory (how token voting implements it)

 - Per CID the registry stores:
   - `totalRaw`: total tokens allocated
   - `totalQuadWeight`: sum of floor(sqrt(userAllocated)) — quadratic aggregation
   - `supporters`: count of unique wallets with non-zero allocation
 - When tokens are withdrawn, these aggregates update and agents will de-prioritize content with falling `totalQuadWeight`.

 ## Contracts & deployed addresses

 - Current configured factory address (used by the app config): `0x7e5adb9add98bf0c9450cb814c3746f655fde93f` (Sepolia / `baseSepolia`). This value is defined in `lib/contracts/config.ts` and is used by UI onboarding and DAO creation flows.
 - Per-DAO `token` and `signalRegistry` addresses are returned by `DAOFactory.createDAO(...)` at deployment and saved in the factory's `daos` mapping.

 Tip: view on-chain activity using Blockscout (or your network explorer) for the target network and the factory/registry addresses.

 ## How it's built (high level)

 - Frontend: Next.js (app router), React, TypeScript. UI under `components/` and pages in `app/`.
 - Contracts: Solidity 0.8.24, sources and tests under `onchain/` (`onchain/contracts/`, `onchain/test/`).
 - Tooling: Hardhat for compilation, testing and deployment; `onchain` contains the Hardhat setup and test suite.
 - Agent & AI: Agentverse integrations in the UI; the system uses off-chain agents (AI) to read signals, fetch content, and produce summaries. OpenAI SDK is included for AI functionality.
 - Chain & infra: `viem` for chain interactions, MongoDB for off-chain indexing, `@blockscout/app-sdk` included for exploration/analytics.

 ### Focus notes

 - Blockscout: used to inspect contract events and transactions — useful for auditing signals and verifying activity for the factory and registries.
 - Agentverse: the UI includes panels to configure agent behavior and view outputs.
 - Hardhat: used for Solidity development: compile, test (`npx hardhat test`) and deploy. The repository includes verification helpers (`scripts/verify-setup.ts`) to validate local environment and contract configuration.

 ## Quick start (minimal)

 1. Configure environment variables (e.g. `MONGODB_URI`, RPC endpoint, API keys).
 2. Install and run:

 ```bash
 npm install
 npm run dev
 ```

 3. Optional: run Solidity tests or verification helpers:

 ```bash
 npx hardhat test
 npx tsx scripts/verify-setup.ts
 ```

 ## Where to read next

 - Smart contract source: `onchain/contracts/`
 - App contract config: `lib/contracts/config.ts`
 - Integration notes: `INTEGRATION.md`, `AGENT_INTEGRATION_GUIDE.md`, `AGENT_SETUP_CHECKLIST.md`
 - Agent docs: `AGENT_FUNDING_GUIDE.md`, `AGENT_TOKEN_IMPLEMENTATION.md`

 ---

 For implementation questions or to extend the protocol, start by reading the contracts in `onchain/contracts` and the integration notes in `INTEGRATION.md`.
 
# Common Lobbyist Protocol

> A governance coordination layer for DAOs with collective memory and token-based signaling

## 🎯 Overview

The Common Lobbyist Protocol enables DAOs to deploy autonomous, on-chain agents that listen across governance platforms, organize discussion, and articulate the community's shared positions. Members guide the agent's focus through **place-to-remember, withdraw-to-forget** token signaling with quadratic voting.

## ✨ Features

- 🏛️ **On-Chain DAO Deployment** - One-click deployment of governance tokens and signal registries
- 🔐 **Secure Authentication** - Wallet, email, and social login via Privy
- 🗳️ **Quadratic Voting** - Fair representation that prevents whale dominance
- 💾 **Persistent Memory** - Content stored on IPFS and MongoDB for fast queries
- 🔗 **Blockchain Integration** - Real-time sync between smart contracts and database
- 📊 **Signal Analytics** - Track community priorities with token-weighted signals

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
MONGODB_URI=mongodb://localhost:27017/common-lobbyist
```

Get Privy credentials at [https://dashboard.privy.io](https://dashboard.privy.io)

### 3. Start MongoDB

```bash
# macOS
brew services start mongodb-community

# Or use MongoDB Atlas cloud database
```

### 4. Verify Setup

```bash
npx tsx scripts/verify-setup.ts
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📖 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[INTEGRATION.md](INTEGRATION.md)** - Architecture and integration guide
- **[TESTING.md](TESTING.md)** - Testing procedures
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - What was built

## 🏗️ Architecture

### Smart Contracts (Base Sepolia)

```
DAOFactory (0x7e5adb9add98bf0c9450cb814c3746f655fde93f)
├── GovernanceToken (ERC-20)
│   └── Mintable by owner
└── SignalRegistry
    ├── signal(cid, amount) - Place tokens on content
    ├── withdraw(cid, amount) - Remove tokens from content
    └── Quadratic formula: weight = √(tokens)
```

### Frontend Stack

- **Next.js 15** - React framework
- **Viem** - Ethereum library
- **Privy** - Authentication
- **Tailwind CSS** - Styling

### Backend Stack

- **MongoDB** - Database
- **Mongoose** - ODM
- **Privy Server SDK** - JWT verification

## 🎮 Usage

### Create a DAO

1. Login with wallet or email
2. Navigate to `/new`
3. Fill in DAO details:
   - Name & description
   - Token name & symbol
   - Initial supply
4. Deploy (confirms in wallet)
5. Wait for on-chain deployment
6. DAO saved to database

### Place Signal on Content

1. View content in a DAO
2. Click "Signal" or "Support"
3. Enter token amount
4. Approve & confirm transactions
5. On-chain state syncs to database

### How Quadratic Voting Works

```
User A places 100 tokens → weight = 10
User B places 100 tokens → weight = 10
Total: 200 tokens, weight = 20

User C places 10,000 tokens → weight = 100
Not 10,000! This prevents whale dominance.
```

## 🔐 Security

- ✅ JWT verification on all protected routes
- ✅ Wallet ownership validation
- ✅ Transaction simulation before execution
- ✅ MongoDB injection protection
- ✅ Server-side environment variables

## 📁 Project Structure

```
common-lobbyist/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   └── new/               # Create DAO page
├── components/            # React components
│   ├── auth/             # Authentication
│   └── layout/           # Layout components
├── context/              # React context
├── hooks/                # Custom hooks
├── lib/                  # Utilities
│   ├── contracts/       # Contract interactions
│   ├── auth/            # Auth middleware
│   └── ipfs/            # IPFS utilities
├── models/               # MongoDB schemas
├── onchain/              # Smart contracts
│   └── contracts/       # Solidity files
└── scripts/              # Helper scripts
```

## 🛠️ Key Technologies

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.24, Hardhat |
| Blockchain Client | Viem, Privy |
| Frontend | Next.js 15, React 19, TypeScript |
| Authentication | Privy (JWT + Wallet) |
| Database | MongoDB, Mongoose |
| Styling | Tailwind CSS |
| Network | Base Sepolia (Testnet) |

## 📊 Data Flow

```
User Action
    ↓
Smart Contract Call (via Viem)
    ↓
On-Chain State Update
    ↓
Event Emission
    ↓
Frontend Listener
    ↓
API Call (with JWT Auth)
    ↓
MongoDB Sync
    ↓
UI Update
```

## 🧪 Testing

Get Base Sepolia testnet ETH:
[Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)

Run tests:
```bash
# Smart contract tests
cd onchain
npx hardhat test

# Verify setup
npx tsx scripts/verify-setup.ts
```

See [TESTING.md](TESTING.md) for detailed test procedures.

## 🚢 Production Deployment

Before deploying to mainnet:

1. Deploy contracts to mainnet
2. Update `lib/contracts/config.ts` with addresses
3. Configure production MongoDB (Atlas)
4. Set up IPFS pinning (Pinata/web3.storage)
5. Enable Privy production mode
6. Set up monitoring (Sentry, etc.)
7. Configure rate limiting
8. Review security checklist in TESTING.md

## 📚 Learn More

### Concept

The Common Lobbyist Protocol implements a "place to remember, withdraw to forget" signaling mechanism. Community members allocate governance tokens to content they want the collective to remember and champion. When tokens are withdrawn, the content's influence fades. This creates a living collective memory that reflects what the community values most.

### Quadratic Voting

Instead of 1 token = 1 vote, we use:
```
weight = √(tokens_allocated)
```

This reduces the influence of large token holders and encourages broader participation.

### Why IPFS?

Content is stored on IPFS (InterPlanetary File System) for:
- **Immutability** - Content can't be changed after creation
- **Censorship Resistance** - No central point of failure
- **Verifiability** - CID = hash of content

### Smart Contract Design

- **DAOFactory** - Creates DAO instances
- **GovernanceToken** - Standard ERC-20 with permit
- **SignalRegistry** - Manages token allocations per content CID

## 🤝 Contributing

This is a protocol implementation. Feel free to:
- Fork and extend
- Report issues
- Suggest improvements
- Build integrations

## 📄 License

MIT

## 🔗 Links

- [Base Network](https://base.org/)
- [Privy Docs](https://docs.privy.io/)
- [Viem Docs](https://viem.sh/)
- [IPFS](https://ipfs.tech/)

## 💡 Vision

DAOs face a coordination problem: the volume of community input far exceeds what humans can process. The Common Lobbyist Protocol creates a governance coordination layer where:

1. **Communities signal priorities** through token allocation
2. **AI agents synthesize** highly-signaled content
3. **Collective memory emerges** from distributed participation
4. **Priorities evolve naturally** as tokens shift

This enables DAOs to understand themselves and govern effectively at scale.

---

Built with ❤️ for decentralized governance

**Ready to deploy your first DAO?** → [Get Started](./SETUP.md)
