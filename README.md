# `Dao Launcher Kit`
Welcome to  our Dao Launcher Kit Platform - DAOVerse. 
Here you can create and deploy your very own DAO on ICP.


## Running the project locally

If you want to test your project locally, you can use the following commands:

```bash
dfx start --clean --background

# Deploys your canisters to the replica and generates your candid interface
dfx deploy
```

To stop the canisters, use the following command
```bash
dfx stop
```

If you've updated your backend canister, you can regenerate the Candid interface by running:

```bash
npm run generate
```

at any time. This is recommended before starting the frontend development server, and will be run automatically any time you run `dfx deploy`.

If you are making frontend changes, you can start a development server with the following command and the server will will start at `http://localhost:8080`, proxying API requests to the replica at port 4943.

```bash
npm run dev
```

We have made the canisters in Motoko for simplicity!
<br>

# Module Registry Canister for DAO Governance
The Module Registry Canister is a core component in modular DAO architecture, responsible for managing and governing DAO modules (such as voting, treasury, staking, or analytics). It serves as a decentralized registry where modules can be registered, upgraded, deprecated, or replaced through transparent governance proposals.

🛠 Key Functions
- Module Registration: Add new modules with metadata (name, type, version, canister ID).

- Governance Hooks: Allow DAO members to propose changes to modules and vote on upgrades.

- Version Control: Track module versions and support safe upgrades and rollbacks.

- Access Control: Ensure only authorized entities or DAO decisions can modify the registry.

This canister ensures plug-and-play flexibility, allowing a DAO to evolve its functionality without compromising core integrity. It lays the foundation for a sustainable, upgradable, and community-driven governance framework.

<br>

# 🗳️ Governance Canister for DAO Module Management

This canister handles decentralized governance for managing and evolving modular components of a DAO, such as treasury, staking, and voting modules. It enables transparent proposal creation, voting, and module upgrades via community consensus.

## 🔧 Key Features

- **Proposal System**: Members can propose upgrades or additions to DAO modules.
- **Voting Mechanism**: Weighted or 1-person-1-vote style voting on proposals.
- **Module Registry**: Tracks registered modules with metadata, versions, and canister IDs.
- **Execution Logic**: Applies approved proposals to upgrade or register modules.

## 📝 Interface Summary (Candid)

```candid
service : {
  propose_module_change : (ModuleProposal) -> (nat);

  vote_on_proposal : (nat, principal, variant { yes; no }) -> (variant { ok : text; err : text });

  execute_proposal : (nat) -> (variant { ok : text; err : text });

  get_module : (text) -> (opt ModuleInfo) query;

  list_modules : () -> (vec ModuleInfo) query;

  list_proposals : () -> (vec Proposal) query;
}
```

## 🔌 Integration Protocol

The Governance Canister exposes Candid interfaces that other canisters or frontend clients can interact with using HTTP or cross-canister calls.

#### __🧩 Cross-Canister Integration (Rust → Rust)__

Use `ic_cdk::call` to invoke governance functions from other Rust-based canisters:

