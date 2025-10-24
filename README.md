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
