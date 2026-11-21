# TraceLock — Quai Network Smart Contract Anchoring Layer

This directory contains the Solidity smart contract and deployment scripts for anchoring TraceLock digital evidence checkpoints onto **Quai Network (Orchard Testnet)**.

---

## 1. Contract Overview

- **Contract Name**: `TraceLockAnchor.sol`
- **Compiler Version**: Solidity `0.8.20`
- **Network**: Quai Orchard Testnet (Cyprus-1 Zone)
- **Chain ID**: `15000` (Hex: `0x3a98`)
- **RPC URL**: `https://orchard.rpc.quai.network/cyprus1`
- **Block Explorer**: [https://orchard.quaiscan.io](https://orchard.quaiscan.io) / [https://explorer.qu.ai](https://explorer.qu.ai)
- **Primary Function**: Anchors cryptographic root hashes (`bytes32`) and metadata of system activity log segments.
- **Privacy & Security**: Zero sensitive logs or raw payload data are written to the blockchain. Only cryptographic commitments are anchored on-chain.

---

## 2. Functions

### `anchorCheckpoint(bytes32 checkpointId, bytes32 rootHash, uint256 recordCount, bytes32 prevCheckpointId)`
Anchors a new checkpoint. Emits `CheckpointAnchored`. Rejects duplicates if `checkpointId` has already been sealed.

### `getCheckpoint(bytes32 checkpointId)`
Retrieves an anchored checkpoint's root hash, record count, anchor timestamp, block number, submitter address, and previous checkpoint ID.

### `verifyCheckpoint(bytes32 checkpointId, bytes32 localRootHash)`
Compares candidate `localRootHash` against on-chain stored root hash. Returns `(bool isMatch, bytes32 onChainRootHash, uint256 timestamp)`.

---

## 3. Testnet Deployment Instructions

### Prerequisites
1. Node.js v18+
2. A Quai Network wallet address on the Cyprus-1 zone (`0x...` starting in the Cyprus-1 address prefix range)
3. Testnet `QUAI` tokens from the official Quai faucet: [https://faucet.quai.network](https://faucet.quai.network) or Discord faucet.

### Step 1: Install Dependencies
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

### Step 2: Configure `hardhat.config.js`
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    orchardCyprus1: {
      url: "https://orchard.rpc.quai.network/cyprus1",
      chainId: 15000,
      accounts: [process.env.CYPRUS1_PRIVATE_KEY]
    }
  }
};
```

### Step 3: Deploy to Quai Testnet
```bash
npx hardhat run contracts/deploy-quai.js --network orchardCyprus1
```

### Step 4: Update Frontend Configuration
Copy the output contract address into `.env`:
```env
VITE_QUAI_CONTRACT_ADDRESS="0x..."
```