[📦 Frontend Integration (TypeScript)](#code-section)

```rust
use ic_cdk::call;
let (result,): (Result<String, String>,) = call(
    governance_canister_id,
    "propose_module_change",
    (proposal_payload,),
).await?;
});
```

#### __🌐 Frontend Integration (@dfinity/agent)__
From a JavaScript/TypeScript frontend, connect using the Candid interface:

```
const result = await governanceActor.propose_module_change({
  proposer: myPrincipal,
  target_module: "Staking",
  new_version: 1n,
  new_canister: Principal.fromText("aaaaa-aa"),
  metadata_hash: [],
});
```

Use dfx canister call for manual interaction:
```
dfx canister call governance_canister propose_module_change '(record { ... })'
```

## 📚 Purpose
Designed for flexible, upgradeable, and community-controlled DAO infrastructure on the Internet Computer (ICP). Supports plug-and-play module architecture with full transparency and version control.

<br>

# 💰 Treasury Canister for DAO Fund Management

This canister manages treasury operations for a DAO, including receiving contributions, tracking balances, and processing approved disbursements. It integrates with the Governance Canister to ensure all spending is proposal-driven and transparent.

## 🔧 Key Features

- **Fund Reception**: Accepts contributions from DAO members or external users.
- **Balance Tracking**: Maintains treasury balance in cycles or tokens.
- **Disbursement Control**: Releases funds only upon approved governance proposals.
- **Auditability**: Exposes full transaction history for transparency.

## 📝 Interface Summary (Candid)

```candid
service : {
  deposit : () -> (variant { ok : text; err : text });
  
  get_balance : () -> (nat) query;

  request_funds : (principal, nat, text) -> (variant { ok : text; err : text });

  execute_transfer : (principal, nat) -> (variant { ok : text; err : text });

  get_transaction_log : () -> (vec record { principal; nat; text }) query;
}
```

## 🔌 Integration Protocol
The Treasury Canister exposes Candid interfaces for securely managing DAO funds. It supports contributions, disbursements, and audit logs accessible via frontend or cross-canister calls.

#### __🧩 Cross-Canister Integration (Rust → Rust)__

Use `ic_cdk::call` to request or transfer funds from other Rust-based canisters:

```rust
use ic_cdk::call;
let (result,): (Result <String, String>, ) = call(
    treasury_canister_id,
    "execute_transfer",
    (recipient_principal, amount),
).await?;
```

#### __🌐 Frontend Integration (@dfinity/agent)__
From a JavaScript/TypeScript frontend, interact with the canister as follows:

```
const result = await treasuryActor.execute_transfer(
  Principal.fromText("aaaaa-aa"),
  100_000_000n // amount in token units or cycles
);
```

Use dfx canister call for quick CLI testing:

```sql
dfx canister call treasury_canister execute_transfer '(principal "aaaaa-aa", 100000000)'
```

## 📚 Purpose
Ensures DAO funds are handled securely and only spent through governance-approved workflows, maintaining transparency and accountability in decentralized operations.

<br>

# 🔒 Staking Canister for DAO Participation and Rewards

This canister manages staking operations within the DAO, allowing users to stake tokens, earn rewards, and participate in governance. It ensures that only active stakers can vote and enables fair reward distribution.

## 🔧 Key Features

- **Token Staking**: Members can lock tokens to gain voting rights.
- **Reward Distribution**: Periodic rewards based on staked amount and duration.
- **Unstaking Mechanism**: Allows safe withdrawal after a cooldown period.
- **Governance Integration**: Validates voter eligibility for proposals.

## 📝 Interface Summary (Candid)

```candid
service : {
  stake : (nat) -> (variant { ok : text; err : text });
  
  unstake : (nat) -> (variant { ok : text; err : text });

  get_stake : (principal) -> (opt nat) query;

  distribute_rewards : () -> (variant { ok : text; err : text });

  list_stakers : () -> (vec record { principal; staked : nat }) query;
}
```

## 🔌 Integration Protocol

The Staking Canister exposes Candid interfaces for locking tokens, managing rewards, and enabling DAO participation. It allows access via frontend calls or Rust-based canister logic.

#### __🧩 Cross-Canister Integration (Rust → Rust)__

Use `ic_cdk::call` to allow other canisters to stake, unstake, or query stake status:

```rust
use ic_cdk::call;
let (result,): (Result<String, String>,) = call(
    staking_canister_id,
    "stake",
    (amount,),
).await?;
```

#### __🌐 Frontend Integration (@dfinity/agent)__

From a JavaScript/TypeScript frontend, stake tokens like this:

```
const result = await stakingActor.stake(
  500_000_000n // amount in token units
);
```
Use dfx canister call to manually test interactions:
```
dfx canister call staking_canister stake '(500000000)'
```

## 📚 Purpose
Empowers decentralized participation by incentivizing long-term engagement and enabling weighted voting, while keeping the staking process transparent and tamper-proof.

<br>

# 📄 Proposals Canister for DAO Decision Making

This canister handles the lifecycle of proposals within the DAO, allowing members to submit ideas, discuss them, and track voting outcomes. It ensures transparency and traceability in DAO governance.

## 🔧 Key Features

- **Proposal Submission**: DAO members can submit proposals for changes or actions.
- **Status Tracking**: Maintains the state of each proposal (e.g., open, accepted, rejected).
- **Metadata Storage**: Stores descriptions, timestamps, and proposer details.
- **Governance Sync**: Interfaces with Governance and Staking to validate and route decisions.

## 📝 Interface Summary (Candid)

```candid
service : {
  submit_proposal : (ProposalInput) -> (variant { ok : nat; err : text });

  get_proposal : (nat) -> (opt Proposal) query;

  list_proposals : () -> (vec Proposal) query;

  update_proposal_status : (nat, ProposalStatus) -> (variant { ok : text; err : text });

  get_open_proposals : () -> (vec Proposal) query;
}
```

## 🔌 Integration Protocol
The Proposal Canister provides interfaces for submitting, tracking, and managing governance proposals. It can be accessed from other canisters or frontend apps to coordinate DAO decision-making.

#### __🧩 Cross-Canister Integration (Rust → Rust)__

Use `ic_cdk::call` to submit or update proposals from other Rust-based canisters:

```rust
use ic_cdk::call;
let (result,): (Result<nat, String>,) = call(
    proposal_canister_id,
    "submit_proposal",
    (proposal_input,),
).await?;
```
#### __🌐 Frontend Integration (@dfinity/agent)__
From a JavaScript/TypeScript frontend, submit a proposal like this:
```
const result = await proposalActor.submit_proposal({
  title: "Add new voting module",
  description: "Proposal to integrate advanced voting strategy",
  proposer: myPrincipal,
  timestamp: BigInt(Date.now())
});
``` 
Use dfx canister call to manually test proposal submission:
```
dfx canister call proposal_canister submit_proposal '(record { title = "Upgrade"; description = "Add new module"; proposer = principal "aaaaa-aa"; timestamp = 1718069400000 })'
```

## 📚 Purpose
Drives decentralized governance by giving the community a structured and transparent way to propose, track, and influence decisions within the DAO.


## 🌐 What is IPFS?

[IPFS (InterPlanetary File System)](https://ipfs.tech/) is a decentralized, peer-to-peer file storage protocol designed to make the web more distributed and resilient. Instead of relying on centralized servers, IPFS stores files across a global network of nodes.

### 🔧 Key Benefits

- **Content Addressing**: Files are accessed via their cryptographic hash, ensuring immutability and integrity.
- **Decentralization**: Eliminates single points of failure by distributing data.
- **Efficient Delivery**: Supports deduplication and caching, improving performance and reducing bandwidth.
- **Permanent Storage**: Ideal for storing static assets, metadata, and off-chain content in blockchain or DAO ecosystems.

### 📦 Use Case in DAO

In the context of a DAO, IPFS can be used to store module metadata, proposal documents, or governance records off-chain, while referencing them on-chain via their hash.


## IPFS vs ICP Asset Canister

| Feature              | IPFS                                 | ICP Asset Canister                        |
|----------------------|---------------------------------------|--------------------------------------------|
| 🛠 Type              | Decentralized file system             | Smart contract canister on Internet Computer |
| 📡 Hosting Model    | Peer-to-peer network of nodes         | Hosted on the Internet Computer (ICP)       |
| 🧾 File Access      | Content hash (CID)                    | URL-based or via canister methods           |
| 🔐 Integrity        | Guaranteed via cryptographic hash     | Guaranteed by ICP’s consensus & WebAssembly sandbox |
| 💡 Use Case         | Off-chain storage (metadata, media)   | On-chain storage for static frontend assets |
| 🧩 DAO Integration  | Ideal for metadata or proposal docs   | Ideal for hosting UIs or serving frontend dApps |

### ✅ Summary

- **Use IPFS** to store large, off-chain files or metadata that can be referenced from proposals or modules.
- **Use ICP Asset Canister** to host and serve static websites, dApp frontends, or on-chain assets within the Internet Computer ecosystem.
