import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Buffer "mo:base/Buffer";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Nat32 "mo:base/Nat32";

import Types "../shared/types";

actor GovernanceCanister {
    type Result<T, E> = Result.Result<T, E>;
    type Proposal = Types.Proposal;
    type Vote = Types.Vote;
    type ProposalId = Types.ProposalId;
    type GovernanceConfig = Types.GovernanceConfig;
    type GovernanceError = Types.GovernanceError;
    type CommonError = Types.CommonError;

    // References to other canisters
    var dao : actor {
        getUserProfile: shared query (Principal) -> async ?Types.UserProfile;
    } = actor("canister:dao_backend");

    var staking : actor {
        getUserStakingSummary: shared query (Principal) -> async {
            totalStaked: Nat;
            totalRewards: Nat;
            activeStakes: Nat;
            totalVotingPower: Nat;
        };
    } = actor("canister:staking");

    // Stable storage for upgrades
    private stable var nextProposalId : Nat = 1;
    private stable var proposalsEntries : [(ProposalId, Proposal)] = [];
    private stable var votesEntries : [(Text, Vote)] = []; // Key: proposalId_voter
    private stable var configEntries : [(Text, GovernanceConfig)] = [];

    // Runtime storage
    private var proposals = HashMap.HashMap<ProposalId, Proposal>(10, Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n) });
    private var votes = HashMap.HashMap<Text, Vote>(100, Text.equal, Text.hash);
    private var config = HashMap.HashMap<Text, GovernanceConfig>(1, Text.equal, Text.hash);

 public shared(_msg) func init(daoId: Principal, stakingId: Principal) {
    Debug.print("Starting initialization...");
    
    // Convert principals to text for debug
    let daoText = Principal.toText(daoId);
    let stakingText = Principal.toText(stakingId);
    
    Debug.print("DAO ID (text): " # daoText);
    Debug.print("Staking ID (text): " # stakingText);
    
    try {
        dao := actor(daoText);
        staking := actor(stakingText);
        Debug.print("Actor references updated successfully");
    } catch (e) {
        Debug.print("Error during actor creation: " # debug_show(e));
        throw e;
    };
    
    Debug.print("Initialization complete");
};

    // Initialize default configuration
    private func initializeConfig() {
        let defaultConfig : GovernanceConfig = {
            votingPeriod = 7 * 24 * 60 * 60 * 1_000_000_000; // 7 days in nanoseconds
            quorumThreshold = 1000; // Minimum 1000 voting power
            approvalThreshold = 51; // 51% approval needed
            proposalDeposit = 100; // 100 tokens required
            maxProposalsPerUser = 3; // Max 3 active proposals per user
        };
        config.put("default", defaultConfig);
    };

    // System functions for upgrades
    system func preupgrade() {
        proposalsEntries := Iter.toArray(proposals.entries());
        votesEntries := Iter.toArray(votes.entries());
        configEntries := Iter.toArray(config.entries());
    };

    system func postupgrade() {
        proposals := HashMap.fromIter<ProposalId, Proposal>(
            proposalsEntries.vals(), 
            proposalsEntries.size(), 
            Nat.equal, 
            func(n: Nat) : Nat32 { Nat32.fromNat(n) }
        );
        votes := HashMap.fromIter<Text, Vote>(
            votesEntries.vals(), 
            votesEntries.size(), 
            Text.equal, 
            Text.hash
        );
        config := HashMap.fromIter<Text, GovernanceConfig>(
            configEntries.vals(), 
            configEntries.size(), 
            Text.equal, 
            Text.hash
        );
        
        if (config.size() == 0) {
            initializeConfig();
        };
    };

    // Initialize on first deployment
    if (config.size() == 0) {
        initializeConfig();
    };

    // Public functions

    // Create a new proposal
    public shared(msg) func createProposal(
        title: Text,
        description: Text,
        proposalType: Types.ProposalType,
        votingPeriod: ?Nat
    ) : async Result<ProposalId, Text> {
        let caller = msg.caller;
        
        // Check if user has too many active proposals
        let activeProposals = getActiveProposalsByUser(caller);
        let currentConfig = switch (config.get("default")) {
            case (?c) c;
            case null return #err("Configuration not found");
        };
        
        if (Array.size(activeProposals) >= currentConfig.maxProposalsPerUser) {
            return #err("Maximum active proposals limit reached");
        };

        let proposalId = nextProposalId;
        nextProposalId += 1;

        let period = switch (votingPeriod) {
            case (?p) p;
            case null currentConfig.votingPeriod;
        };

        let proposal : Proposal = {
            id = proposalId;
            proposer = caller;
            title = title;
            description = description;
            proposalType = proposalType;
            status = #active;
            votesInFavor = 0;
            votesAgainst = 0;
            totalVotingPower = 0;
            createdAt = Time.now();
            votingDeadline = Time.now() + period;
            executionDeadline = ?(Time.now() + period + (24 * 60 * 60 * 1_000_000_000)); // 1 day after voting
            quorumThreshold = currentConfig.quorumThreshold;
            approvalThreshold = currentConfig.approvalThreshold;
        };

        proposals.put(proposalId, proposal);
        #ok(proposalId)
    };

    // Cast a vote on a proposal
    public shared(msg) func vote(
        proposalId: ProposalId,
        choice: Types.VoteChoice,
        reason: ?Text
    ) : async Result<(), Text> {
        let caller = msg.caller;
        let voteKey = Nat.toText(proposalId) # "_" # Principal.toText(caller);

        // Check if already voted
        switch (votes.get(voteKey)) {
            case (?_) return #err("Already voted on this proposal");
            case null {};
        };

        // Get proposal
        let proposal = switch (proposals.get(proposalId)) {
            case (?p) p;
            case null return #err("Proposal not found");
        };

        // Check if proposal is active and not expired
        if (proposal.status != #active) {
            return #err("Proposal is not active");
        };

        if (Time.now() > proposal.votingDeadline) {
            return #err("Voting period has ended");
        };

        // Verify voter registration
        let profileOpt = await dao.getUserProfile(caller);
        switch (profileOpt) {
            case null return #err("User not registered");
            case (?_) {};
        };

        // Determine voting power from staking data
        let summary = await staking.getUserStakingSummary(caller);
        let votingPower = summary.totalVotingPower;
        if (votingPower == 0) {
            return #err("No voting power");
        };

        // Create vote record
        let vote : Vote = {
            voter = caller;
            proposalId = proposalId;
            choice = choice;
            votingPower = votingPower;
            timestamp = Time.now();
            reason = reason;
        };

        votes.put(voteKey, vote);

        // Update proposal vote counts
        let updatedProposal = switch (choice) {
            case (#inFavor) {
                {
                    id = proposal.id;
                    proposer = proposal.proposer;
                    title = proposal.title;
                    description = proposal.description;
                    proposalType = proposal.proposalType;
                    status = proposal.status;
                    votesInFavor = proposal.votesInFavor + votingPower;
                    votesAgainst = proposal.votesAgainst;
                    totalVotingPower = proposal.totalVotingPower + votingPower;
                    createdAt = proposal.createdAt;
                    votingDeadline = proposal.votingDeadline;
                    executionDeadline = proposal.executionDeadline;
                    quorumThreshold = proposal.quorumThreshold;
                    approvalThreshold = proposal.approvalThreshold;
                }
            };
            case (#against) {
                {
                    id = proposal.id;
                    proposer = proposal.proposer;
                    title = proposal.title;
                    description = proposal.description;
                    proposalType = proposal.proposalType;
                    status = proposal.status;
                    votesInFavor = proposal.votesInFavor;
                    votesAgainst = proposal.votesAgainst + votingPower;
                    totalVotingPower = proposal.totalVotingPower + votingPower;
                    createdAt = proposal.createdAt;
                    votingDeadline = proposal.votingDeadline;
                    executionDeadline = proposal.executionDeadline;
                    quorumThreshold = proposal.quorumThreshold;
                    approvalThreshold = proposal.approvalThreshold;
                }
            };
            case (#abstain) {
                {
                    id = proposal.id;
                    proposer = proposal.proposer;
                    title = proposal.title;
                    description = proposal.description;
                    proposalType = proposal.proposalType;
                    status = proposal.status;
                    votesInFavor = proposal.votesInFavor;
                    votesAgainst = proposal.votesAgainst;
                    totalVotingPower = proposal.totalVotingPower + votingPower;
                    createdAt = proposal.createdAt;
                    votingDeadline = proposal.votingDeadline;
                    executionDeadline = proposal.executionDeadline;
                    quorumThreshold = proposal.quorumThreshold;
                    approvalThreshold = proposal.approvalThreshold;
                }
            };
        };

        proposals.put(proposalId, updatedProposal);
        #ok()
    };

    // Execute a proposal
    public shared(_msg) func executeProposal(proposalId: ProposalId) : async Result<(), Text> {
        let proposal = switch (proposals.get(proposalId)) {
            case (?p) p;
            case null return #err("Proposal not found");
        };

        // Check if proposal can be executed
        if (proposal.status != #active) {
            return #err("Proposal is not active");
        };

        if (Time.now() <= proposal.votingDeadline) {
            return #err("Voting period has not ended");
        };

        // Check quorum
        if (proposal.totalVotingPower < proposal.quorumThreshold) {
            let failedProposal = {
                id = proposal.id;
                proposer = proposal.proposer;
                title = proposal.title;
                description = proposal.description;
                proposalType = proposal.proposalType;
                status = #failed;
                votesInFavor = proposal.votesInFavor;
                votesAgainst = proposal.votesAgainst;
                totalVotingPower = proposal.totalVotingPower;
                createdAt = proposal.createdAt;
                votingDeadline = proposal.votingDeadline;
                executionDeadline = proposal.executionDeadline;
                quorumThreshold = proposal.quorumThreshold;
                approvalThreshold = proposal.approvalThreshold;
            };
            proposals.put(proposalId, failedProposal);
            return #err("Quorum not met");
        };

        // Check approval threshold
        let approvalRate = if (proposal.totalVotingPower > 0) {
            (proposal.votesInFavor * 100) / proposal.totalVotingPower
        } else { 0 };

        let newStatus = if (approvalRate >= proposal.approvalThreshold) {
            #succeeded
        } else {
            #failed
        };

        let updatedProposal = {
            id = proposal.id;
            proposer = proposal.proposer;
            title = proposal.title;
            description = proposal.description;
            proposalType = proposal.proposalType;
            status = newStatus;
            votesInFavor = proposal.votesInFavor;
            votesAgainst = proposal.votesAgainst;
            totalVotingPower = proposal.totalVotingPower;
            createdAt = proposal.createdAt;
            votingDeadline = proposal.votingDeadline;
            executionDeadline = proposal.executionDeadline;
            quorumThreshold = proposal.quorumThreshold;
            approvalThreshold = proposal.approvalThreshold;
        };
        proposals.put(proposalId, updatedProposal);

        if (newStatus == #succeeded) {
            // Here you would implement the actual execution logic
            // For now, we just mark it as executed
            let executedProposal = {
                id = updatedProposal.id;
                proposer = updatedProposal.proposer;
                title = updatedProposal.title;
                description = updatedProposal.description;
                proposalType = updatedProposal.proposalType;
                status = #executed;
                votesInFavor = updatedProposal.votesInFavor;
                votesAgainst = updatedProposal.votesAgainst;
                totalVotingPower = updatedProposal.totalVotingPower;
                createdAt = updatedProposal.createdAt;
                votingDeadline = updatedProposal.votingDeadline;
                executionDeadline = updatedProposal.executionDeadline;
                quorumThreshold = updatedProposal.quorumThreshold;
                approvalThreshold = updatedProposal.approvalThreshold;
            };
            proposals.put(proposalId, executedProposal);
        };

        #ok()
    };

    // Query functions

    // Get proposal by ID
    public query func getProposal(proposalId: ProposalId) : async ?Proposal {
        proposals.get(proposalId)
    };

    // Get all proposals
    public query func getAllProposals() : async [Proposal] {
        Iter.toArray(proposals.vals())
    };

    // Get active proposals
    public query func getActiveProposals() : async [Proposal] {
        let activeProposals = Buffer.Buffer<Proposal>(0);
        for (proposal in proposals.vals()) {
            if (proposal.status == #active and Time.now() <= proposal.votingDeadline) {
                activeProposals.add(proposal);
            };
        };
        Buffer.toArray(activeProposals)
    };

    // Get proposals by status
    public query func getProposalsByStatus(status: Types.ProposalStatus) : async [Proposal] {
        let filteredProposals = Buffer.Buffer<Proposal>(0);
        for (proposal in proposals.vals()) {
            if (proposal.status == status) {
                filteredProposals.add(proposal);
            };
        };
        Buffer.toArray(filteredProposals)
    };

    // Get user's vote on a proposal
    public query func getUserVote(proposalId: ProposalId, user: Principal) : async ?Vote {
        let voteKey = Nat.toText(proposalId) # "_" # Principal.toText(user);
        votes.get(voteKey)
    };

    // Get all votes for a proposal
    public query func getProposalVotes(proposalId: ProposalId) : async [Vote] {
        let proposalVotes = Buffer.Buffer<Vote>(0);
        for (vote in votes.vals()) {
            if (vote.proposalId == proposalId) {
                proposalVotes.add(vote);
            };
        };
        Buffer.toArray(proposalVotes)
    };

    // Get governance configuration
    public query func getConfig() : async ?GovernanceConfig {
        config.get("default")
    };

    // Update governance configuration (admin only)
    public shared(_msg) func updateConfig(newConfig: GovernanceConfig) : async Result<(), Text> {
        // In a real implementation, you'd check if the caller is an admin
        config.put("default", newConfig);
        #ok()
    };

    // Helper functions
    private func getActiveProposalsByUser(user: Principal) : [Proposal] {
        let userProposals = Buffer.Buffer<Proposal>(0);
        for (proposal in proposals.vals()) {
            if (proposal.proposer == user and proposal.status == #active) {
                userProposals.add(proposal);
            };
        };
        Buffer.toArray(userProposals)
    };

    // Get governance statistics
    public query func getGovernanceStats() : async {
        totalProposals: Nat;
        activeProposals: Nat;
        succeededProposals: Nat;
        failedProposals: Nat;
        totalVotes: Nat;
    } {
        var activeCount = 0;
        var succeededCount = 0;
        var failedCount = 0;

        for (proposal in proposals.vals()) {
            switch (proposal.status) {
                case (#active) activeCount += 1;
                case (#succeeded) succeededCount += 1;
                case (#executed) succeededCount += 1;
                case (#failed) failedCount += 1;
                case (_) {};
            };
        };

        {
            totalProposals = proposals.size();
            activeProposals = activeCount;
            succeededProposals = succeededCount;
            failedProposals = failedCount;
            totalVotes = votes.size();
        }
    };
}