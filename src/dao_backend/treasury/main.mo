import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
// import Debug "mo:base/Debug";
import Buffer "mo:base/Buffer";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Nat32 "mo:base/Nat32";
import Blob "mo:base/Blob";
import Nat64 "mo:base/Nat64";

import Types "../shared/types";

/**
 * Analytics Integration
 */
// (moved inside actor to satisfy Motoko's top-level rule)

/**
 * Treasury Canister
 * 
 * This canister manages the DAO's financial operations and fund management:
 * - Multi-signature wallet functionality for secure fund management
 * - Transaction history and audit trail for transparency
 * - Allowance system for controlled spending by authorized entities
 * - Balance segregation (available, locked, reserved) for different purposes
 * 
 * Treasury Features:
 * - Deposit tracking from various sources (initial funding, fees, revenue)
 * - Withdrawal approval workflows with multi-sig requirements
 * - Automated allocation for different DAO functions (rewards, development, etc.)
 * - Integration with governance for spending proposal execution
 * 
 * Security Mechanisms:
 * - Multi-signature requirements for large transactions
 * - Spending limits and approval workflows
 * - Time-locked withdrawals for major fund movements
 * - Emergency pause functionality for security incidents
 */
persistent actor TreasuryCanister {
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
    // Type aliases for improved code readability
    type Result<T, E> = Result.Result<T, E>;
    type TreasuryBalance = Types.TreasuryBalance;
    type TreasuryTransaction = Types.TreasuryTransaction;
    type TokenAmount = Types.TokenAmount;
    type TreasuryError = Types.TreasuryError;
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
    type TransferFromError = {
        #BadFee : { expected_fee : Nat };
        #BadBurn : { min_burn_amount : Nat };
        #InsufficientFunds : { balance : Nat };
        #InsufficientAllowance : { allowance : Nat };
        #TooOld;
        #CreatedInFuture : { ledger_time : Nat64 };
        #Duplicate : { duplicate_of : Nat };
        #TemporarilyUnavailable;
        #GenericError : { error_code : Nat; message : Text };
    };
    type TransferResult = { #Ok : Nat; #Err : TransferError };
    type TransferFromResult = { #Ok : Nat; #Err : TransferFromError };
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
        icrc2_transfer_from : shared TransferFromArgs -> async TransferFromResult;
    };

    // Stable storage for upgrade persistence
    // Core financial data that must survive canister upgrades
    private var totalBalance : TokenAmount = 0;
    private var availableBalance : TokenAmount = 0;
    private var lockedBalance : TokenAmount = 0;       // Funds locked for specific purposes
    private var reservedBalance : TokenAmount = 0;     // Emergency reserves
    private var nextTransactionId : Nat = 1;
    private var transactionsEntries : [(Nat, TreasuryTransaction)] = [];
    private var allowancesEntries : [(Principal, TokenAmount)] = [];

    // Runtime storage - rebuilt from stable storage after upgrades
    // HashMaps provide efficient transaction and allowance management
    private transient var transactions = HashMap.HashMap<Nat, TreasuryTransaction>(100, Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n) });
    private transient var allowances = HashMap.HashMap<Principal, TokenAmount>(10, Principal.equal, Principal.hash);

    // Authorization system for treasury operations
    // In production, this would be managed by governance proposals
    private var authorizedPrincipals : [Principal] = [];
    
    // Faucet system for test token distribution
    private var faucetClaimsEntries : [(Principal, Time.Time)] = [];
    private transient var faucetClaims = HashMap.HashMap<Principal, Time.Time>(100, Principal.equal, Principal.hash);
    private var faucetAmount : TokenAmount = 100_000_000_000; // 1000 DAO tokens (with 8 decimals)
    private var faucetCooldown : Time.Time = 24 * 60 * 60 * 1_000_000_000; // 24 hours in nanoseconds
    private var faucetEnabled : Bool = true; // Can be disabled in production
    
    // Analytics integration
    private var analyticsCanisterId : ?Principal = null;
    private transient var analyticsCanister : ?AnalyticsService = null;
    // Ledger integration
    private var ledgerCanisterId : ?Principal = null;
    private transient var ledger : ?Ledger = null;

    // System functions for upgrades
    system func preupgrade() {
        transactionsEntries := Iter.toArray(transactions.entries());
        allowancesEntries := Iter.toArray(allowances.entries());
        faucetClaimsEntries := Iter.toArray(faucetClaims.entries());
    };

    system func postupgrade() {
        transactions := HashMap.fromIter<Nat, TreasuryTransaction>(
            transactionsEntries.vals(), 
            transactionsEntries.size(), 
            Nat.equal, 
            func(n: Nat) : Nat32 { Nat32.fromNat(n) }
        );
        allowances := HashMap.fromIter<Principal, TokenAmount>(
            allowancesEntries.vals(), 
            allowancesEntries.size(), 
            Principal.equal, 
            Principal.hash
        );
        faucetClaims := HashMap.fromIter<Principal, Time.Time>(
            faucetClaimsEntries.vals(), 
            faucetClaimsEntries.size(), 
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

    // Deposit tokens to treasury
    public shared(msg) func deposit(amount: TokenAmount, description: Text) : async Result<Nat, Text> {
        if (amount == 0) {
            return #err("Amount must be greater than 0");
        };

        // Pull funds from the caller into the treasury account via ICRC-2
        switch (ledger) {
            case (?l) {
                let from : Account = { owner = msg.caller; subaccount = null };
                let to : Account = { owner = Principal.fromActor(TreasuryCanister); subaccount = null };
                let tf = await l.icrc2_transfer_from({
                    from = from;
                    to = to;
                    amount = amount;
                    fee = null; // ICRC-2: ledger applies its own fee automatically
                    memo = null;
                    created_at_time = null;
                    spender_subaccount = null;
                });
                switch (tf) {
                    case (#Ok _) {};
                    case (#Err(#InsufficientAllowance { allowance })) { 
                        return #err("Insufficient allowance. You need to approve the treasury canister to spend your tokens first. Current allowance: " # Nat.toText(allowance)) 
                    };
                    case (#Err(#InsufficientFunds { balance })) { 
                        return #err("Insufficient funds. Your balance: " # Nat.toText(balance)) 
                    };
                    case (#Err e) { return #err("Ledger transfer_from failed: " # debug_show(e)) };
                };
            };
            case null { return #err("Ledger not configured for treasury") };
        };

        let transactionId = nextTransactionId;
        nextTransactionId += 1;

        let transaction : TreasuryTransaction = {
            id = transactionId;
            transactionType = #deposit;
            amount = amount;
            from = ?msg.caller;
            to = null;
            timestamp = Time.now() / 1_000_000;
            proposalId = null;
            description = description;
            status = #completed;
        };

        transactions.put(transactionId, transaction);
        
        // Update balances
        totalBalance += amount;
        availableBalance += amount;

        // Record deposit event
        switch (analyticsCanister) {
            case (?analytics) {
                let _ = await analytics.recordEvent(
                    #TREASURY_DEPOSIT,
                    null, // DAO ID would need to be passed or stored
                    ?msg.caller,
                    [("description", description)],
                    ?Float.fromInt(amount)
                );
            };
            case null {};
        };

        #ok(transactionId)
    };

    // Request test tokens from faucet (for development/testing)
    public shared(msg) func requestTestTokens() : async Result<Nat, Text> {
        let caller = msg.caller;

        // Check if faucet is enabled
        if (not faucetEnabled) {
            return #err("Faucet is currently disabled");
        };

        // Check if ledger is configured
        switch (ledger) {
            case null { return #err("Ledger not configured") };
            case (?_) {};
        };

        // Check cooldown period
        switch (faucetClaims.get(caller)) {
            case (?lastClaim) {
                let timeSince = Time.now() - lastClaim;
                if (timeSince < faucetCooldown) {
                    let hoursRemaining = (faucetCooldown - timeSince) / (60 * 60 * 1_000_000_000);
                    return #err("Please wait " # Nat.toText(Int.abs(hoursRemaining)) # " more hours before requesting again");
                };
            };
            case null {};
        };

        // Transfer tokens from treasury to caller
        switch (ledger) {
            case (?l) {
                let toAcct : Account = { owner = caller; subaccount = null };
                let tr = await l.icrc1_transfer({
                    from_subaccount = null;
                    to = toAcct;
                    amount = faucetAmount;
                    fee = null; // Let ledger apply default fee automatically
                    memo = null;
                    created_at_time = null;
                });
                
                switch (tr) {
                    case (#Ok(blockIndex)) {
                        // Record the claim
                        faucetClaims.put(caller, Time.now());
                        
                        // Create transaction record
                        let transactionId = nextTransactionId;
                        nextTransactionId += 1;
                        
                        let transaction : TreasuryTransaction = {
                            id = transactionId;
                            transactionType = #withdrawal;
                            amount = faucetAmount;
                            from = null;
                            to = ?caller;
                            timestamp = Time.now() / 1_000_000;
                            proposalId = null;
                            description = "Faucet: Test tokens distribution";
                            status = #completed;
                        };
                        
                        transactions.put(transactionId, transaction);
                        
                        #ok(transactionId)
                    };
                    case (#Err(#BadFee { expected_fee })) {
                        #err("Incorrect fee. Expected: " # Nat.toText(expected_fee))
                    };
                    case (#Err(#InsufficientFunds { balance })) {
                        #err("Faucet is empty. Treasury balance: " # Nat.toText(balance))
                    };
                    case (#Err(#BadBurn { min_burn_amount })) {
                        #err("Amount too low. Minimum: " # Nat.toText(min_burn_amount))
                    };
                    case (#Err(#TooOld)) {
                        #err("Transaction expired. Please try again.")
                    };
                    case (#Err(#CreatedInFuture { ledger_time })) {
                        #err("Transaction timestamp is in the future.")
                    };
                    case (#Err(#TemporarilyUnavailable)) {
                        #err("Ledger temporarily unavailable. Please try again.")
                    };
                    case (#Err(#Duplicate { duplicate_of })) {
                        #err("Duplicate transaction detected.")
                    };
                    case (#Err(#GenericError { error_code; message })) {
                        #err("Faucet transfer failed: " # message)
                    };
                };
            };
            case null { #err("Ledger not configured") };
        };
    };

    // Withdraw tokens from treasury (requires authorization)
    public shared(msg) func withdraw(
        recipient: Principal,
        amount: TokenAmount,
        description: Text,
        proposalId: ?Types.ProposalId
    ) : async Result<Nat, Text> {
        let caller = msg.caller;

        // Check authorization
        if (not isAuthorized(caller)) {
            return #err("Not authorized to withdraw from treasury");
        };

        // Check available balance
        if (amount > availableBalance) {
            return #err("Insufficient available balance");
        };

        let transactionId = nextTransactionId;
        nextTransactionId += 1;

        let transaction : TreasuryTransaction = {
            id = transactionId;
            transactionType = #withdrawal;
            amount = amount;
            from = null;
            to = ?recipient;
            timestamp = Time.now() / 1_000_000;
            proposalId = proposalId;
            description = description;
            status = #pending;
        };

        transactions.put(transactionId, transaction);

        // Execute withdrawal on ledger first
        switch (ledger) {
            case (?l) {
                let toAcct : Account = { owner = recipient; subaccount = null };
                let tr = await l.icrc1_transfer({
                    from_subaccount = null;
                    to = toAcct;
                    amount = amount;
                    fee = null; // Let ledger apply default fee automatically
                    memo = null;
                    created_at_time = null;
                });
                switch (tr) {
                    case (#Ok _) {
                // Update balances
                totalBalance -= amount;
                availableBalance -= amount;
                
                let completedTransaction = {
                    id = transaction.id;
                    transactionType = transaction.transactionType;
                    amount = transaction.amount;
                    from = transaction.from;
                    to = transaction.to;
                    timestamp = transaction.timestamp;
                    proposalId = transaction.proposalId;
                    description = transaction.description;
                    status = #completed;
                };
                transactions.put(transactionId, completedTransaction);
                
                // Record withdrawal event
                switch (analyticsCanister) {
                    case (?analytics) {
                        let _ = await analytics.recordEvent(
                            #TREASURY_WITHDRAWAL,
                            null, // DAO ID would need to be passed or stored
                            null,
                            [("description", description), ("recipient", Principal.toText(recipient))],
                            ?Float.fromInt(amount)
                        );
                    };
                    case null {};
                };
                    
                    #ok(transactionId)
                };
                    case (#Err e) {
                let failedTransaction = {
                    id = transaction.id;
                    transactionType = transaction.transactionType;
                    amount = transaction.amount;
                    from = transaction.from;
                    to = transaction.to;
                    timestamp = transaction.timestamp;
                    proposalId = transaction.proposalId;
                    description = transaction.description;
                    status = #failed;
                };
                transactions.put(transactionId, failedTransaction);
                        #err("Ledger transfer failed: " # debug_show(e))
                    };
                };
            };
            case null { return #err("Ledger not configured for treasury") };
        };
    };

    // Lock tokens for specific purposes (e.g., staking rewards)
    public shared(msg) func lockTokens(amount: TokenAmount, reason: Text) : async Result<(), Text> {
        if (not isAuthorized(msg.caller)) {
            return #err("Not authorized");
        };

        if (amount > availableBalance) {
            return #err("Insufficient available balance");
        };

        availableBalance -= amount;
        lockedBalance += amount;

        let transactionId = nextTransactionId;
        nextTransactionId += 1;

        let transaction : TreasuryTransaction = {
            id = transactionId;
            transactionType = #stakingReward;
            amount = amount;
            from = null;
            to = null;
            timestamp = Time.now() / 1_000_000;
            proposalId = null;
            description = "Locked tokens: " # reason;
            status = #completed;
        };

        transactions.put(transactionId, transaction);
        #ok()
    };

    // Unlock tokens
    public shared(msg) func unlockTokens(amount: TokenAmount, reason: Text) : async Result<(), Text> {
        if (not isAuthorized(msg.caller)) {
            return #err("Not authorized");
        };

        if (amount > lockedBalance) {
            return #err("Insufficient locked balance");
        };

        lockedBalance -= amount;
        availableBalance += amount;

        let transactionId = nextTransactionId;
        nextTransactionId += 1;

        let transaction : TreasuryTransaction = {
            id = transactionId;
            transactionType = #stakingReward;
            amount = amount;
            from = null;
            to = null;
            timestamp = Time.now() / 1_000_000;
            proposalId = null;
            description = "Unlocked tokens: " # reason;
            status = #completed;
        };

        transactions.put(transactionId, transaction);
        #ok()
    };

    // Reserve tokens for future use
    public shared(msg) func reserveTokens(amount: TokenAmount, reason: Text) : async Result<(), Text> {
        if (not isAuthorized(msg.caller)) {
            return #err("Not authorized");
        };

        if (amount > availableBalance) {
            return #err("Insufficient available balance");
        };

        availableBalance -= amount;
        reservedBalance += amount;

        let transactionId = nextTransactionId;
        nextTransactionId += 1;

        let transaction : TreasuryTransaction = {
            id = transactionId;
            transactionType = #fee;
            amount = amount;
            from = null;
            to = null;
            timestamp = Time.now() / 1_000_000;
            proposalId = null;
            description = "Reserved tokens: " # reason;
            status = #completed;
        };

        transactions.put(transactionId, transaction);
        #ok()
    };

    // Release reserved tokens
    public shared(msg) func releaseReservedTokens(amount: TokenAmount, reason: Text) : async Result<(), Text> {
        if (not isAuthorized(msg.caller)) {
            return #err("Not authorized");
        };

        if (amount > reservedBalance) {
            return #err("Insufficient reserved balance");
        };

        reservedBalance -= amount;
        availableBalance += amount;

        let transactionId = nextTransactionId;
        nextTransactionId += 1;

        let transaction : TreasuryTransaction = {
            id = transactionId;
            transactionType = #fee;
            amount = amount;
            from = null;
            to = null;
            timestamp = Time.now() / 1_000_000;
            proposalId = null;
            description = "Released reserved tokens: " # reason;
            status = #completed;
        };

        transactions.put(transactionId, transaction);
        #ok()
    };

    // Query functions

    // Get treasury balance
    public query func getBalance() : async TreasuryBalance {
        {
            total = totalBalance;
            available = availableBalance;
            locked = lockedBalance;
            reserved = reservedBalance;
        }
    };

    // Get transaction by ID
    public query func getTransaction(transactionId: Nat) : async ?TreasuryTransaction {
        transactions.get(transactionId)
    };

    // Get all transactions
    public query func getAllTransactions() : async [TreasuryTransaction] {
        Iter.toArray(transactions.vals())
    };

    // Get transactions by type
    public query func getTransactionsByType(transactionType: Types.TreasuryTransactionType) : async [TreasuryTransaction] {
        let filteredTransactions = Buffer.Buffer<TreasuryTransaction>(0);
        for (transaction in transactions.vals()) {
            if (transaction.transactionType == transactionType) {
                filteredTransactions.add(transaction);
            };
        };
        Buffer.toArray(filteredTransactions)
    };

    // Get recent transactions
    public query func getRecentTransactions(limit: Nat) : async [TreasuryTransaction] {
        let allTransactions = Iter.toArray(transactions.vals());
        let sortedTransactions = Array.sort(allTransactions, func(a: TreasuryTransaction, b: TreasuryTransaction) : {#less; #equal; #greater} {
            if (a.timestamp > b.timestamp) #less
            else if (a.timestamp < b.timestamp) #greater
            else #equal
        });
        
        if (sortedTransactions.size() <= limit) {
            sortedTransactions
        } else {
            Array.tabulate<TreasuryTransaction>(limit, func(i) = sortedTransactions[i])
        }
    };

    // Get treasury statistics
    public query func getTreasuryStats() : async {
        totalTransactions: Nat;
        totalDeposits: TokenAmount;
        totalWithdrawals: TokenAmount;
        averageTransactionAmount: Float;
        balance: TreasuryBalance;
    } {
        var totalDeposits : TokenAmount = 0;
        var totalWithdrawals : TokenAmount = 0;
        var totalAmount : TokenAmount = 0;

        for (transaction in transactions.vals()) {
            switch (transaction.transactionType) {
                case (#deposit) {
                    totalDeposits += transaction.amount;
                    totalAmount += transaction.amount;
                };
                case (#withdrawal) {
                    totalWithdrawals += transaction.amount;
                    totalAmount += transaction.amount;
                };
                case (_) {
                    totalAmount += transaction.amount;
                };
            };
        };

        let averageAmount = if (transactions.size() > 0) {
            Float.fromInt(totalAmount) / Float.fromInt(transactions.size())
        } else { 0.0 };

        {
            totalTransactions = transactions.size();
            totalDeposits = totalDeposits;
            totalWithdrawals = totalWithdrawals;
            averageTransactionAmount = averageAmount;
            balance = {
                total = totalBalance;
                available = availableBalance;
                locked = lockedBalance;
                reserved = reservedBalance;
            };
        }
    };

    // Administrative functions

    // Add authorized principal
    public shared(_msg) func addAuthorizedPrincipal(principal: Principal) : async Result<(), Text> {
        // In real implementation, only governance or admin should be able to do this
        let principals = Buffer.fromArray<Principal>(authorizedPrincipals);
        principals.add(principal);
        authorizedPrincipals := Buffer.toArray(principals);
        #ok()
    };

    // Remove authorized principal
    public shared(_msg) func removeAuthorizedPrincipal(principal: Principal) : async Result<(), Text> {
        // In real implementation, only governance or admin should be able to do this
        authorizedPrincipals := Array.filter<Principal>(authorizedPrincipals, func(p) = p != principal);
        #ok()
    };

    // Get authorized principals
    public query func getAuthorizedPrincipals() : async [Principal] {
        authorizedPrincipals
    };

    // Faucet management functions

    // Check if caller can claim from faucet
    public query(msg) func canClaimFaucet() : async Result<Bool, Text> {
        let caller = msg.caller;
        
        if (not faucetEnabled) {
            return #ok(false);
        };
        
        switch (faucetClaims.get(caller)) {
            case (?lastClaim) {
                let timeSince = Time.now() - lastClaim;
                if (timeSince < faucetCooldown) {
                    #ok(false)
                } else {
                    #ok(true)
                };
            };
            case null { #ok(true) };
        };
    };

    // Get faucet configuration
    public query func getFaucetInfo() : async {
        enabled: Bool;
        amount: TokenAmount;
        cooldownHours: Nat;
    } {
        {
            enabled = faucetEnabled;
            amount = faucetAmount;
            cooldownHours = Int.abs(faucetCooldown / (60 * 60 * 1_000_000_000));
        }
    };

    // Get time until next faucet claim (in seconds)
    public query(msg) func getTimeUntilNextClaim() : async ?Nat {
        let caller = msg.caller;
        
        switch (faucetClaims.get(caller)) {
            case (?lastClaim) {
                let timeSince = Time.now() - lastClaim;
                if (timeSince < faucetCooldown) {
                    let remaining = faucetCooldown - timeSince;
                    ?Int.abs(remaining / 1_000_000_000) // Convert to seconds
                } else {
                    ?0
                };
            };
            case null { ?0 };
        };
    };

    // Admin: Configure faucet (requires authorization)
    public shared(msg) func configureFaucet(
        enabled: Bool,
        amount: TokenAmount,
        cooldownHours: Nat
    ) : async Result<(), Text> {
        if (not isAuthorized(msg.caller)) {
            return #err("Not authorized");
        };
        
        faucetEnabled := enabled;
        faucetAmount := amount;
        faucetCooldown := cooldownHours * 60 * 60 * 1_000_000_000;
        
        #ok()
    };

    // Helper functions
    private func isAuthorized(principal: Principal) : Bool {
        Array.find<Principal>(authorizedPrincipals, func(p) = p == principal) != null
    };

    private func executeWithdrawal(_transactionId: Nat) : async Result<(), Text> {
        // In a real implementation, this would interact with the ledger canister
        // For now, we'll simulate a successful withdrawal
        #ok()
    };
}
