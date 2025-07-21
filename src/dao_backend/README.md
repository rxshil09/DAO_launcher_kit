# DAO Platform Backend Canisters

This directory contains the backend canister modules for the DAO platform built on the Internet Computer Protocol (ICP).

## Architecture Overview

The backend consists of four main canister modules:

### 1. **Governance Canister** (`governance/main.mo`)
- **Purpose**: Manages proposal creation, voting, and execution
- **Key Features**:
  - Create and manage proposals
  - Vote casting with voting power calculation
  - Proposal execution based on governance rules
  - Configurable voting periods and thresholds
  - Support for different proposal types (text, treasury, parameter changes, membership)

### 2. **Treasury Canister** (`treasury/main.mo`)
- **Purpose**: Manages DAO treasury funds and transactions
- **Key Features**:
  - Deposit and withdrawal management
  - Token locking/unlocking for staking rewards
  - Transaction history and auditing
  - Multi-signature authorization support
  - Balance tracking (total, available, locked, reserved)

### 3. **Staking Canister** (`staking/main.mo`)
- **Purpose**: Handles token staking and reward distribution
- **Key Features**:
  - Multiple staking periods (flexible, 30d, 90d, 180d, 365d)
  - Automatic reward calculation based on staking period
  - Voting power calculation for governance
  - Stake extension and early withdrawal (with penalties)
  - Reward claiming for flexible staking

### 4. **Proposals Canister** (`proposals/main.mo`)
- **Purpose**: Advanced proposal management with templates and categorization
- **Key Features**:
  - Proposal templates for common proposal types
  - Batch voting capabilities
  - Proposal categorization and filtering
  - Trending proposals algorithm
  - Delegation support for voting
  - Rich proposal statistics

## Shared Types (`shared/types.mo`)

Contains common type definitions and utility functions used across all canisters:
- User and identity types
- Token and balance types
- Proposal and voting types
- Staking types
- Treasury types
- Error handling types
- Utility functions for calculations

## Key Features

### 🔐 **Security**
- Principal-based authentication
- Authorization checks for sensitive operations
- Stable storage for canister upgrades
- Input validation and error handling

### 📊 **Governance**
- Configurable voting parameters
- Multiple proposal types
- Quorum and approval thresholds
- Time-based voting periods
- Proposal execution automation

### 💰 **Treasury Management**
- Multi-signature support
- Transaction auditing
- Balance categorization
- Authorized principal management
- Integration with governance for fund transfers

### 🎯 **Staking System**
- Multiple lock periods with different APRs
- Voting power multipliers
- Flexible reward claiming
- Stake extension capabilities
- Comprehensive staking statistics

### 📋 **Proposal Templates**
- Pre-defined proposal types
- Required field validation
- Category-based organization
- Template management system
- Batch operations support

## APR Rates by Staking Period

| Period | APR | Voting Power Multiplier |
|--------|-----|------------------------|
| Flexible | 5% | 1.0x |
| 30 Days | 8% | 1.1x |
| 90 Days | 12% | 1.25x |
| 180 Days | 18% | 1.5x |
| 365 Days | 25% | 2.0x |

## Deployment

To deploy the canisters locally:

```bash
# Start local replica
dfx start --clean

# Deploy all canisters
dfx deploy

# Deploy individual canister
dfx deploy governance
dfx deploy treasury
dfx deploy staking
dfx deploy proposals
```

## Integration

The canisters are designed to work together:

1. **Staking → Governance**: Staked tokens provide voting power
2. **Governance → Treasury**: Approved proposals can trigger treasury transfers
3. **Treasury → Staking**: Treasury funds staking rewards
4. **Proposals → Governance**: Advanced proposal management feeds into governance

## Error Handling

Each canister implements comprehensive error handling with specific error types:
- `CommonError`: General errors (not authorized, not found, etc.)
- `GovernanceError`: Governance-specific errors
- `StakingError`: Staking-specific errors  
- `TreasuryError`: Treasury-specific errors

## Upgrade Safety

All canisters implement stable storage patterns to ensure data persistence across upgrades:
- `preupgrade`: Saves state to stable variables
- `postupgrade`: Restores state from stable variables
- Stable variable declarations for critical data

## Future Enhancements

- Integration with ICP ledger canister
- Cross-canister calls for automated operations
- Advanced delegation mechanisms
- Proposal scheduling and automation
- Multi-DAO support
- Analytics and reporting features