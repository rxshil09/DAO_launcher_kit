import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";

import Types "shared/types";

/**
 * Analytics Integration
 *
 * Note: In Motoko, the main file must only contain a single
 * actor/actor class at the top-level (besides imports). We
 * therefore keep this interface type inside the actor below.
 */

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
    type DAOConfigStable = Types.DAOConfigStable;
    type DAOConfigAllocations = Types.DAOConfigAllocations;
    type Activity = Types.Activity;
    type MemberRole = Types.MemberRole;
    type DAOMembership = Types.DAOMembership;

    // User settings type with granular field locking and privacy
    type UserSettings = {
        displayName: Text;
        email: ?Text;
        bio: Text;
        website: ?Text;
        privacy: {
            showProfile: {
                displayName: Bool;  // Always true when shown
                bio: Bool;          // User controlled
                website: Bool;      // User controlled
            };
            showInvestments: Bool;
            showActivity: Bool;
        };
        lockedFields: {
            displayName: Bool;
            email: Bool;
            bio: Bool;
            website: Bool;
        };
        createdAt: Int;
    };

    // Typed interface for the Registry canister
    type RegistryService = actor {
        registerDAO: shared (
            Text,
            Text,
            Text,
            Bool,
            Principal,
            ?Text,
            ?Text,
            ?Text,
            ?Text,
            ?Text
        ) -> async Result<Text, Text>;
        updateDAOStats: shared (Text, ?Nat, ?Nat, ?Nat, ?Nat, ?Nat, ?Float) -> async Result<(), Text>;
        updateDAOMetadata: shared (
            Text,
            ?Text,
            ?Text,
            ?Text,
            ?Bool,
            ?Text,
            ?Text,
            ?Text,
            ?Text,
            ?Text
        ) -> async Result<(), Text>;
    };

    // Stable storage for upgrades - persists across canister upgrades
    // These variables maintain their state when the canister is upgraded
    private var initialized : Bool = false;
    private var daoName : Text = "DAO Launcher";
    private var daoDescription : Text = "A decentralized autonomous organization for community governance";
    private var totalMembers : Nat = 0;
    private var userProfilesEntries : [(Principal, UserProfile)] = [];
    private var userSettingsEntries : [(Principal, UserSettings)] = [];
    private var adminPrincipalsEntries : [Principal] = [];
    private var daoConfig : ?DAOConfigStable = null;
    private var daoConfigAllocations : ?DAOConfigAllocations = null;
    
    // Welcome popup tracking - tracks which users have seen the welcome popup
    private var hasSeenWelcomeEntries : [(Principal, Bool)] = [];

    // Registry integration
    private var registryCanisterId : ?Principal = null;
    private var registeredInRegistry : Bool = false;
    private var registryDaoId : ?Text = null;
    private var daoCreator : ?Principal = null;

    // Membership tracking - stable storage for DAO membership system
    private var daoMembersEntries : [(Text, [DAOMembership])] = [];
    private var userMembershipsEntries : [(Principal, [Text])] = [];

    // Runtime storage - recreated after upgrades from stable storage
    // These HashMaps provide efficient O(1) lookup for user data and admin permissions
    private transient var userProfiles = HashMap.HashMap<Principal, UserProfile>(100, Principal.equal, Principal.hash);
    private transient var userSettings = HashMap.HashMap<Principal, UserSettings>(100, Principal.equal, Principal.hash);
    private transient var adminPrincipals = HashMap.HashMap<Principal, Bool>(10, Principal.equal, Principal.hash);
    private transient var cachedDaoConfig : ?DAOConfig = null;
    
    // Welcome popup tracking - runtime HashMap for efficient lookups
    private transient var hasSeenWelcome = HashMap.HashMap<Principal, Bool>(100, Principal.equal, Principal.hash);

    // Membership tracking - runtime storage for efficient lookups
    private transient var daoMembers = HashMap.HashMap<Text, [DAOMembership]>(10, Text.equal, Text.hash);
    private transient var userMemberships = HashMap.HashMap<Principal, [Text]>(50, Principal.equal, Principal.hash);

    // Canister references for modular architecture
    // These maintain connections to other specialized canisters in the DAO ecosystem
    private transient var governanceCanister : ?Principal = null;
    private transient var stakingCanister : ?Principal = null;
    private transient var treasuryCanister : ?Principal = null;
    private transient var proposalsCanister : ?Principal = null;

    // Registry canister reference
    private transient var registryCanister : ?RegistryService = null;

    // Analytics canister reference
    private var analyticsCanisterId : ?Principal = null;
    private transient var analyticsCanister : ?AnalyticsService = null;

    // System functions for upgrades
    /**
     * Pre-upgrade hook - Serializes runtime state to stable storage
     * Called automatically before canister upgrade to preserve data
     */
    system func preupgrade() {
        userProfilesEntries := Iter.toArray(userProfiles.entries());
        userSettingsEntries := Iter.toArray(userSettings.entries());
        adminPrincipalsEntries := Iter.toArray(adminPrincipals.keys());
        daoMembersEntries := Iter.toArray(daoMembers.entries());
        userMembershipsEntries := Iter.toArray(userMemberships.entries());
        hasSeenWelcomeEntries := Iter.toArray(hasSeenWelcome.entries());
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
        
        // Restore user settings from stable storage
        userSettings := HashMap.fromIter<Principal, UserSettings>(
            userSettingsEntries.vals(),
            userSettingsEntries.size(),
            Principal.equal,
            Principal.hash
        );
        
        // Restore admin permissions from stable storage
        for (admin in adminPrincipalsEntries.vals()) {
            adminPrincipals.put(admin, true);
        };

        // Restore membership data from stable storage
        daoMembers := HashMap.fromIter<Text, [DAOMembership]>(
            daoMembersEntries.vals(),
            daoMembersEntries.size(),
            Text.equal,
            Text.hash
        );

        userMemberships := HashMap.fromIter<Principal, [Text]>(
            userMembershipsEntries.vals(),
            userMembershipsEntries.size(),
            Principal.equal,
            Principal.hash
        );

        // Restore welcome popup tracking from stable storage
        hasSeenWelcome := HashMap.fromIter<Principal, Bool>(
            hasSeenWelcomeEntries.vals(),
            hasSeenWelcomeEntries.size(),
            Principal.equal,
            Principal.hash
        );

        // Restore registry canister reference if available
        switch (registryCanisterId) {
            case (?id) {
                registryCanister := ?(actor (Principal.toText(id)) : RegistryService);
            };
            case null {};
        };

        // Restore analytics canister reference if available
        switch (analyticsCanisterId) {
            case (?id) {
                analyticsCanister := ?(actor (Principal.toText(id)) : AnalyticsService);
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
        registry_id: ?Principal,
        analytics_id: ?Principal,
        config: Types.DAOConfig
    ) : async Result<(), Text> {
        // Prevent double initialization
        if (initialized) {
            return #err("DAO already initialized");
        };

        daoName := name;
        daoDescription := description;
        
        // Store DAO configuration
        daoConfig := ?config;
        
        // Set initial admins - these users can manage DAO configuration
        for (admin in initialAdmins.vals()) {
            adminPrincipals.put(admin, true);
        };

        // Always add the deployer as an admin for initial setup
        adminPrincipals.put(msg.caller, true);
        daoCreator := ?msg.caller;

        // Set registry canister reference
        switch (registry_id) {
            case (?id) {
                registryCanisterId := ?id;
                registryCanister := ?(actor (Principal.toText(id)) : RegistryService);
            };
            case null {};
        };

        // Set analytics canister reference
        switch (analytics_id) {
            case (?id) {
                analyticsCanisterId := ?id;
                analyticsCanister := ?(actor (Principal.toText(id)) : AnalyticsService);
            };
            case null {};
        };

        initialized := true;
        
        // Record DAO creation event
        switch (analyticsCanister) {
            case (?analytics) {
                let _ = await analytics.recordEvent(
                    #DAO_CREATED,
                    ?name,
                    ?msg.caller,
                    [("category", config.category), ("description", description)],
                    null
                );
            };
            case null {};
        };
        
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

    private func syncRegistryMetadata() : async () {
        if (not registeredInRegistry) {
            return;
        };
        switch (registryCanister, registryDaoId, getCurrentDAOConfig()) {
            case (?registry, ?dao_id, ?config) {
                let result = await registry.updateDAOMetadata(
                    dao_id,
                    null,
                    null,
                    null,
                    null,
                    ?config.website,
                    config.logoUrl,
                    config.logoAssetId,
                    config.logoType,
                    ?config.tokenSymbol
                );
                switch (result) {
                    case (#ok()) {};
                    case (#err(error)) {
                        Debug.print("Failed to sync registry metadata: " # error);
                    };
                };
            };
            case _ {};
        };
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
                switch (getCurrentDAOConfig()) {
                    case (?config) {
                        let result = await registry.registerDAO(
                            daoName,
                            daoDescription,
                            config.category,
                            true, // is_public - could be configurable
                            Principal.fromActor(DAOMain),
                            ?config.website,
                            config.logoUrl,
                            config.logoAssetId,
                            config.logoType,
                            ?config.tokenSymbol
                        );
                        
                        switch (result) {
                            case (#ok(dao_id)) {
                                registeredInRegistry := true;
                                registryDaoId := ?dao_id;
                                if (daoCreator == null) {
                                    daoCreator := ?msg.caller;
                                };
                                
                                // Add the creator as the first member with CREATOR role when registering
                                let creatorMembership : DAOMembership = {
                                    daoId = dao_id;
                                    principal = msg.caller;
                                    role = #CREATOR;
                                    joinedAt = Time.now() / 1_000_000;
                                    votingPower = 0; // Will be set based on token allocation
                                    totalStaked = 0;
                                };
                                
                                daoMembers.put(dao_id, [creatorMembership]);
                                userMemberships.put(msg.caller, [dao_id]);
                                totalMembers := 1;
                                
                                await syncRegistryMetadata();
                                Debug.print("DAO registered with registry: " # dao_id);
                                Debug.print("Creator added as first member with CREATOR role");
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
    public shared(_msg) func updateRegistryStats() : async Result<(), Text> {
        if (not registeredInRegistry) {
            return #err("DAO not registered with registry");
        };

        switch (registryCanister) {
            case (?registry) {
                // Get current DAO stats
                let stats = await getDAOStats();
                
                let daoId = switch (registryDaoId) {
                    case (?id) id;
                    case null return #err("DAO registry identifier unavailable");
                };
                
                let result = await registry.updateDAOStats(
                    daoId,
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
        let currentConfig = getCurrentDAOConfig();
        let category = switch (currentConfig) {
            case (?config) ?config.category;
            case null null;
        };
        
        let token_symbol = switch (currentConfig) {
            case (?config) ?config.tokenSymbol;
            case null null;
        };
        
        let website = switch (currentConfig) {
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


    private func defaultAllocations() : DAOConfigAllocations {
        {
            treasuryAllocation = 40;
            communityAllocation = 60;
        }
    };

    private func resolveAllocations() : DAOConfigAllocations {
        switch (daoConfigAllocations) {
            case (?alloc) alloc;
            case null defaultAllocations();
        }
    };

    private func toStableConfig(config: DAOConfig) : DAOConfigStable {
        {
            category = config.category;
            website = config.website;
            selectedModules = config.selectedModules;
            moduleFeatures = config.moduleFeatures;
            tokenName = config.tokenName;
            tokenSymbol = config.tokenSymbol;
            totalSupply = config.totalSupply;
            initialPrice = config.initialPrice;
            votingPeriod = config.votingPeriod;
            quorumThreshold = config.quorumThreshold;
            proposalThreshold = config.proposalThreshold;
            logoAssetId = config.logoAssetId;
            logoType = config.logoType;
            logoUrl = config.logoUrl;
            fundingGoal = config.fundingGoal;
            fundingDuration = config.fundingDuration;
            minInvestment = config.minInvestment;
            termsAccepted = config.termsAccepted;
            kycRequired = config.kycRequired;
        }
    };

    private func toRuntimeConfig(stableConfig: DAOConfigStable, allocations: DAOConfigAllocations) : DAOConfig {
        {
            category = stableConfig.category;
            website = stableConfig.website;
            selectedModules = stableConfig.selectedModules;
            moduleFeatures = stableConfig.moduleFeatures;
            tokenName = stableConfig.tokenName;
            tokenSymbol = stableConfig.tokenSymbol;
            totalSupply = stableConfig.totalSupply;
            initialPrice = stableConfig.initialPrice;
            treasuryAllocation = allocations.treasuryAllocation;
            communityAllocation = allocations.communityAllocation;
            votingPeriod = stableConfig.votingPeriod;
            quorumThreshold = stableConfig.quorumThreshold;
            proposalThreshold = stableConfig.proposalThreshold;
            logoAssetId = stableConfig.logoAssetId;
            logoType = stableConfig.logoType;
            logoUrl = stableConfig.logoUrl;
            fundingGoal = stableConfig.fundingGoal;
            fundingDuration = stableConfig.fundingDuration;
            minInvestment = stableConfig.minInvestment;
            termsAccepted = stableConfig.termsAccepted;
            kycRequired = stableConfig.kycRequired;
        }
    };

    private func getCurrentDAOConfig() : ?DAOConfig {
        switch (cachedDaoConfig) {
            case (?config) ?config;
            case null {
                switch (daoConfig) {
                    case (?stableConfig) {
                        let merged = toRuntimeConfig(stableConfig, resolveAllocations());
                        cachedDaoConfig := ?merged;
                        ?merged;
                    };
                    case null null;
                }
            };
        }
    };

    private func persistDAOConfig(config: DAOConfig) {
        daoConfig := ?toStableConfig(config);
        daoConfigAllocations := ?{
            treasuryAllocation = config.treasuryAllocation;
            communityAllocation = config.communityAllocation;
        };
        cachedDaoConfig := ?config;
    };

    // DAO configuration
    public shared(msg) func setDAOConfig(config: DAOConfig) : async Result<Text, Text> {
        if (not isAdmin(msg.caller)) {
            return #err("Only admins can set DAO configuration");
        };
        if (daoCreator == null) {
            daoCreator := ?msg.caller;
        };
        persistDAOConfig(config);
        Debug.print("DAO configuration saved");
        Debug.print("Caller (creator): " # Principal.toText(msg.caller));
        
        // Try to register with registry
        if (not registeredInRegistry) {
            Debug.print("Attempting registry registration...");
            
            switch (await registerWithRegistry()) {
                case (#ok(dao_id)) {
                    // SUCCESS: registerWithRegistry() already added creator as member
                    Debug.print("[ok] Registry registration successful!");
                    Debug.print("   Registry DAO ID: " # dao_id);
                    Debug.print("   Creator added as member via registerWithRegistry()");
                    
                    // Verify member was added
                    let members = switch (daoMembers.get(dao_id)) {
                        case (?m) m;
                        case null [];
                    };
                    Debug.print("   Total members now: " # Nat.toText(members.size()));
                    
                    // Return the DAO ID so frontend knows what ID to use
                    #ok(dao_id)
                };
                case (#err(error)) {
                    // FAILURE: Registry failed, add creator manually as fallback
                    Debug.print("[warn] Registry registration failed: " # error);
                    Debug.print("   Adding creator as member locally (fallback mode)");
                    
                    if (daoCreator == null) {
                        daoCreator := ?msg.caller;
                    };
                    
                    // Generate fallback DAO ID
                    let timestamp : Int = Time.now() / 1_000_000;
                    let fallbackDaoId = "dao-" # Int.toText(timestamp);
                    
                    Debug.print("   Using fallback DAO ID: " # fallbackDaoId);
                    
                    // Check if creator already exists (shouldn't, but be safe)
                    let existingMembers = switch (daoMembers.get(fallbackDaoId)) {
                        case (?members) members;
                        case null [];
                    };
                    
                    let alreadyMember = Array.find<DAOMembership>(
                        existingMembers,
                        func(m) = Principal.equal(m.principal, msg.caller)
                    );
                    
                    if (alreadyMember == null) {
                        // Add creator as CREATOR member
                        let creatorMembership : DAOMembership = {
                            daoId = fallbackDaoId;
                            principal = msg.caller;
                            role = #CREATOR;
                            joinedAt = Time.now() / 1_000_000;
                            votingPower = 0;
                            totalStaked = 0;
                        };
                        
                        let updatedMembers = Array.append<DAOMembership>(
                            existingMembers,
                            [creatorMembership]
                        );
                        daoMembers.put(fallbackDaoId, updatedMembers);
                        
                        // Add to user's membership list
                        let currentDAOs = switch (userMemberships.get(msg.caller)) {
                            case (?daos) daos;
                            case null [];
                        };
                        
                        let daoInList = Array.find<Text>(currentDAOs, func(d) = d == fallbackDaoId);
                        if (daoInList == null) {
                            let updatedDAOs = Array.append<Text>(currentDAOs, [fallbackDaoId]);
                            userMemberships.put(msg.caller, updatedDAOs);
                        };
                        
                        totalMembers += 1;
                        registryDaoId := ?fallbackDaoId; // Store fallback ID
                        
                        Debug.print("[ok] Creator added as member in fallback mode");
                        Debug.print("   Principal: " # Principal.toText(msg.caller));
                        Debug.print("   DAO ID: " # fallbackDaoId);
                        Debug.print("   Role: CREATOR");
                        Debug.print("   Total members: " # Nat.toText(updatedMembers.size()));
                    } else {
                        Debug.print("   Creator already exists as member");
                    };
                    
                    // Return the fallback DAO ID
                    #ok(fallbackDaoId)
                };
            };
        } else {
            Debug.print("Already registered in registry, syncing metadata...");
            await syncRegistryMetadata();
            
            // Return existing registry ID
            switch (registryDaoId) {
                case (?id) #ok(id);
                case null #err("DAO registered but no ID found");
            };
        };
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

        // Initialize user settings with no fields locked
        let initialSettings : UserSettings = {
            displayName = displayName;
            email = null;
            bio = bio;
            website = null;
            privacy = {
                showProfile = {
                    displayName = true;  // Always true
                    bio = true;          // Default visible
                    website = true;      // Default visible
                };
                showInvestments = false;
                showActivity = true;
            };
            lockedFields = {
                displayName = false;
                email = false;
                bio = false;
                website = false;
            };
            createdAt = Time.now() / 1_000_000;
        };

        userProfiles.put(caller, userProfile);
        userSettings.put(caller, initialSettings);
        totalMembers += 1;

        // Record user registration event
        switch (analyticsCanister) {
            case (?analytics) {
                let _ = await analytics.recordEvent(
                    #USER_JOINED,
                    null,
                    ?caller,
                    [("displayName", displayName), ("bio", bio)],
                    null
                );
            };
            case null {};
        };

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

        // Initialize user settings
        let initialSettings : UserSettings = {
            displayName = displayName;
            email = null;
            bio = bio;
            website = null;
            privacy = {
                showProfile = {
                    displayName = true;  // Always true
                    bio = true;          // Default visible
                    website = true;      // Default visible
                };
                showInvestments = false;
                showActivity = true;
            };
            lockedFields = {
                displayName = false;
                email = false;
                bio = false;
                website = false;
            };
            createdAt = Time.now() / 1_000_000;
        };

        userProfiles.put(newUser, userProfile);
        userSettings.put(newUser, initialSettings);

        var membershipAdded = false;
        switch (registryDaoId) {
            case (?daoId) {
                let currentMembers = switch (daoMembers.get(daoId)) {
                    case (?members) members;
                    case null [];
                };

                let alreadyMember = Array.find<DAOMembership>(
                    currentMembers,
                    func(m) = Principal.equal(m.principal, newUser)
                );

                if (alreadyMember == null) {
                    let newMembership : DAOMembership = {
                        daoId = daoId;
                        principal = newUser;
                        role = resolveMemberRole(newUser);
                        joinedAt = Time.now() / 1_000_000;
                        votingPower = 0;
                        totalStaked = 0;
                    };

                    let updatedMembers = Array.append<DAOMembership>(
                        currentMembers,
                        [newMembership]
                    );
                    daoMembers.put(daoId, updatedMembers);
                    membershipAdded := true;
                };

                let currentDAOs = switch (userMemberships.get(newUser)) {
                    case (?daos) daos;
                    case null [];
                };

                let daoInList = Array.find<Text>(currentDAOs, func(d) = d == daoId);
                if (daoInList == null) {
                    let updatedDAOs = Array.append<Text>(currentDAOs, [daoId]);
                    userMemberships.put(newUser, updatedDAOs);
                };
            };
            case null {
                Debug.print("Warning: adminRegisterUser called before DAO ID assigned. Membership not recorded.");
            };
        };

        if (membershipAdded) {
            totalMembers += 1;
        };

        // Record user registration event
        switch (analyticsCanister) {
            case (?analytics) {
                let _ = await analytics.recordEvent(
                    #USER_JOINED,
                    null,
                    ?newUser,
                    [("displayName", displayName), ("bio", bio), ("registeredBy", "admin")],
                    null
                );
            };
            case null {};
        };

        Debug.print("User registered by admin: " # displayName);
        #ok()
    };

    /**
     * Update user settings with granular field locking
     * Each field locks independently after first edit
     * NO ADMIN OVERRIDE - Users have full control
     */
    public shared(msg) func updateUserSettings(
        displayName: Text,
        email: ?Text,
        bio: Text,
        website: ?Text,
        privacy: {
            showProfile: {
                displayName: Bool;
                bio: Bool;
                website: Bool;
            };
            showInvestments: Bool;
            showActivity: Bool;
        }
    ) : async Result<(), Text> {
        let caller = msg.caller;
        
        switch (userSettings.get(caller)) {
            case null {
                // Create new settings if user doesn't have any (backward compatibility)
                let newSettings : UserSettings = {
                    displayName = displayName;
                    email = email;
                    bio = bio;
                    website = website;
                    privacy = privacy;
                    lockedFields = {
                        displayName = true;
                        email = true;
                        bio = true;
                        website = true;
                    };
                    createdAt = Time.now() / 1_000_000;
                };
                userSettings.put(caller, newSettings);

                // Also update the basic profile
                switch (userProfiles.get(caller)) {
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
                    };
                    case null {
                        return #err("User profile not found. Please register first.");
                    };
                };

                Debug.print("User settings created for: " # displayName);
                #ok()
            };
            case (?currentSettings) {
                // Check which fields are being changed and if they're locked
                var lockedFieldsAttempted : [Text] = [];
                
                if (currentSettings.lockedFields.displayName and displayName != currentSettings.displayName) {
                    lockedFieldsAttempted := Array.append(lockedFieldsAttempted, ["Display Name"]);
                };
                
                if (currentSettings.lockedFields.email) {
                    let currentEmail = switch (currentSettings.email) { case (?e) e; case null "" };
                    let newEmail = switch (email) { case (?e) e; case null "" };
                    if (currentEmail != newEmail) {
                        lockedFieldsAttempted := Array.append(lockedFieldsAttempted, ["Email"]);
                    };
                };
                
                if (currentSettings.lockedFields.bio and bio != currentSettings.bio) {
                    lockedFieldsAttempted := Array.append(lockedFieldsAttempted, ["Bio"]);
                };
                
                if (currentSettings.lockedFields.website) {
                    let currentWebsite = switch (currentSettings.website) { case (?w) w; case null "" };
                    let newWebsite = switch (website) { case (?w) w; case null "" };
                    if (currentWebsite != newWebsite) {
                        lockedFieldsAttempted := Array.append(lockedFieldsAttempted, ["Website"]);
                    };
                };
                
                // If any locked fields were attempted to be changed, reject
                if (lockedFieldsAttempted.size() > 0) {
                    let fieldsText = Text.join(", ", lockedFieldsAttempted.vals());
                    return #err("[warn] These fields cannot be changed: " # fieldsText # ". Each field can only be edited once.");
                };
                
                // Determine which fields are now being locked (first time they're changed)
                let newLockedFields = {
                    displayName = currentSettings.lockedFields.displayName or (displayName != currentSettings.displayName);
                    email = currentSettings.lockedFields.email or (switch (currentSettings.email, email) {
                        case (?ce, ?ne) ce != ne;
                        case (null, ?_) true;
                        case _ false;
                    });
                    // Bio NEVER locks - always editable
                    bio = false;
                    // Website NEVER locks - always editable
                    website = false;
                };
                
                // Update settings (privacy can always be updated)
                let updatedSettings : UserSettings = {
                    displayName = displayName;
                    email = email;
                    bio = bio;
                    website = website;
                    privacy = privacy;
                    lockedFields = newLockedFields;
                    createdAt = currentSettings.createdAt;
                };
                userSettings.put(caller, updatedSettings);

                // Also update the basic profile
                switch (userProfiles.get(caller)) {
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
                    };
                    case null {};
                };

                Debug.print("User settings updated for: " # displayName);
                #ok()
            };
        };
    };

    // Keep old function for backward compatibility (deprecated)
    public shared(msg) func updateUserProfile(displayName: Text, bio: Text) : async Result<(), Text> {
        let caller = msg.caller;
        
        // Check if settings exist and if fields are locked
        switch (userSettings.get(caller)) {
            case (?settings) {
                if (settings.lockedFields.displayName and displayName != settings.displayName) {
                    return #err("Display Name is locked. Use updateUserSettings.");
                };
                if (settings.lockedFields.bio and bio != settings.bio) {
                    return #err("Bio is locked. Use updateUserSettings.");
                };
            };
            case null {};
        };
        
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

    /**
     * Auto-create user profile on first login (eager registration)
     * 
     * This function is called by the frontend when a user logs in with Internet Identity.
     * If the user already exists, it returns their existing profile.
     * If the user is new, it creates a blank profile with default settings.
     * 
     * @returns UserProfile - Always returns a valid profile (never null)
     */
    public shared(msg) func getOrCreateUserProfile() : async UserProfile {
        let caller = msg.caller;
        
        // Check if user already exists
        switch (userProfiles.get(caller)) {
            case (?existingProfile) {
                // User exists - return their profile
                Debug.print("Returning existing profile for: " # Principal.toText(caller));
                return existingProfile;
            };
            case null {
                // New user - create blank profile
                let newProfile : UserProfile = {
                    id = caller;
                    displayName = "";        // Empty (unlocked)
                    bio = "";                // Empty (unlocked)
                    joinedAt = Time.now() / 1_000_000;
                    reputation = 0;
                    totalStaked = 0;
                    votingPower = 0;
                };
                
                // Create default user settings (all fields unlocked)
                let defaultSettings : UserSettings = {
                    displayName = "";
                    email = null;
                    bio = "";
                    website = null;
                    privacy = {
                        showProfile = {
                            displayName = true;  // Always visible (ignored in practice)
                            bio = true;          // Default to visible
                            website = true;      // Default to visible
                        };
                        showInvestments = true;
                        showActivity = true;
                    };
                    lockedFields = {
                        displayName = false;  // Not locked yet
                        email = false;        // Not locked yet
                        bio = false;          // Never locks (unlocked forever)
                        website = false;      // Never locks (unlocked forever)
                    };
                    createdAt = Time.now() / 1_000_000;
                };
                
                // Store in HashMaps
                userProfiles.put(caller, newProfile);
                userSettings.put(caller, defaultSettings);
                
                // Increment total users
                totalMembers += 1;
                
                // Record analytics event
                switch (analyticsCanister) {
                    case (?analytics) {
                        let _ = await analytics.recordEvent(
                            #USER_JOINED,
                            null,
                            ?caller,
                            [("autoRegistered", "true"), ("method", "getOrCreateUserProfile")],
                            null
                        );
                    };
                    case null {};
                };
                
                Debug.print("✨ New user auto-registered: " # Principal.toText(caller));
                
                return newProfile;
            };
        };
    };

    /**
     * Mark that the user has seen and dismissed the welcome popup
     * 
     * This is called when the user interacts with the welcome popup
     * (either clicks "Complete Profile" or "Maybe Later").
     * The popup will never be shown again for this user.
     */
    public shared(msg) func markWelcomeAsSeen() : async () {
        let caller = msg.caller;
        hasSeenWelcome.put(caller, true);
        Debug.print("Welcome popup marked as seen for: " # Principal.toText(caller));
    };

    /**
     * Check if a user has already seen/dismissed the welcome popup
     * 
     * @param userId - Principal of the user to check
     * @returns Bool - true if user has seen the popup, false otherwise
     */
    public query func hasUserSeenWelcome(userId: Principal) : async Bool {
        switch (hasSeenWelcome.get(userId)) {
            case (?seen) seen;
            case null false;
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
        getCurrentDAOConfig()
    };

    public query func getUserProfile(userId: Principal) : async ?UserProfile {
        userProfiles.get(userId)
    };

    // Query function to get user's own settings (full access)
    public query(msg) func getMySettings() : async ?UserSettings {
        userSettings.get(msg.caller)
    };

    // Query function to get public user settings (limited info, respects granular privacy)
    // displayName always visible, bio/website respect privacy settings
    public query func getUserSettings(userId: Principal) : async ?{
        displayName: Text;
        bio: ?Text;  // Only visible if privacy allows
        website: ?Text;  // Only visible if privacy allows
        privacy: {
            showProfile: {
                displayName: Bool;
                bio: Bool;
                website: Bool;
            };
            showInvestments: Bool;
            showActivity: Bool;
        };
    } {
        switch (userSettings.get(userId)) {
            case (?settings) {
                ?{
                    displayName = settings.displayName;  // Always shown
                    bio = if (settings.privacy.showProfile.bio) ?settings.bio else null;
                    website = if (settings.privacy.showProfile.website) settings.website else null;
                    privacy = settings.privacy;
                }
            };
            case null null;
        }
    };

    // Get which fields are locked for current user
    public query(msg) func getMyLockedFields() : async ?{
        displayName: Bool;
        email: Bool;
        bio: Bool;
        website: Bool;
    } {
        switch (userSettings.get(msg.caller)) {
            case (?settings) ?settings.lockedFields;
            case null null;
        }
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

    /**
     * Get Portfolio Stats for a User
     * 
     * Returns aggregated portfolio statistics including:
     * - Total invested amount (from staking)
     * - Number of active projects (DAOs user is member of)
     * - Total returns (from staking rewards)
     * - Total DAO tokens (from staking)
     * 
     * @param userId - Principal ID of the user
     * @returns Portfolio statistics object
     */
    public query func getPortfolioStats(userId: Principal) : async {
        invested: Nat;
        projects: Nat;
        returns: Float;
        tokens: Nat;
    } {
        // Get user's DAO memberships
        let userDAOs = switch (userMemberships.get(userId)) {
            case (?daos) daos.size();
            case null 0;
        };

        // Return portfolio stats
        // Note: Staking data would come from staking canister in full implementation
        // For now, returning basic data that can be enhanced when integrating with staking canister
        {
            invested = 0; // Will be fetched from staking canister
            projects = userDAOs;
            returns = 0.0; // Will be calculated from staking rewards
            tokens = 0; // Will be fetched from staking canister
        }
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

    private func resolveMemberRole(userId: Principal) : MemberRole {
        switch (daoCreator) {
            case (?creator) {
                if (Principal.equal(creator, userId)) {
                    return #CREATOR;
                };
            };
            case null {};
        };
        if (isAdmin(userId)) {
            return #ADMIN;
        };
        #MEMBER
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

    // ==================== MEMBERSHIP MANAGEMENT ====================

    /**
     * Join a DAO as a member
     * Adds the caller to the DAO's member list and tracks the membership
     */
    public shared(msg) func joinDAO(daoId: Text) : async Result<(), Text> {
        let caller = msg.caller;
        
        // Validate DAO ID
        if (daoId == "") {
            return #err("Invalid DAO ID");
        };
        
        // Check if already a member
        let currentMembers = switch (daoMembers.get(daoId)) {
            case (?members) members;
            case null [];
        };
        
        let isMember = Array.find<DAOMembership>(currentMembers, func(m) = Principal.equal(m.principal, caller));
        if (isMember != null) {
            return #err("Already a member of this DAO");
        };
        
        // Create new membership with MEMBER role
        let newMembership : DAOMembership = {
            daoId = daoId;
            principal = caller;
            role = #MEMBER;
            joinedAt = Time.now() / 1_000_000;
            votingPower = 0; // Will be set based on token allocation
            totalStaked = 0;
        };
        
        // Add to DAO members list
        let updatedMembers = Array.append<DAOMembership>(currentMembers, [newMembership]);
        daoMembers.put(daoId, updatedMembers);
        
        // Add to user's memberships
        let currentDAOs = switch (userMemberships.get(caller)) {
            case (?daos) daos;
            case null [];
        };
        let updatedDAOs = Array.append<Text>(currentDAOs, [daoId]);
        userMemberships.put(caller, updatedDAOs);
        
        // Update total members count
        totalMembers += 1;
        
        // Update registry if connected
        if (registeredInRegistry) {
            ignore updateRegistryStats();
        };

        // Record analytics event
        ignore recordAnalyticsEvent(#MEMBER_ADDED, ?daoId, ?caller, [], null);
        
        Debug.print("User " # Principal.toText(caller) # " joined DAO: " # daoId # " with MEMBER role");
        #ok()
    };

    /**
     * Leave a DAO
     * Removes the caller from the DAO's member list
     * Note: CREATOR cannot leave their own DAO
     */
    public shared(msg) func leaveDAO(daoId: Text) : async Result<(), Text> {
        let caller = msg.caller;
        
        // Get current members
        let currentMembers = switch (daoMembers.get(daoId)) {
            case (?members) members;
            case null return #err("DAO not found");
        };
        
        // Check if user is a member
        let membershipOpt = Array.find<DAOMembership>(currentMembers, func(m) = Principal.equal(m.principal, caller));
        
        switch (membershipOpt) {
            case null {
                return #err("Not a member of this DAO");
            };
            case (?membership) {
                // Prevent creator from leaving their own DAO
                switch (membership.role) {
                    case (#CREATOR) {
                        return #err("Creator cannot leave their own DAO");
                    };
                    case _ {};
                };
            };
        };
        
        // Remove from DAO members
        let updatedMembers = Array.filter<DAOMembership>(currentMembers, func(m) = not Principal.equal(m.principal, caller));
        daoMembers.put(daoId, updatedMembers);
        
        // Remove from user's memberships
        let currentDAOs = switch (userMemberships.get(caller)) {
            case (?daos) daos;
            case null return #err("User has no memberships");
        };
        let updatedDAOs = Array.filter<Text>(currentDAOs, func(d) = d != daoId);
        userMemberships.put(caller, updatedDAOs);
        
        // Update total members count
        if (totalMembers > 0) {
            totalMembers -= 1;
        };
        
        // Update registry if connected
        if (registeredInRegistry) {
            ignore updateRegistryStats();
        };

        // Record analytics event
        ignore recordAnalyticsEvent(#MEMBER_REMOVED, ?daoId, ?caller, [], null);
        
        Debug.print("User " # Principal.toText(caller) # " left DAO: " # daoId);
        #ok()
    };

    /**
     * Check if a user is a member of a DAO
     */
    public query func isMember(daoId: Text, userId: Principal) : async Bool {
        let members = switch (daoMembers.get(daoId)) {
            case (?m) m;
            case null return false;
        };
        let found = Array.find<DAOMembership>(members, func(m) = Principal.equal(m.principal, userId));
        found != null
    };

    /**
     * Get all member Principals of a DAO
     */
    public query func getDAOMembers(daoId: Text) : async [Principal] {
        let memberships = switch (daoMembers.get(daoId)) {
            case (?m) m;
            case null return [];
        };
        Array.map<DAOMembership, Principal>(memberships, func(m) = m.principal)
    };

    /**
     * Get member count for a DAO
     */
    public query func getDAOMemberCount(daoId: Text) : async Nat {
        switch (daoMembers.get(daoId)) {
            case (?members) members.size();
            case null 0;
        }
    };

    /**
     * Get all DAOs a user is a member of
     */
    public query func getUserMemberships(userId: Principal) : async [Text] {
        switch (userMemberships.get(userId)) {
            case (?daos) daos;
            case null [];
        }
    };

    /**
     * Get detailed member profiles for a DAO
     * Returns UserProfile information for all members with role and privacy settings
     */
    // Extended member profile with role, website and privacy controls
    public type MemberProfile = {
        id: Principal;
        role: Text;  // "Creator", "Admin", "Member", etc. - Always visible (governance data)
        displayName: Text;
        bio: Text;
        website: Text;
        joinedAt: Int;
        reputation: Nat;
        totalStaked: Nat;
        votingPower: Nat;
        showProfile: Bool;  // Privacy flag for frontend
        showBio: Bool;      // Privacy flag for bio
        showWebsite: Bool;  // Privacy flag for website
    };

    // Helper function to convert MemberRole to Text
    private func roleToText(role: MemberRole) : Text {
        switch (role) {
            case (#CREATOR) "Creator";
            case (#ADMIN) "Admin";
            case (#MEMBER) "Member";
            case (#TREASURER) "Treasurer";
            case (#DELEGATE) "Delegate";
            case (#MULTISIG) "Multisig";
        }
    };

    public query func getDAOMemberProfiles(daoId: Text) : async [MemberProfile] {
        let memberships = switch (daoMembers.get(daoId)) {
            case (?m) m;
            case null return [];
        };
        
        let profiles = Buffer.Buffer<MemberProfile>(0);
        for (membership in memberships.vals()) {
            let memberId = membership.principal;
            
            switch (userProfiles.get(memberId)) {
                case (?profile) {
                    // Respect granular privacy settings from userSettings
                    let profileWithPrivacy = switch (userSettings.get(memberId)) {
                        case (?settings) {
                            // Apply privacy: role always visible (governance data)
                            {
                                id = profile.id;
                                role = roleToText(membership.role);  // Always visible (governance data)
                                displayName = if (settings.privacy.showProfile.displayName) profile.displayName else "Anonymous Member";
                                bio = if (settings.privacy.showProfile.bio) profile.bio else "";
                                website = if (settings.privacy.showProfile.website) {
                                    switch (settings.website) {
                                        case (?w) w;
                                        case null "";
                                    }
                                } else "";
                                joinedAt = membership.joinedAt;  // Use joinedAt from membership
                                reputation = profile.reputation;
                                totalStaked = membership.totalStaked;  // Use from membership
                                votingPower = membership.votingPower;  // Use from membership
                                showProfile = settings.privacy.showProfile.displayName;
                                showBio = settings.privacy.showProfile.bio;
                                showWebsite = settings.privacy.showProfile.website;
                            }
                        };
                        case null {
                            // No settings = show full profile (backward compatibility)
                            {
                                id = profile.id;
                                role = roleToText(membership.role);  // Always visible
                                displayName = profile.displayName;
                                bio = profile.bio;
                                website = "";
                                joinedAt = membership.joinedAt;
                                reputation = profile.reputation;
                                totalStaked = membership.totalStaked;
                                votingPower = membership.votingPower;
                                showProfile = true;
                                showBio = true;
                                showWebsite = true;
                            }
                        };
                    };
                    profiles.add(profileWithPrivacy);
                };
                case null {
                    // Create minimal profile for users without registered profiles
                    let minimalProfile : MemberProfile = {
                        id = memberId;
                        role = roleToText(membership.role);  // Always visible
                        displayName = "Anonymous Member";
                        bio = "";
                        website = "";
                        joinedAt = membership.joinedAt;
                        reputation = 0;
                        totalStaked = membership.totalStaked;
                        votingPower = membership.votingPower;
                        showProfile = false;
                        showBio = false;
                        showWebsite = false;
                    };
                    profiles.add(minimalProfile);
                };
            };
        };
        
        Buffer.toArray(profiles)
    };

    // Helper function to record analytics events
    private func recordAnalyticsEvent(
        eventType: { #DAO_CREATED; #USER_JOINED; #PROPOSAL_CREATED; #VOTE_CAST; #TREASURY_DEPOSIT; #TREASURY_WITHDRAWAL; #TOKENS_STAKED; #TOKENS_UNSTAKED; #REWARDS_CLAIMED; #DAO_UPDATED; #MEMBER_ADDED; #MEMBER_REMOVED },
        daoId: ?Text,
        userId: ?Principal,
        metadata: [(Text, Text)],
        value: ?Float
    ) : async () {
        switch (analyticsCanister) {
            case (?analytics) {
                try {
                    let result = await analytics.recordEvent(eventType, daoId, userId, metadata, value);
                    switch (result) {
                        case (#ok(_)) {};
                        case (#err(e)) Debug.print("Analytics error: " # e);
                    };
                } catch (_) {
                    Debug.print("Failed to record analytics event");
                };
            };
            case null {};
        };
    };

    /**
     * Admin function to manually add a user to a DAO's member list
     * Useful for fixing existing DAOs or adding users without requiring them to click "Join"
     */
    public shared(msg) func addMemberAdmin(daoId: Text, userId: Principal) : async Result<(), Text> {
        if (not isAdmin(msg.caller)) {
            return #err("Only admins can add members directly");
        };

        // Check if already a member
        let currentMembers = switch (daoMembers.get(daoId)) {
            case (?members) members;
            case null [];
        };
        
        let isMember = Array.find<DAOMembership>(currentMembers, func(m) = Principal.equal(m.principal, userId));
        if (isMember != null) {
            return #err("User is already a member");
        };
        
        let assignedRole = resolveMemberRole(userId);
        let newMembership : DAOMembership = {
            daoId = daoId;
            principal = userId;
            role = assignedRole;
            joinedAt = Time.now() / 1_000_000;
            votingPower = 0;
            totalStaked = 0;
        };
        
        // Add to DAO members list
        let updatedMembers = Array.append<DAOMembership>(currentMembers, [newMembership]);
        daoMembers.put(daoId, updatedMembers);
        
        // Add to user's memberships
        let currentDAOs = switch (userMemberships.get(userId)) {
            case (?daos) daos;
            case null [];
        };
        let updatedDAOs = Array.append<Text>(currentDAOs, [daoId]);
        userMemberships.put(userId, updatedDAOs);
        
        // Update total members count
        totalMembers += 1;
        
        Debug.print(
            "Admin added user " # Principal.toText(userId) # " to DAO: " # daoId # " with role: " # roleToText(assignedRole)
        );
        #ok()
    };

    /**
     * ADMIN DEBUG FUNCTION - Fix existing DAOs without members
     * Adds the DAO creator as the first member with CREATOR role
     * 
     * @param daoId - The DAO identifier
     * @param creatorPrincipal - The principal to add as creator
     * @return Success or error message
     */
    public shared(msg) func fixDAOMembership(daoId: Text, creatorPrincipal: Principal) : async Result<(), Text> {
        if (not isAdmin(msg.caller)) {
            return #err("Only admins can fix DAO membership");
        };
        daoCreator := ?creatorPrincipal;
        
        // Check if DAO already has members
        let _currentMembers = switch (daoMembers.get(daoId)) {
            case (?members) {
                if (members.size() > 0) {
                    return #err("DAO already has members. Member count: " # Nat.toText(members.size()));
                };
                members
            };
            case null [];
        };
        
        // Create creator membership
        let creatorMembership : DAOMembership = {
            daoId = daoId;
            principal = creatorPrincipal;
            role = #CREATOR;
            joinedAt = Time.now() / 1_000_000;
            votingPower = 0;
            totalStaked = 0;
        };
        
        // Add to DAO members
        daoMembers.put(daoId, [creatorMembership]);
        
        // Add to user's memberships
        let currentDAOs = switch (userMemberships.get(creatorPrincipal)) {
            case (?daos) daos;
            case null [];
        };
        
        // Only add if not already in list
        let alreadyMember = Array.find<Text>(currentDAOs, func(d) = d == daoId);
        if (alreadyMember == null) {
            let updatedDAOs = Array.append<Text>(currentDAOs, [daoId]);
            userMemberships.put(creatorPrincipal, updatedDAOs);
        };
        
        totalMembers += 1;
        
        Debug.print("[ok] Fixed membership for DAO: " # daoId # " - Added creator: " # Principal.toText(creatorPrincipal));
        #ok()
    };

    // ==================== END MEMBERSHIP MANAGEMENT ====================

    /**
     * Get the current DAO ID (registry ID if registered, null otherwise)
     * Useful for frontend to know which ID to use when querying members
     */
    public query func getCurrentDAOId() : async ?Text {
        registryDaoId
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
