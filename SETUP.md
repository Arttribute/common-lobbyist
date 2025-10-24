# Common Lobbyist - Setup Guide

This guide will help you set up the Common Lobbyist protocol with full integration between smart contracts, Privy authentication, and MongoDB.

## 🎯 Overview

The Common Lobbyist Protocol is a governance coordination layer that allows DAOs to deploy shared autonomous, on-chain agents. Key features:

- **On-chain DAO deployment** via smart contracts (DAOFactory, GovernanceToken, SignalRegistry)
- **Token-based signaling** - "place to remember, withdraw to forget"
- **Quadratic voting** for fair community representation
- **Secure authentication** via Privy (wallet, email, social)
- **Persistent storage** via MongoDB

## 📋 Prerequisites

1. **Node.js** v18 or higher
2. **MongoDB** (local or Atlas)
3. **Privy Account** - [Sign up here](https://dashboard.privy.io)
4. **Base Sepolia testnet** ETH for deployments
5. **MetaMask or compatible wallet**

## 🔧 Installation Steps

### 1. Clone and Install Dependencies

```bash
cd common-lobbyist
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Privy - Get from https://dashboard.privy.io
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# MongoDB
MONGODB_URI=mongodb://localhost:27017/common-lobbyist
```

### 3. Set Up Privy

1. Go to [Privy Dashboard](https://dashboard.privy.io)
2. Create a new app
3. Enable login methods:
   - ✅ Email
   - ✅ Wallet
   - ✅ Google (optional)
4. Configure embedded wallets:
   - Enable "Ethereum" embedded wallets
   - Set to "Create on login for users without wallets"
5. Copy your App ID and App Secret to `.env.local`

### 4. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB
brew install mongodb-community  # macOS
# or follow instructions for your OS

# Start MongoDB
brew services start mongodb-community
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string and add to `.env.local`

### 5. Deploy Smart Contracts (Already Done!)

The DAOFactory contract is already deployed at:
```
Address: 0x7e5adb9add98bf0c9450cb814c3746f655fde93f
Network: Base Sepolia
```

This is configured in `lib/contracts/config.ts`.

If you want to deploy your own:
```bash
cd onchain
npx hardhat run scripts/deploy.ts --network baseSepolia
```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🎮 Using the Application

### 1. Create a DAO

1. Click "Login" in the navbar
2. Connect your wallet or use email/social login
3. Go to "Create DAO"
4. Fill in:
   - DAO Name (e.g., "Ethereum Governance")
   - Description
   - Token Name (e.g., "Ethereum Governance Token")
   - Token Symbol (e.g., "EGT")
   - Initial Supply (e.g., 1000000)
5. Click "Deploy DAO"
6. Confirm the transaction in your wallet
7. Wait for deployment to complete

**What happens:**
- Smart contracts are deployed on Base Sepolia
- GovernanceToken is created and initial supply minted to you
- SignalRegistry is deployed for collective memory
- DAO details are saved to MongoDB with on-chain addresses

### 2. Post Content

1. Navigate to your DAO
2. Create a forum or select existing one
3. Create a new post
4. Content is uploaded to IPFS (mock for now)
5. Content is saved to MongoDB

### 3. Signal Content (Place Tokens)

When a post receives token placements:

1. User calls `signal(cid, amount)` on SignalRegistry
2. Tokens are transferred from user to registry
3. Quadratic weight is calculated: `sqrt(totalTokens)`
4. Event is emitted with updated totals
5. Frontend syncs data to MongoDB via `/api/content/signal`

**Flow:**
```
Frontend → Contract (signal) → Blockchain
         ↓
   Update MongoDB (sync on-chain data)
```

## 🏗️ Architecture

### Smart Contracts

1. **DAOFactory** (`0x7e5adb9...`)
   - Deploys GovernanceToken + SignalRegistry pairs
   - Stores DAO metadata on-chain

2. **GovernanceToken** (ERC-20)
   - Standard governance token
   - 18 decimals
   - Owner can mint (for distributions)

3. **SignalRegistry**
   - Tracks token allocations per content CID
   - Quadratic voting formula
   - Supports signal/withdraw

### Database Schema

1. **Organization (DAO)**
   - Name, description, token details
   - On-chain addresses (factory, token, registry)
   - Creator address
   - Chain ID, deployment tx

2. **Content**
   - Post/comment/poll data
   - IPFS CID
   - On-chain signal data (totalRaw, totalQuadWeight, supporters)
   - Sync status

3. **User**
   - Wallet addresses
   - Social handles (Farcaster, Discord)
   - Sybil scores

### API Endpoints

**Public:**
- `GET /api/organization` - List all DAOs
- `GET /api/content/signal?contentId=xxx` - Get signal data

**Protected (requires auth):**
- `POST /api/organization` - Create DAO (after on-chain deployment)
- `POST /api/content/signal` - Sync on-chain signal data

### Authentication Flow

1. User logs in via Privy (wallet/email/social)
2. Privy issues JWT access token
3. Frontend stores token in AuthContext
4. API requests include `Authorization: Bearer <token>`
5. Server validates token with Privy
6. User's wallet address is extracted

## 🔒 Security Features

- ✅ JWT verification on all protected routes
- ✅ Wallet ownership verification
- ✅ On-chain transaction validation
- ✅ MongoDB injection protection (Mongoose)
- ✅ HTTPS enforced in production

## 📝 Key Files Reference

### Frontend
- `app/new/page.tsx` - Create DAO page
- `hooks/useContracts.ts` - Contract interaction hooks
- `context/auth-context.tsx` - Auth state management
- `components/auth/protected-route.tsx` - Route protection

### Backend
- `app/api/organization/route.ts` - DAO CRUD
- `app/api/content/signal/route.ts` - Signal sync
- `lib/auth/middleware.ts` - Auth verification

### Contracts
- `lib/contracts/dao-factory.ts` - DAO deployment
- `lib/contracts/signal-registry.ts` - Signal operations
- `lib/abis/` - Contract ABIs

### Database
- `models/Organization.ts` - DAO schema
- `models/Content.ts` - Content schema
- `models/User.ts` - User schema

## 🧪 Testing

### Test DAO Creation

1. Get Base Sepolia ETH from [faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. Follow "Create a DAO" steps above
3. Verify contract deployment on [Base Sepolia Explorer](https://sepolia.basescan.org/)
4. Check MongoDB for saved DAO

### Test Signal Placement

1. Create content in your DAO
2. Use the signal UI to place tokens
3. Check transaction on explorer
4. Verify MongoDB updated with on-chain data

## 🚧 Production Checklist

Before going to mainnet:

- [ ] Configure real IPFS pinning (Pinata/web3.storage)
- [ ] Set up production MongoDB Atlas cluster
- [ ] Deploy contracts to mainnet
- [ ] Update `lib/contracts/config.ts` with mainnet addresses
- [ ] Enable rate limiting on API routes
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Configure proper CORS policies
- [ ] Enable Privy production settings
- [ ] Set up proper environment variable management

## 🐛 Troubleshooting

### "Authentication required" error
- Check `.env.local` has correct Privy credentials
- Ensure PRIVY_APP_SECRET is set (server-side)
- Try logging out and back in

### Contract deployment fails
- Check you have Base Sepolia ETH
- Verify network in MetaMask is Base Sepolia
- Check factory address in `lib/contracts/config.ts`

### MongoDB connection error
- Ensure MongoDB is running locally
- Check `MONGODB_URI` in `.env.local`
- For Atlas, verify IP whitelist

### Transaction not confirming
- Base Sepolia can be slow; wait 1-2 minutes
- Check transaction on Base Sepolia explorer
- Ensure sufficient gas

## 📚 Additional Resources

- [Privy Docs](https://docs.privy.io/)
- [Viem Docs](https://viem.sh/)
- [Hardhat Docs](https://hardhat.org/docs)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)

## 🤝 Support

For issues or questions:
1. Check this setup guide
2. Review code comments
3. Check contract ABIs in `lib/abis/`
4. Review Privy authentication flow

## 🎉 Next Steps

After basic setup:
1. Implement IPFS pinning (see `lib/ipfs/upload.ts`)
2. Add content signal UI components
3. Build governance analytics dashboard
4. Implement AI agent integration
5. Add Farcaster/Discord integration
