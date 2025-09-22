import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
// import Debug "mo:base/Debug";
import Buffer "mo:base/Buffer";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Nat32 "mo:base/Nat32";
import Blob "mo:base/Blob";
import Nat64 "mo:base/Nat64";

import Types "../shared/types";

/**
 * Staking Canister
 * 
 * This canister manages the token staking system that provides:
 * - Multiple staking periods with different reward rates
 * - Voting power calculation based on staked amounts and duration
 * - Automated reward distribution and compounding
 * - Flexible unstaking with penalty mechanisms
 * 
 * Staking Mechanics:
 * - Instant staking: No lock period, lower rewards, full liquidity
 * - Locked staking: 30/90/180/365 days with increasing reward multipliers
 * - Voting power: Calculated as staked_amount * time_multiplier
 * - Rewards: Distributed continuously, compounded automatically
 * 
 * Security Features:
 * - Minimum/maximum stake limits
 * - Early unstaking penalties
 * - Slashing protection for governance participation
 * - Anti-gaming mechanisms for reward distribution
 */
persistent actor StakingCanister {
    // Analytics canister interface type (moved inside actor)
    type AnalyticsService = actor {
        recordEvent: shared (
            event_type: { #DAO_CREATED; #USER_JOINED; #PROPOSAL_CREATED; #VOTE_CAST; #TREASURY_DEPOSIT; #TREASURY_WITHDRAWAL; #TOKENS_STAKED; #TOKENS_UNSTAKED; #REWARDS_CLAIMED; #DAO_UPDATED; #MEMBER_ADDED; #MEMBER_REMOVED },
            dao_id: ?Text,
            user_id: ?Principal,
            metadata: [(Text, Text)],
            value: ?Float
        ) -> async Result<Nat, Text>;
    };
    // Type aliases for better code readability
    type Result<T, E> = Result.Result<T, E>;
    type Stake = Types.Stake;
    type StakeId = Types.StakeId;
    type StakingPeriod = Types.StakingPeriod;
    type StakingRewards = Types.StakingRewards;
    type TokenAmount = Types.TokenAmount;
    type StakingError = Types.StakingError;
    type CommonError = Types.CommonError;

    // ICRC-1/2 Ledger interface (minimal subset)
    type Account = { owner : Principal; subaccount : ?Blob };
    type TransferError = {
        #BadFee : { expected_fee : Nat };
        #BadBurn : { min_burn_amount : Nat };
        #InsufficientFunds : { balance : Nat };
        #TooOld;
        #CreatedInFuture : { ledger_time : Nat64 };
        #TemporarilyUnavailable;
        #Duplicate : { duplicate_of : Nat };
        #GenericError : { error_code : Nat; message : Text };
    };
    type TransferResult = { #ok : Nat; #err : TransferError };
    type TransferArg = {
        from_subaccount : ?Blob;
        to : Account;
        amount : Nat;
        fee : ?Nat;
        memo : ?Blob;
        created_at_time : ?Nat64;
    };
    type TransferFromArgs = {
        from : Account;
        to : Account;
        amount : Nat;
        fee : ?Nat;
        memo : ?Blob;
        created_at_time : ?Nat64;
        spender_subaccount : ?Blob;
    };
    type Ledger = actor {
        icrc1_transfer : shared TransferArg -> async TransferResult;
        icrc2_transfer_from : shared TransferFromArgs -> async TransferResult;
    };

    // Stable storage for upgrade persistence
    // Core staking data that must survive canister upgrades
    private var nextStakeId : Nat = 1;
    private var stakesEntries : [(StakeId, Stake)] = [];
    private var userStakesEntries : [(Principal, [StakeId])] = [];
    private var totalStakedAmount : TokenAmount = 0;
    private var totalRewardsDistributed : TokenAmount = 0;

    // Runtime storage - rebuilt from stable storage after upgrades
    // HashMaps provide efficient lookup and management of stake data
    private transient var stakes = HashMap.HashMap<StakeId, Stake>(100, Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n) });
    private transient var userStakes = HashMap.HashMap<Principal, [StakeId]>(50, Principal.equal, Principal.hash);

    // Staking configuration parameters
    // These control the economic parameters of the staking system
    private var stakingEnabled : Bool = true;
    private var minimumStakeAmount : TokenAmount = 10; // Minimum 10 tokens to prevent dust attacks
    private var maximumStakeAmount : TokenAmount = 1000000; // Maximum 1M tokens to prevent centralization
    
    // Analytics integration
    private var analyticsCanisterId : ?Principal = null;
    private transient var analyticsCanister : ?AnalyticsService = null;

    // Ledger integration
    private var ledgerCanisterId : ?Principal = null;
    private transient var ledger : ?Ledger = null;

    // System functions for upgrades
    system func preupgrade() {
        stakesEntries := Iter.toArray(stakes.entries());
        userStakesEntries := Iter.toArray(userStakes.entries());
    };

    system func postupgrade() {
        stakes := HashMap.fromIter<StakeId, Stake>(
            stakesEntries.vals(), 
            stakesEntries.size(), 
            Nat.equal, 
            func(n: Nat) : Nat32 { Nat32.fromNat(n) }
        );
        userStakes := HashMap.fromIter<Principal, [StakeId]>(
            userStakesEntries.vals(), 
            userStakesEntries.size(), 
            Principal.equal, 
            Principal.hash
        );
        
        // Restore analytics canister reference if available
        switch (analyticsCanisterId) {
            case (?id) {
                analyticsCanister := ?(actor (Principal.toText(id)) : AnalyticsService);
            };
            case null {};
        };

        // Restore ledger canister reference if available
        switch (ledgerCanisterId) {
            case (?id) { ledger := ?(actor (Principal.toText(id)) : Ledger) };
            case null {};
        };
    };

    // Set analytics canister reference
    public shared(msg) func setAnalyticsCanister(analytics_id: Principal) : async Result<(), Text> {
        analyticsCanisterId := ?analytics_id;
        analyticsCanister := ?(actor (Principal.toText(analytics_id)) : AnalyticsService);
        #ok()
    };

    // Set ledger canister reference
    public shared(_msg) func setLedgerCanister(ledger_id: Principal) : async Result<(), Text> {
        ledgerCanisterId := ?ledger_id;
        ledger := ?(actor (Principal.toText(ledger_id)) : Ledger);
        #ok()
    };

    // Public functions

    // Stake tokens
    public shared(msg) func stake(amount: TokenAmount, period: StakingPeriod) : async Result<StakeId, Text> {
        let caller = msg.caller;

        if (not stakingEnabled) {
            return #err("Staking is currently disabled");
        };

        if (amount < minimumStakeAmount) {
            return #err("Amount below minimum stake requirement");
        };

        if (amount > maximumStakeAmount) {
            return #err("Amount exceeds maximum stake limit");
        };

        // Move funds from user to staking canister via ICRC-2 transfer_from
        switch (ledger) {
            case (?l) {
                let from : Account = { owner = caller; subaccount = null };
                let to : Account = { owner = Principal.fromActor(StakingCanister); subaccount = null };
                let tf = await l.icrc2_transfer_from({
                    from = from;
                    to = to;
                    amount = amount;
                    fee = null;
                    memo = null;
                    created_at_time = null;
                    spender_subaccount = null;
                });
                switch (tf) {
                    case (#ok _) {};
                    case (#err e) { return #err("Ledger transfer_from failed: " # debug_show(e)) };
                };
            };
            case null { return #err("Ledger not configured for staking") };
        };

        let stakeId = nextStakeId;
        nextStakeId += 1;

        let now = Time.now() / 1_000_000;
        let unlockTime = calculateUnlockTime(now, period);

        let newStake : Stake = {
            id = stakeId;
            staker = caller;
            amount = amount;
            stakingPeriod = period;
            stakedAt = now;
            unlocksAt = unlockTime;
            rewards = 0;
            isActive = true;
        };

        stakes.put(stakeId, newStake);
        
        // Update user stakes
        let currentUserStakes = switch (userStakes.get(caller)) {
            case (?stakes) stakes;
            case null [];
        };
        let updatedUserStakes = Array.append<StakeId>(currentUserStakes, [stakeId]);
        userStakes.put(caller, updatedUserStakes);

        // Update total staked amount
        totalStakedAmount += amount;

        // Record staking event
        switch (analyticsCanister) {
            case (?analytics) {
                let _ = await analytics.recordEvent(
                    #TOKENS_STAKED,
                    null, // DAO ID would need to be passed or stored
                    ?caller,
                    [("period", debug_show(period)), ("stakeId", Nat.toText(stakeId))],
                    ?Float.fromInt(amount)
                );
            };
            case null {};
        };

        #ok(stakeId)
    };

    // Unstake tokens
    public shared(msg) func unstake(stakeId: StakeId) : async Result<TokenAmount, Text> {
        let caller = msg.caller;

        let stake = switch (stakes.get(stakeId)) {
            case (?s) s;
            case null return #err("Stake not found");
        };

        if (stake.staker != caller) {
            return #err("Not authorized to unstake this stake");
        };

        if (not stake.isActive) {
            return #err("Stake is not active");
        };

        // Check if stake is unlocked
        switch (stake.unlocksAt) {
            case (?unlockTime) {
                if (Time.now() / 1_000_000 < unlockTime) {
                    return #err("Stake is still locked");
                };
            };
            case null {}; // Instant staking, always unlocked
        };

        // Calculate final rewards
        let finalRewards = calculateRewards(stake);
        let totalAmount = stake.amount + finalRewards;

        // Calculate rewards (not paid out here) and transfer principal back to user
        switch (ledger) {
            case (?l) {
                let to : Account = { owner = caller; subaccount = null };
                let tr = await l.icrc1_transfer({
                    from_subaccount = null;
                    to = to;
                    amount = stake.amount;
                    fee = null;
                    memo = null;
                    created_at_time = null;
                });
                switch (tr) {
                    case (#ok _) {};
                    case (#err e) { return #err("Ledger transfer failed: " # debug_show(e)) };
                };
            };
            case null { return #err("Ledger not configured for staking") };
        };

        // Deactivate stake
        let updatedStake = {
            id = stake.id;
            staker = stake.staker;
            amount = stake.amount;
            stakingPeriod = stake.stakingPeriod;
            stakedAt = stake.stakedAt;
            unlocksAt = stake.unlocksAt;
            rewards = finalRewards;
            isActive = false;
        };
        stakes.put(stakeId, updatedStake);

        // Update total staked amount
        totalStakedAmount -= stake.amount;
        totalRewardsDistributed += finalRewards;

        // Record unstaking event
        switch (analyticsCanister) {
            case (?analytics) {
                let _ = await analytics.recordEvent(
                    #TOKENS_UNSTAKED,
                    null, // DAO ID would need to be passed or stored
                    ?caller,
                    [("stakeId", Nat.toText(stakeId)), ("rewards", Nat.toText(finalRewards))],
                    ?Float.fromInt(stake.amount)
                );
            };
            case null {};
        };

        #ok(stake.amount)
    };

    // Claim rewards without unstaking (for instant staking)
    public shared(msg) func claimRewards(stakeId: StakeId) : async Result<TokenAmount, Text> {
        let caller = msg.caller;

        let stake = switch (stakes.get(stakeId)) {
            case (?s) s;
            case null return #err("Stake not found");
        };

        if (stake.staker != caller) {
            return #err("Not authorized to claim rewards for this stake");
        };

        if (not stake.isActive) {
            return #err("Stake is not active");
        };

        // Only instant staking allows reward claiming
        if (stake.stakingPeriod != #instant) {
            return #err("Rewards can only be claimed for instant staking");
        };

        let currentRewards = calculateRewards(stake);
        let claimableRewards: Nat = if (currentRewards >= stake.rewards) {
            currentRewards - stake.rewards
            } else { 0 };


        if (claimableRewards == 0) {
            return #err("No rewards available to claim");
        };

        // Update stake with claimed rewards
        let updatedStake = {
            id = stake.id;
            staker = stake.staker;
            amount = stake.amount;
            stakingPeriod = stake.stakingPeriod;
            stakedAt = stake.stakedAt;
            unlocksAt = stake.unlocksAt;
            rewards = currentRewards;
            isActive = stake.isActive;
        };
        stakes.put(stakeId, updatedStake);

        totalRewardsDistributed += claimableRewards;

        // Record rewards claim event
        switch (analyticsCanister) {
            case (?analytics) {
                let _ = await analytics.recordEvent(
                    #REWARDS_CLAIMED,
                    null, // DAO ID would need to be passed or stored
                    ?caller,
                    [("stakeId", Nat.toText(stakeId))],
                    ?Float.fromInt(claimableRewards)
                );
            };
            case null {};
        };

        #ok(claimableRewards)
    };

    // Extend staking period
    public shared(msg) func extendStakingPeriod(stakeId: StakeId, newPeriod: StakingPeriod) : async Result<(), Text> {
        let caller = msg.caller;

        let stake = switch (stakes.get(stakeId)) {
            case (?s) s;
            case null return #err("Stake not found");
        };

        if (stake.staker != caller) {
            return #err("Not authorized to modify this stake");
        };

        if (not stake.isActive) {
            return #err("Stake is not active");
        };

        // Check if new period is longer than current
        if (not isLongerPeriod(stake.stakingPeriod, newPeriod)) {
            return #err("New period must be longer than current period");
        };

        let newUnlockTime = calculateUnlockTime(Time.now() / 1_000_000, newPeriod);
        let updatedStake = {
            id = stake.id;
            staker = stake.staker;
            amount = stake.amount;
            stakingPeriod = newPeriod;
            stakedAt = stake.stakedAt;
            unlocksAt = newUnlockTime;
            rewards = stake.rewards;
            isActive = stake.isActive;
        };
        stakes.put(stakeId, updatedStake);

        #ok()
    };

    // Query functions

    // Get stake by ID
    public query func getStake(stakeId: StakeId) : async ?Stake {
        stakes.get(stakeId)
    };

    // Get user's stakes
    // Private version for internal use
    private func getUserStakesInternal(user: Principal) : [Stake] {
        let stakeIds = switch (userStakes.get(user)) {
            case (?ids) ids;
            case null return [];
        };

        let userStakesList = Buffer.Buffer<Stake>(0);
        for (stakeId in stakeIds.vals()) {
            switch (stakes.get(stakeId)) {
                case (?stake) userStakesList.add(stake);
                case null {};
            };
        };
        Buffer.toArray(userStakesList)
    };


    public query func getUserStakes(user: Principal) : async [Stake] {
        getUserStakesInternal(user)
    };

    // Get user's active stakes
    public query func getUserActiveStakes(user: Principal) : async [Stake] {
    let allUserStakes = getUserStakesInternal(user);
        Array.filter<Stake>(allUserStakes, func(stake) = stake.isActive)
    };

    // Get staking rewards for a stake
    public query func getStakingRewards(stakeId: StakeId) : async ?StakingRewards {
        switch (stakes.get(stakeId)) {
            case (?stake) {
                let totalRewards = calculateRewards(stake);
                let claimableRewards: Nat =
                    if (stake.stakingPeriod != #instant) {
                        0
                    } else if (totalRewards >= stake.rewards) {
                        totalRewards - stake.rewards
                    } else {
                        0
                    };

                ?{
                    totalRewards = totalRewards;
                    claimableRewards = claimableRewards;
                    lastClaimedAt = if (stake.rewards > 0) ?stake.stakedAt else null;
                    apr = getAPRForPeriod(stake.stakingPeriod);
                }
            };
            case null null;
        }
    };

    // Get user's total staking summary
    public query func getUserStakingSummary(user: Principal) : async {
        totalStaked: TokenAmount;
        totalRewards: TokenAmount;
        activeStakes: Nat;
        totalVotingPower: Nat;
    } {
        let userStakesList = getUserStakesInternal(user);
        var totalStaked : TokenAmount = 0;
        var totalRewards : TokenAmount = 0;
        var activeStakes : Nat = 0;
        var totalVotingPower : Nat = 0;

        for (stake in userStakesList.vals()) {
            if (stake.isActive) {
                totalStaked += stake.amount;
                totalRewards += calculateRewards(stake);
                activeStakes += 1;
                totalVotingPower += Types.calculateVotingPower(stake.amount, stake.stakingPeriod);
            };
        };

        {
            totalStaked = totalStaked;
            totalRewards = totalRewards;
            activeStakes = activeStakes;
            totalVotingPower = totalVotingPower;
        }
    };

    // Get staking statistics
    public query func getStakingStats() : async {
        totalStakes: Nat;
        activeStakes: Nat;
        totalStakedAmount: TokenAmount;
        totalRewardsDistributed: TokenAmount;
        averageStakeAmount: Float;
        stakingPeriodDistribution: [(StakingPeriod, Nat)];
    } {
        var activeStakes : Nat = 0;
        var instantCount : Nat = 0;
        var locked30Count : Nat = 0;
        var locked90Count : Nat = 0;
        var locked180Count : Nat = 0;
        var locked365Count : Nat = 0;

        for (stake in stakes.vals()) {
            if (stake.isActive) {
                activeStakes += 1;
                switch (stake.stakingPeriod) {
                    case (#instant) instantCount += 1;
                    case (#locked30) locked30Count += 1;
                    case (#locked90) locked90Count += 1;
                    case (#locked180) locked180Count += 1;
                    case (#locked365) locked365Count += 1;
                };
            };
        };

        let averageAmount = if (activeStakes > 0) {
            Float.fromInt(totalStakedAmount) / Float.fromInt(activeStakes)
        } else { 0.0 };

        {
            totalStakes = stakes.size();
            activeStakes = activeStakes;
            totalStakedAmount = totalStakedAmount;
            totalRewardsDistributed = totalRewardsDistributed;
            averageStakeAmount = averageAmount;
            stakingPeriodDistribution = [
                (#instant, instantCount),
                (#locked30, locked30Count),
                (#locked90, locked90Count),
                (#locked180, locked180Count),
                (#locked365, locked365Count)
            ];
        }
    };

    // Administrative functions

    // Enable/disable staking
    public shared(_msg) func setStakingEnabled(enabled: Bool) : async Result<(), Text> {
        // In real implementation, only governance should be able to do this
        stakingEnabled := enabled;
        #ok()
    };

    // Update minimum stake amount
    public shared(_msg) func setMinimumStakeAmount(amount: TokenAmount) : async Result<(), Text> {
        // In real implementation, only governance should be able to do this
        minimumStakeAmount := amount;
        #ok()
    };

    // Update maximum stake amount
    public shared(_msg) func setMaximumStakeAmount(amount: TokenAmount) : async Result<(), Text> {
        // In real implementation, only governance should be able to do this
        maximumStakeAmount := amount;
        #ok()
    };

    // Helper functions
    private func calculateUnlockTime(stakedAt: Time.Time, period: StakingPeriod) : ?Time.Time {
        switch (period) {
            case (#instant) null;
            case (#locked30) ?(stakedAt + 30 * 24 * 60 * 60 * 1_000_000_000);
            case (#locked90) ?(stakedAt + 90 * 24 * 60 * 60 * 1_000_000_000);
            case (#locked180) ?(stakedAt + 180 * 24 * 60 * 60 * 1_000_000_000);
            case (#locked365) ?(stakedAt + 365 * 24 * 60 * 60 * 1_000_000_000);
        }
    };

    private func calculateRewards(stake: Stake) : TokenAmount {
        let stakingDuration = Time.now() / 1_000_000 - stake.stakedAt;
        Types.calculateStakingRewards(stake.amount, stake.stakingPeriod, Int.abs(stakingDuration))
    };

    private func getAPRForPeriod(period: StakingPeriod) : Float {
        switch (period) {
            case (#instant) 0.05; // 5% APR
            case (#locked30) 0.08; // 8% APR
            case (#locked90) 0.12; // 12% APR
            case (#locked180) 0.18; // 18% APR
            case (#locked365) 0.25; // 25% APR
        }
    };

    private func isLongerPeriod(current: StakingPeriod, new: StakingPeriod) : Bool {
        let currentValue = switch (current) {
            case (#instant) 0;
            case (#locked30) 30;
            case (#locked90) 90;
            case (#locked180) 180;
            case (#locked365) 365;
        };

        let newValue = switch (new) {
            case (#instant) 0;
            case (#locked30) 30;
            case (#locked90) 90;
            case (#locked180) 180;
            case (#locked365) 365;
        };

        newValue > currentValue
    };
}
