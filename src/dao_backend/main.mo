import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

import Types "shared/types";

actor DAOMain {
    type Result<T, E> = Result.Result<T, E>;
    type Proposal = Types.Proposal;
    type Vote = Types.Vote;
    type ProposalId = Types.ProposalId;
    type Stake = Types.Stake;
    type StakeId = Types.StakeId;
    type TokenAmount = Types.TokenAmount;
    type UserProfile = Types.UserProfile;
    type DAOStats = Types.DAOStats;

    // Stable storage for upgrades
    private stable var initialized : Bool = false;
    private stable var daoName : Text = "DAO Launcher";
    private stable var daoDescription : Text = "A decentralized autonomous organization for community governance";
    private stable var totalMembers : Nat = 0;
    private stable var userProfilesEntries : [(Principal, UserProfile)] = [];
    private stable var adminPrincipalsEntries : [Principal] = [];

    // Runtime storage
    private var userProfiles = HashMap.HashMap<Principal, UserProfile>(100, Principal.equal, Principal.hash);
    private var adminPrincipals = HashMap.HashMap<Principal, Bool>(10, Principal.equal, Principal.hash);

    // Canister references (will be set after deployment)
    private var governanceCanister : ?Principal = null;
    private var stakingCanister : ?Principal = null;
    private var treasuryCanister : ?Principal = null;
    private var proposalsCanister : ?Principal = null;

    // System functions for upgrades
    system func preupgrade() {
        userProfilesEntries := Iter.toArray(userProfiles.entries());
        adminPrincipalsEntries := Iter.toArray(adminPrincipals.keys());
    };

    system func postupgrade() {
        userProfiles := HashMap.fromIter<Principal, UserProfile>(
            userProfilesEntries.vals(), 
            userProfilesEntries.size(), 
            Principal.equal, 
            Principal.hash
        );
        
        for (admin in adminPrincipalsEntries.vals()) {
            adminPrincipals.put(admin, true);
        };
    };

    // Initialize the DAO
    public shared(msg) func initialize(
        name: Text,
        description: Text,
        initialAdmins: [Principal]
    ) : async Result<(), Text> {
        if (initialized) {
            return #err("DAO already initialized");
        };

        daoName := name;
        daoDescription := description;
        
        // Set initial admins
        for (admin in initialAdmins.vals()) {
            adminPrincipals.put(admin, true);
        };

        // Add deployer as admin
        adminPrincipals.put(msg.caller, true);

        initialized := true;
        Debug.print("DAO initialized: " # name);
        #ok()
    };

    // Set canister references
    public shared(msg) func setCanisterReferences(
        governance: Principal,
        staking: Principal,
        treasury: Principal,
        proposals: Principal
    ) : async Result<(), Text> {
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
            joinedAt = Time.now();
            reputation = 0;
            totalStaked = 0;
            votingPower = 0;
        };

        userProfiles.put(caller, userProfile);
        totalMembers += 1;

        Debug.print("User registered: " # displayName);
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

    // Utility functions
    private func isAdmin(principal: Principal) : Bool {
        switch (adminPrincipals.get(principal)) {
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
            timestamp = Time.now();
        }
    };

    // Greet function (keeping for compatibility)
    public query func greet(name : Text) : async Text {
        return "Hello, " # name # "! Welcome to " # daoName;
    };
};
