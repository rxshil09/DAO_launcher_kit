import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Float "mo:base/Float";
import Int "mo:base/Int";

module {
    // Common types used across all modules
    public type Result<T, E> = Result.Result<T, E>;
    public type Time = Time.Time;
    public type Principal = Principal.Principal;

    // User and Identity types
    public type UserId = Principal;
    
    public type UserProfile = {
        id: UserId;
        displayName: Text;
        bio: Text;
        joinedAt: Time;
        reputation: Nat;
        totalStaked: Nat;
        votingPower: Nat;
    };

    // Token and Balance types
    public type TokenAmount = Nat;
    public type Balance = Nat;
    
    public type TokenTransfer = {
        from: Principal;
        to: Principal;
        amount: TokenAmount;
        timestamp: Time;
        memo: ?Text;
    };

    // Proposal types
    public type ProposalId = Nat;
    public type ProposalStatus = {
        #pending;
        #active;
        #succeeded;
        #failed;
        #executed;
        #cancelled;
    };

    public type ProposalType = {
        #textProposal: Text;
        #treasuryTransfer: TreasuryTransferProposal;
        #parameterChange: ParameterChangeProposal;
        #membershipChange: MembershipChangeProposal;
    };

    public type TreasuryTransferProposal = {
        recipient: Principal;
        amount: TokenAmount;
        reason: Text;
    };

    public type ParameterChangeProposal = {
        parameter: Text;
        newValue: Text;
        oldValue: Text;
    };

    public type MembershipChangeProposal = {
        member: Principal;
        action: { #add; #remove };
        role: Text;
    };

    public type Proposal = {
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
        approvalThreshold: Nat; // Percentage (0-100)
    };

    // Voting types
    public type VoteChoice = { #inFavor; #against; #abstain };
    
    public type Vote = {
        voter: Principal;
        proposalId: ProposalId;
        choice: VoteChoice;
        votingPower: Nat;
        timestamp: Time;
        reason: ?Text;
    };

    // Staking types
    public type StakeId = Nat;
    
    public type StakingPeriod = {
        #instant;
        #locked30;
        #locked90;
        #locked180;
        #locked365;
    };

    public type Stake = {
        id: StakeId;
        staker: Principal;
        amount: TokenAmount;
        stakingPeriod: StakingPeriod;
        stakedAt: Time;
        unlocksAt: ?Time;
        rewards: TokenAmount;
        isActive: Bool;
    };

    public type StakingRewards = {
        totalRewards: TokenAmount;
        claimableRewards: TokenAmount;
        lastClaimedAt: ?Time;
        apr: Float; // Annual Percentage Rate
    };

    // Treasury types
    public type TreasuryBalance = {
        total: TokenAmount;
        available: TokenAmount;
        locked: TokenAmount;
        reserved: TokenAmount;
    };

    public type TreasuryTransaction = {
        id: Nat;
        transactionType: TreasuryTransactionType;
        amount: TokenAmount;
        from: ?Principal;
        to: ?Principal;
        timestamp: Time;
        proposalId: ?ProposalId;
        description: Text;
        status: { #pending; #completed; #failed };
    };

    public type TreasuryTransactionType = {
        #deposit;
        #withdrawal;
        #proposalExecution;
        #stakingReward;
        #fee;
    };

    // Governance types
    public type GovernanceConfig = {
        votingPeriod: Nat; // Duration in nanoseconds
        quorumThreshold: Nat; // Minimum voting power required
        approvalThreshold: Nat; // Percentage needed to pass (0-100)
        proposalDeposit: TokenAmount; // Required deposit to create proposal
        maxProposalsPerUser: Nat; // Max active proposals per user
    };

    public type DAOStats = {
        totalMembers: Nat;
        totalProposals: Nat;
        activeProposals: Nat;
        totalStaked: TokenAmount;
        treasuryBalance: TokenAmount;
        totalVotingPower: Nat;
    };

    // Error types
    public type CommonError = {
        #notAuthorized;
        #notFound;
        #invalidInput;
        #insufficientBalance;
        #alreadyExists;
        #operationFailed: Text;
        #temporarilyUnavailable;
    };

    public type GovernanceError = {
        #proposalNotFound;
        #proposalNotActive;
        #alreadyVoted;
        #votingPeriodEnded;
        #insufficientVotingPower;
        #quorumNotMet;
        #proposalAlreadyExecuted;
    };

    public type StakingError = {
        #stakeNotFound;
        #stakeLocked;
        #insufficientStake;
        #invalidStakingPeriod;
        #rewardsNotAvailable;
    };

    public type TreasuryError = {
        #insufficientFunds;
        #transferFailed;
        #unauthorizedAccess;
        #invalidRecipient;
    };

    // Utility functions
    public func isExpired(deadline: Time) : Bool {
        Time.now() > deadline
    };

    public func calculateVotingPower(stakedAmount: TokenAmount, stakingPeriod: StakingPeriod) : Nat {
        let multiplier = switch (stakingPeriod) {
            case (#instant) 1.0;
            case (#locked30) 1.1;
            case (#locked90) 1.25;
            case (#locked180) 1.5;
            case (#locked365) 2.0;
        };
        
        let power = Float.fromInt(stakedAmount) * multiplier;
        Int.abs(Float.toInt(power))
    };

    public func calculateStakingRewards(amount: TokenAmount, period: StakingPeriod, duration: Nat) : TokenAmount {
        let baseAPR = switch (period) {
            case (#instant) 0.05; // 5% APR
            case (#locked30) 0.08; // 8% APR
            case (#locked90) 0.12; // 12% APR
            case (#locked180) 0.18; // 18% APR
            case (#locked365) 0.25; // 25% APR
        };
        
        let yearInNanoseconds = 365 * 24 * 60 * 60 * 1_000_000_000;
        let rewardRate = baseAPR * Float.fromInt(duration) / Float.fromInt(yearInNanoseconds);
        let rewards = Float.fromInt(amount) * rewardRate;
        
        Int.abs(Float.toInt(rewards))
    };
}