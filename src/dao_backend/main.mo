import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

import Types "shared/types";

/**
 * Main DAO Backend Canister
 * 
 * This is the central coordinator canister for the DAO system. It manages:
 * - DAO initialization and configuration
 * - User profile management and registration
 * - Admin permissions and access control
 * - Canister reference management for the modular architecture
 * - Cross-canister communication coordination
 * - Integration with the global DAO registry
 * 
 * The canister follows the upgrade-safe pattern with stable variables
 * and proper state management for Internet Computer upgrades.
 */
persistent actor DAOMain {
    // Type aliases for cleaner code and better readability
    type Result<T, E> = Result.Result<T, E>;
    type Proposal = Types.Proposal;
    type Vote = Types.Vote;
    type ProposalId = Types.ProposalId;
    type Stake = Types.Stake;
    type StakeId = Types.StakeId;
    type TokenAmount = Types.TokenAmount;
    type UserProfile = Types.UserProfile;
    type DAOStats = Types.DAOStats;
    type DAOConfig = Types.DAOConfig;
    type Activity = Types.Activity;

    // Typed interface for the Registry canister
    type RegistryService = actor {
        registerDAO: shared (Text, Text, Text, Bool, Principal, ?Text, ?Text, ?Text) -> async Result<Text, Text>;
        updateDAOStats: shared (Text, ?Nat, ?Nat, ?Nat, ?Nat, ?Nat, ?Float) -> async Result<(), Text>;
    };

    // Stable storage for upgrades - persists across canister upgrades
    // These variables maintain their state when the canister is upgraded
    private var initialized : Bool = false;
    private var daoName : Text = "DAO Launcher";
    private var daoDescription : Text = "A decentralized autonomous organization for community governance";
    private var totalMembers : Nat = 0;
    private var userProfilesEntries : [(Principal, UserProfile)] = [];
    private var adminPrincipalsEntries : [Principal] = [];
    private var daoConfig : ?DAOConfig = null;

    // Registry integration
    private var registryCanisterId : ?Principal = null;
    private var registeredInRegistry : Bool = false;

    // Runtime storage - recreated after upgrades from stable storage
    // These HashMaps provide efficient O(1) lookup for user data and admin permissions
    private transient var userProfiles = HashMap.HashMap<Principal, UserProfile>(100, Principal.equal, Principal.hash);
    private transient var adminPrincipals = HashMap.HashMap<Principal, Bool>(10, Principal.equal, Principal.hash);

    // Canister references for modular architecture
    // These maintain connections to other specialized canisters in the DAO ecosystem
    private transient var governanceCanister : ?Principal = null;
    private transient var stakingCanister : ?Principal = null;
    private transient var treasuryCanister : ?Principal = null;
    private transient var proposalsCanister : ?Principal = null;

    // Registry canister reference
    private transient var registryCanister : ?RegistryService = null;

    // System functions for upgrades
    /**
     * Pre-upgrade hook - Serializes runtime state to stable storage
     * Called automatically before canister upgrade to preserve data
     */
    system func preupgrade() {
        userProfilesEntries := Iter.toArray(userProfiles.entries());
        adminPrincipalsEntries := Iter.toArray(adminPrincipals.keys());
    };

    /**
     * Post-upgrade hook - Restores runtime state from stable storage
     * Called automatically after canister upgrade to restore functionality
     */
    system func postupgrade() {
        userProfiles := HashMap.fromIter<Principal, UserProfile>(
            userProfilesEntries.vals(), 
            userProfilesEntries.size(), 
            Principal.equal, 
            Principal.hash
        );
        
        // Restore admin permissions from stable storage
        for (admin in adminPrincipalsEntries.vals()) {
            adminPrincipals.put(admin, true);
        };

        // Restore registry canister reference if available
        switch (registryCanisterId) {
            case (?id) {
                registryCanister := ?(actor (Principal.toText(id)) : RegistryService);
            };
            case null {};
        };
    };

    /**
     * Initialize the DAO with basic configuration
     * 
     * This is the first function called when setting up a new DAO.
     * It establishes the foundational parameters and admin structure.
     * 
     * @param name - Human-readable name for the DAO
     * @param description - Brief description of the DAO's purpose
     * @param initialAdmins - Array of Principal IDs who will have admin privileges
     * @param registry_id - Optional Principal ID of the global DAO registry
     * @returns Result indicating success or failure with error message
     */
    public shared(msg) func initialize(
        name: Text,
        description: Text,
        initialAdmins: [Principal],
        registry_id: ?Principal
    ) : async Result<(), Text> {
        // Prevent double initialization
        if (initialized) {
            return #err("DAO already initialized");
        };

        daoName := name;
        daoDescription := description;
        
        // Set initial admins - these users can manage DAO configuration
        for (admin in initialAdmins.vals()) {
            adminPrincipals.put(admin, true);
        };

        // Always add the deployer as an admin for initial setup
        adminPrincipals.put(msg.caller, true);

        // Set registry canister reference
        switch (registry_id) {
            case (?id) {
                registryCanisterId := ?id;
                registryCanister := ?(actor (Principal.toText(id)) : RegistryService);
            };
            case null {};
        };

        initialized := true;
        Debug.print("DAO initialized: " # name);
        #ok()
    };

    /**
     * Set references to other canisters in the DAO ecosystem
     * 
     * This establishes the microservices architecture by connecting
     * the main canister to specialized function canisters.
     * 
     * @param governance - Principal ID of the governance canister
     * @param staking - Principal ID of the staking canister  
     * @param treasury - Principal ID of the treasury canister
     * @param proposals - Principal ID of the proposals canister
     * @returns Result indicating success or failure
     */
    public shared(msg) func setCanisterReferences(
        governance: Principal,
        staking: Principal,
        treasury: Principal,
        proposals: Principal
    ) : async Result<(), Text> {
        // Only admins can modify the canister architecture
        if (not isAdmin(msg.caller)) {
            return #err("Only admins can set canister references");
        };

        governanceCanister := ?governance;
        stakingCanister := ?staking;
        treasuryCanister := ?treasury;
        proposalsCanister := ?proposals;

        Debug.print("Canister references set successfully");
        #ok()
    };

    /**
     * Register this DAO with the global registry
     */
    public shared(msg) func registerWithRegistry() : async Result<Text, Text> {
        if (not isAdmin(msg.caller)) {
            return #err("Only admins can register with registry");
        };

        switch (registryCanister) {
            case (?registry) {
                switch (daoConfig) {
                    case (?config) {
                        let result = await registry.registerDAO(
                            daoName,
                            daoDescription,
                            config.category,
                            true, // is_public - could be configurable
                            Principal.fromActor(DAOMain),
                            ?config.website,
                            null, // logo_url - could be added to config
                            ?config.tokenSymbol
                        );
                        
                        switch (result) {
                            case (#ok(dao_id)) {
                                registeredInRegistry := true;
                                Debug.print("DAO registered with registry: " # dao_id);
                                #ok(dao_id)
                            };
                            case (#err(error)) #err(error);
                        }
                    };
                    case null #err("DAO configuration not set");
                }
            };
            case null #err("Registry canister not configured");
        }
    };

    /**
     * Update DAO statistics in the registry
     */
    public shared(msg) func updateRegistryStats() : async Result<(), Text> {
        if (not registeredInRegistry) {
            return #err("DAO not registered with registry");
        };

        switch (registryCanister) {
            case (?registry) {
                // Get current DAO stats
                let stats = await getDAOStats();
                
                let result = await registry.updateDAOStats(
                    "dao_" # Nat.toText(1), // This would need to be stored from registration
                    ?stats.totalMembers,
                    ?stats.totalProposals,
                    ?stats.activeProposals,
                    ?stats.totalStaked,
                    ?stats.treasuryBalance,
                    null // governance_participation - could be calculated
                );
                
                switch (result) {
                    case (#ok()) {
                        Debug.print("Registry stats updated successfully");
                        #ok()
                    };
                    case (#err(error)) #err(error);
                }
            };
            case null #err("Registry canister not configured");
        }
    };

    /**
     * Get public DAO information for discovery
     */
    public query func getPublicDAOInfo() : async {
        name: Text;
        description: Text;
        category: ?Text;
        member_count: Nat;
        token_symbol: ?Text;
        website: ?Text;
        is_public: Bool;
        creation_date: Int;
    } {
        let category = switch (daoConfig) {
            case (?config) ?config.category;
            case null null;
        };
        
        let token_symbol = switch (daoConfig) {
            case (?config) ?config.tokenSymbol;
            case null null;
        };
        
        let website = switch (daoConfig) {
            case (?config) ?config.website;
            case null null;
        };

        {
            name = daoName;
            description = daoDescription;
            category = category;
            member_count = totalMembers;
            token_symbol = token_symbol;
            website = website;
            is_public = true; // Could be configurable
            creation_date = Time.now() / 1_000_000; // This should be stored during initialization
        }
    };

    // DAO configuration
    public shared(msg) func setDAOConfig(config: DAOConfig) : async Result<(), Text> {
        if (not isAdmin(msg.caller)) {
            return #err("Only admins can set DAO configuration");
        };
        daoConfig := ?config;
        Debug.print("DAO configuration saved");
        
        // Auto-register with registry if configured and not already registered
        if (not registeredInRegistry) {
            switch (await registerWithRegistry()) {
                case (#ok(dao_id)) {
                    Debug.print("Auto-registered with registry: " # dao_id);
                };
                case (#err(error)) {
                    Debug.print("Failed to auto-register with registry: " # error);
                };
            };
        };
        
        #ok()
    };

    // User management
    public shared(msg) func registerUser(displayName: Text, bio: Text) : async Result<(), Text> {
        let caller = msg.caller;
        
        switch (userProfiles.get(caller)) {
            case (?_) return #err("User already registered");
            case null {};
        };

        let userProfile : UserProfile = {
            id = caller;
            displayName = displayName;
            bio = bio;
            joinedAt = Time.now() / 1_000_000;
            reputation = 0;
            totalStaked = 0;
            votingPower = 0;
        };

        userProfiles.put(caller, userProfile);
        totalMembers += 1;

        Debug.print("User registered: " # displayName);
        #ok()
    };

    public shared(msg) func adminRegisterUser(newUser: Principal, displayName: Text, bio: Text) : async Result<(), Text> {
        if (not isAdmin(msg.caller)) {
            return #err("Only admins can register users");
        };

        switch (userProfiles.get(newUser)) {
            case (?_) return #err("User already registered");
            case null {};
        };

        let userProfile : UserProfile = {
            id = newUser;
            displayName = displayName;
            bio = bio;
            joinedAt = Time.now() / 1_000_000;
            reputation = 0;
            totalStaked = 0;
            votingPower = 0;
        };

        userProfiles.put(newUser, userProfile);
        totalMembers += 1;

        Debug.print("User registered by admin: " # displayName);
        #ok()
    };

    public shared(msg) func updateUserProfile(displayName: Text, bio: Text) : async Result<(), Text> {
        let caller = msg.caller;
        
        switch (userProfiles.get(caller)) {
            case null return #err("User not found");
            case (?profile) {
                let updatedProfile = {
                    id = profile.id;
                    displayName = displayName;
                    bio = bio;
                    joinedAt = profile.joinedAt;
                    reputation = profile.reputation;
                    totalStaked = profile.totalStaked;
                    votingPower = profile.votingPower;
                };
                userProfiles.put(caller, updatedProfile);
                #ok()
            };
        };
    };

    // Query functions
    public query func getDAOInfo() : async {
        name: Text;
        description: Text;
        totalMembers: Nat;
        initialized: Bool;
    } {
        {
            name = daoName;
            description = daoDescription;
            totalMembers = totalMembers;
            initialized = initialized;
        }
    };

    public query func getDAOConfig() : async ?DAOConfig {
        daoConfig
    };

    public query func getUserProfile(userId: Principal) : async ?UserProfile {
        userProfiles.get(userId)
    };

    public query func getAllUsers() : async [UserProfile] {
        Iter.toArray(userProfiles.vals())
    };

    public query func getCanisterReferences() : async {
        governance: ?Principal;
        staking: ?Principal;
        treasury: ?Principal;
        proposals: ?Principal;
    } {
        {
            governance = governanceCanister;
            staking = stakingCanister;
            treasury = treasuryCanister;
            proposals = proposalsCanister;
        }
    };

    public query func getDAOStats() : async DAOStats {
        {
            totalMembers = totalMembers;
            totalProposals = 0; // Will be fetched from governance canister
            activeProposals = 0; // Will be fetched from governance canister
            totalStaked = 0; // Will be fetched from staking canister
            treasuryBalance = 0; // Will be fetched from treasury canister
            totalVotingPower = 0; // Will be calculated from staking data
        }
    };

    // Recent activity
    public query func getRecentActivity() : async [Activity] {
        // This function will aggregate recent activity from various DAO modules.
        // For now, return an empty list as a placeholder implementation.
        []
    };

    // Governance operations (temporary implementation until governance canister is ready)
    public func getGovernanceStats() : async {
        totalProposals: Nat;
        activeProposals: Nat;
        passedProposals: Nat;
        totalVotingPower: Nat;
    } {
        // Temporary static data until governance canister is implemented
        {
            totalProposals = 0;
            activeProposals = 0;
            passedProposals = 0;
            totalVotingPower = 0;
        }
    };

    // Temporary proposal creation (will delegate to proposals canister later)
    public shared(msg) func createProposal(
        title: Text,
        _description: Text,
        _proposalType: Text
    ) : async Result<Nat, Text> {
        if (not isRegisteredUser(msg.caller)) {
            return #err("Only registered users can create proposals");
        };
        
        // For now, return success with a dummy proposal ID
        // Later this will delegate to the proposals canister
        Debug.print("Proposal created: " # title);
        #ok(1) // Return dummy proposal ID
    };

    // Temporary voting function (will delegate to proposals canister later)
    public shared(msg) func vote(
        proposalId: Nat,
        choice: Text,
        _reason: ?Text
    ) : async Result<(), Text> {
        if (not isRegisteredUser(msg.caller)) {
            return #err("Only registered users can vote");
        };
        
        // For now, just log the vote
        // Later this will delegate to the proposals canister
        Debug.print("Vote cast on proposal " # Nat.toText(proposalId) # ": " # choice);
        #ok()
    };

    // Utility functions
    private func isAdmin(principal: Principal) : Bool {
        switch (adminPrincipals.get(principal)) {
            case (?_) true;
            case null false;
        }
    };

    private func isRegisteredUser(principal: Principal) : Bool {
        switch (userProfiles.get(principal)) {
            case (?_) true;
            case null false;
        }
    };

    public query func checkIsAdmin(principal: Principal) : async Bool {
        isAdmin(principal)
    };

    // Admin functions
    public shared(msg) func addAdmin(newAdmin: Principal) : async Result<(), Text> {
        if (not isAdmin(msg.caller)) {
            return #err("Only admins can add other admins");
        };

        adminPrincipals.put(newAdmin, true);
        Debug.print("New admin added: " # Principal.toText(newAdmin));
        #ok()
    };

    public shared(msg) func removeAdmin(adminToRemove: Principal) : async Result<(), Text> {
        if (not isAdmin(msg.caller)) {
            return #err("Only admins can remove other admins");
        };

        if (msg.caller == adminToRemove) {
            return #err("Cannot remove yourself as admin");
        };

        adminPrincipals.delete(adminToRemove);
        Debug.print("Admin removed: " # Principal.toText(adminToRemove));
        #ok()
    };

    // Health check
    public query func health() : async { status: Text; timestamp: Int } {
        {
            status = "healthy";
            timestamp = Time.now() / 1_000_000;
        }
    };

    // Greet function (keeping for compatibility)
    public query func greet(name : Text) : async Text {
        return "Hello, " # name # "! Welcome to " # daoName;
    };
};
