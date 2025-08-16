# DAO Launcher Kit - API Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Main DAO Backend API](#main-dao-backend-api)
- [Governance API](#governance-api)
- [Staking API](#staking-api)
- [Treasury API](#treasury-api)
- [Proposals API](#proposals-api)
- [Assets API](#assets-api)
- [Error Handling](#error-handling)
- [Type Definitions](#type-definitions)

## Overview

The DAO Launcher Kit provides a comprehensive set of APIs for creating and managing Decentralized Autonomous Organizations on the Internet Computer. The system is built using a microservices architecture with separate canisters for different functionalities.

### Base URL Structure
```
Local Development: http://localhost:4943/?canisterId={canister_id}
IC Mainnet: https://{canister_id}.ic0.app
```

### Canister IDs
- **dao_backend**: Main coordinator canister
- **governance**: Voting and proposal management
- **staking**: Token staking mechanisms
- **treasury**: Financial operations
- **proposals**: Proposal lifecycle
- **assets**: Asset management

## Authentication

All authenticated endpoints require Internet Identity authentication. The system uses Principal-based authentication.

### Authentication Flow
```javascript
// Initialize auth client
const authClient = await AuthClient.create();

// Login
await authClient.login({
  identityProvider: "https://identity.ic0.app",
  onSuccess: () => {
    const identity = authClient.getIdentity();
    const principal = identity.getPrincipal().toString();
  }
});
```

## Main DAO Backend API

### Initialize DAO
Creates a new DAO with basic configuration.

**Endpoint:** `dao_backend.initialize`

**Method:** `POST`

**Parameters:**
```motoko
initialize(
  name: Text,
  description: Text, 
  initialAdmins: [Principal]
) : async Result<(), Text>
```

**Example:**
```javascript
const result = await actors.daoBackend.initialize(
  "My DAO",
  "A community-driven organization",
  [Principal.fromText("rdmx6-jaaaa-aaaaa-aaadq-cai")]
);
```

**Response:**
```javascript
// Success
{ ok: null }

// Error
{ err: "Error message" }
```

### Register User
Registers a new user profile in the DAO.

**Endpoint:** `dao_backend.registerUser`

**Parameters:**
```motoko
registerUser(displayName: Text, bio: Text) : async Result<(), Text>
```

**Example:**
```javascript
const result = await actors.daoBackend.registerUser(
  "John Doe",
  "Blockchain enthusiast and developer"
);
```

### Get User Profile
Retrieves user profile information.

**Endpoint:** `dao_backend.getUserProfile`

**Parameters:**
```motoko
getUserProfile(user: Principal) : async ?UserProfile
```

**Response:**
```javascript
{
  id: Principal,
  displayName: "John Doe",
  bio: "Blockchain enthusiast",
  joinedAt: 1692115200000000000,
  reputation: 100,
  totalStaked: 1000,
  votingPower: 150
}
```

### Set DAO Configuration
Configures DAO parameters and modules.

**Endpoint:** `dao_backend.setDAOConfig`

**Parameters:**
```motoko
setDAOConfig(config: DAOConfig) : async Result<(), Text>
```

**Example:**
```javascript
const config = {
  category: "DeFi",
  website: "https://mydao.com",
  selectedModules: ["governance", "staking", "treasury"],
  moduleFeatures: [
    {
      moduleId: "governance",
      features: ["token-voting", "quadratic-voting"]
    }
  ],
  tokenName: "MyDAO Token",
  tokenSymbol: "MDT",
  totalSupply: 1000000,
  initialPrice: 100,
  votingPeriod: 604800,
  quorumThreshold: 10,
  proposalThreshold: 1,
  fundingGoal: 100000,
  fundingDuration: 2592000,
  minInvestment: 100,
  termsAccepted: true,
  kycRequired: false
};

const result = await actors.daoBackend.setDAOConfig(config);
```

### Get DAO Statistics
Retrieves comprehensive DAO statistics.

**Endpoint:** `dao_backend.getDAOStats`

**Response:**
```javascript
{
  totalMembers: 150,
  totalProposals: 25,
  activeProposals: 3,
  totalStaked: 50000,
  treasuryBalance: 75000,
  governanceParticipation: 85.5
}
```

## Governance API

### Create Proposal
Creates a new governance proposal.

**Endpoint:** `governance.createProposal`

**Parameters:**
```motoko
createProposal(
  title: Text,
  description: Text,
  proposalType: ProposalType,
  votingPeriod: ?Nat
) : async Result<ProposalId, GovernanceError>
```

**Example:**
```javascript
const result = await actors.governance.createProposal(
  "Increase Treasury Allocation",
  "Proposal to allocate 10% more funds to development",
  { treasuryAllocation: null },
  null // Use default voting period
);
```

### Vote on Proposal
Casts a vote on a proposal.

**Endpoint:** `governance.vote`

**Parameters:**
```motoko
vote(
  proposalId: ProposalId,
  choice: VoteChoice,
  reason: ?Text
) : async Result<(), GovernanceError>
```

**Example:**
```javascript
const result = await actors.governance.vote(
  1, // proposalId
  { inFavor: null },
  "I support this allocation for future growth"
);
```

### Get Proposal
Retrieves detailed proposal information.

**Endpoint:** `governance.getProposal`

**Parameters:**
```motoko
getProposal(proposalId: ProposalId) : async ?Proposal
```

**Response:**
```javascript
{
  id: 1,
  proposer: Principal.fromText("..."),
  title: "Increase Treasury Allocation",
  description: "Detailed proposal description...",
  proposalType: { treasuryAllocation: null },
  status: { active: null },
  votesInFavor: 150,
  votesAgainst: 25,
  totalVotingPower: 200,
  createdAt: 1692115200000000000,
  votingDeadline: 1692720000000000000,
  executionDeadline: null,
  quorumThreshold: 10,
  approvalThreshold: 51
}
```

### Get Active Proposals
Lists all active proposals.

**Endpoint:** `governance.getActiveProposals`

**Response:**
```javascript
[
  {
    id: 1,
    title: "Increase Treasury Allocation",
    status: { active: null },
    votingDeadline: 1692720000000000000
  },
  // ... more proposals
]
```

## Staking API

### Stake Tokens
Stakes tokens for a specified period.

**Endpoint:** `staking.stakeTokens`

**Parameters:**
```motoko
stakeTokens(
  amount: TokenAmount,
  stakingPeriod: StakingPeriod
) : async Result<StakeId, StakingError>
```

**Example:**
```javascript
const result = await actors.staking.stakeTokens(
  1000, // amount
  { locked90: null } // 90-day lock period
);
```

### Unstake Tokens
Unstakes tokens (if unlocking period has passed).

**Endpoint:** `staking.unstake`

**Parameters:**
```motoko
unstake(stakeId: StakeId) : async Result<TokenAmount, StakingError>
```

### Get User Stakes
Retrieves all stakes for a user.

**Endpoint:** `staking.getUserStakes`

**Parameters:**
```motoko
getUserStakes(user: Principal) : async [Stake]
```

**Response:**
```javascript
[
  {
    id: 1,
    staker: Principal.fromText("..."),
    amount: 1000,
    stakingPeriod: { locked90: null },
    stakedAt: 1692115200000000000,
    unlocksAt: 1699891200000000000,
    rewards: 45,
    isActive: true
  }
]
```

### Get Staking Summary
Gets aggregated staking information for a user.

**Endpoint:** `staking.getUserStakingSummary`

**Response:**
```javascript
{
  totalStaked: 5000,
  totalRewards: 230,
  activeStakes: 3,
  totalVotingPower: 750
}
```

## Treasury API

### Deposit
Deposits tokens to the treasury.

**Endpoint:** `treasury.deposit`

**Parameters:**
```motoko
deposit(amount: TokenAmount, description: Text) : async Result<Nat, Text>
```

### Withdraw
Withdraws tokens from treasury (requires authorization).

**Endpoint:** `treasury.withdraw`

**Parameters:**
```motoko
withdraw(
  recipient: Principal,
  amount: TokenAmount,
  description: Text,
  proposalId: ?ProposalId
) : async Result<Nat, Text>
```

### Get Balance
Retrieves treasury balance information.

**Endpoint:** `treasury.getBalance`

**Response:**
```javascript
{
  totalBalance: 100000,
  availableBalance: 75000,
  lockedBalance: 20000,
  reservedBalance: 5000
}
```

### Get Transaction History
Retrieves treasury transaction history.

**Endpoint:** `treasury.getTransactionHistory`

**Parameters:**
```motoko
getTransactionHistory(limit: ?Nat, offset: ?Nat) : async [TreasuryTransaction]
```

## Proposals API

### Submit Proposal
Submits a new proposal to the system.

**Endpoint:** `proposals.submitProposal`

**Parameters:**
```motoko
submitProposal(
  title: Text,
  description: Text,
  category: Text,
  executionPlan: ?Text
) : async Result<ProposalId, Text>
```

### Execute Proposal
Executes an approved proposal.

**Endpoint:** `proposals.executeProposal`

**Parameters:**
```motoko
executeProposal(proposalId: ProposalId) : async Result<(), Text>
```

## Assets API

### Transfer Tokens
Transfers tokens between accounts.

**Endpoint:** `assets.transfer`

**Parameters:**
```motoko
transfer(
  to: Principal,
  amount: TokenAmount
) : async Result<(), Text>
```

### Get Balance
Gets token balance for an account.

**Endpoint:** `assets.balanceOf`

**Parameters:**
```motoko
balanceOf(account: Principal) : async TokenAmount
```

## Error Handling

### Common Error Types

#### GovernanceError
```motoko
type GovernanceError = {
  #unauthorized;
  #proposalNotFound;
  #votingClosed;
  #alreadyVoted;
  #insufficientVotingPower;
  #invalidProposal;
};
```

#### StakingError
```motoko
type StakingError = {
  #unauthorized;
  #insufficientBalance;
  #stakeNotFound;
  #stakeLocked;
  #invalidAmount;
  #stakingDisabled;
};
```

#### TreasuryError
```motoko
type TreasuryError = {
  #unauthorized;
  #insufficientBalance;
  #invalidAmount;
  #transactionFailed;
};
```

### Error Response Format
```javascript
// Standard error response
{
  err: "Error message describing what went wrong"
}

// Typed error response
{
  err: { unauthorized: null }
}
```

## Type Definitions

### Core Types

#### UserProfile
```motoko
type UserProfile = {
  id: Principal;
  displayName: Text;
  bio: Text;
  joinedAt: Time;
  reputation: Nat;
  totalStaked: Nat;
  votingPower: Nat;
};
```

#### DAOConfig
```motoko
type DAOConfig = {
  category: Text;
  website: Text;
  selectedModules: [Text];
  moduleFeatures: [ModuleFeature];
  tokenName: Text;
  tokenSymbol: Text;
  totalSupply: Nat;
  initialPrice: Nat;
  votingPeriod: Nat;
  quorumThreshold: Nat;
  proposalThreshold: Nat;
  fundingGoal: Nat;
  fundingDuration: Nat;
  minInvestment: Nat;
  termsAccepted: Bool;
  kycRequired: Bool;
};
```

#### Proposal
```motoko
type Proposal = {
  id: ProposalId;
  proposer: Principal;
  title: Text;
  description: Text;
  proposalType: ProposalType;
  status: ProposalStatus;
  votesInFavor: Nat;
  votesAgainst: Nat;
  totalVotingPower: Nat;
  createdAt: Time;
  votingDeadline: Time;
  executionDeadline: ?Time;
  quorumThreshold: Nat;
  approvalThreshold: Nat;
};
```

### Enums

#### ProposalType
```motoko
type ProposalType = {
  #textProposal;
  #treasuryAllocation;
  #configurationChange;
  #membershipChange;
  #systemUpgrade;
};
```

#### ProposalStatus
```motoko
type ProposalStatus = {
  #draft;
  #active;
  #passed;
  #rejected;
  #executed;
  #cancelled;
  #expired;
};
```

#### VoteChoice
```motoko
type VoteChoice = {
  #inFavor;
  #against;
  #abstain;
};
```

## Rate Limits

- **Proposal Creation**: 1 per user per hour
- **Voting**: No limit (one vote per proposal per user)
- **Staking Operations**: 10 per user per minute
- **Treasury Operations**: 5 per user per minute

## Pagination

For endpoints returning lists, use these parameters:
- `limit`: Number of items to return (default: 50, max: 100)
- `offset`: Number of items to skip (default: 0)

## Webhooks

The system supports webhooks for real-time notifications:
- Proposal created
- Vote cast
- Proposal executed
- Stake created/unstaked
- Treasury transaction

Configure webhooks through the DAO settings interface.

## SDK Usage Examples

### JavaScript/TypeScript
```javascript
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from './declarations/dao_backend';

// Create agent
const agent = new HttpAgent({ host: 'http://localhost:4943' });
await agent.fetchRootKey(); // Only for local development

// Create actor
const daoBackend = Actor.createActor(idlFactory, {
  agent,
  canisterId: 'your-canister-id'
});

// Use the API
const result = await daoBackend.getUserProfile(principal);
```

### React Hook Example
```javascript
const useDAO = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const createProposal = async (title, description) => {
    setLoading(true);
    try {
      const result = await actors.governance.createProposal(
        title, 
        description, 
        { textProposal: null }, 
        null
      );
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return { createProposal, loading, error };
};
```

This API documentation provides comprehensive coverage of all endpoints and their usage patterns. For more detailed examples and integration guides, refer to the user guides documentation.
