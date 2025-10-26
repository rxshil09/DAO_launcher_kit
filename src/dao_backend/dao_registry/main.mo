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
import Option "mo:base/Option";

import Types "../shared/types";

/**
 * DAO Registry Canister
 * 
 * This canister maintains a global registry of all DAOs in the ecosystem:
 * - Tracks DAO metadata and statistics
 * - Provides discovery and search functionality
 * - Enables public DAO exploration
 * - Maintains DAO categorization and filtering
 * 
 * The registry serves as the central hub for DAO discovery, allowing users
 * to find and join DAOs based on their interests and criteria.
 */
persistent actor DAORegistry {
    // Type aliases for improved code readability
    type Result<T, E> = Result.Result<T, E>;
    type Time = Time.Time;

    // DAO Registry Types
    public type DAOMetadata = {
        dao_id: Text;
        name: Text;
        description: Text;
        creator_principal: Principal;
        creation_date: Time;
        member_count: Nat;
        category: Text;
        is_public: Bool;
        dao_canister_id: Principal;
        website: ?Text;
        logo_url: ?Text;
        logo_asset_id: ?Text; // Asset ID for uploaded logos
        logo_type: ?Text; // 'upload' or 'url'
        token_symbol: ?Text;
        total_value_locked: Nat;
        active_proposals: Nat;
        last_activity: Time;
    };

    public type DAOStats = {
        dao_id: Text;
        member_count: Nat;
        total_proposals: Nat;
        active_proposals: Nat;
        total_staked: Nat;
        treasury_balance: Nat;
        governance_participation: Float;
        last_updated: Time;
    };

    public type SearchFilters = {
        category: ?Text;
        min_members: ?Nat;
        max_members: ?Nat;
        created_after: ?Time;
        created_before: ?Time;
        is_public: ?Bool;
    };

    public type SortOption = {
        #newest;
        #oldest;
        #most_members;
        #most_active;
        #highest_tvl;
    };

    public type PaginationResult<T> = {
        items: [T];
        total_count: Nat;
        page: Nat;
        page_size: Nat;
        has_next: Bool;
        has_previous: Bool;
    };

    // Stable storage for upgrade persistence
    private var nextDAOId : Nat = 1;
    private var daoMetadataEntries : [(Text, DAOMetadata)] = [];
    private var daoStatsEntries : [(Text, DAOStats)] = [];
    private var creatorDAOsEntries : [(Principal, [Text])] = [];
    private var categoryDAOsEntries : [(Text, [Text])] = [];
    private var totalRegisteredDAOs : Nat = 0;

    // Runtime storage - rebuilt from stable storage after upgrades
    private transient var daoMetadata = HashMap.HashMap<Text, DAOMetadata>(100, Text.equal, Text.hash);
    private transient var daoStats = HashMap.HashMap<Text, DAOStats>(100, Text.equal, Text.hash);
    private transient var creatorDAOs = HashMap.HashMap<Principal, [Text]>(50, Principal.equal, Principal.hash);
    private transient var categoryDAOs = HashMap.HashMap<Text, [Text]>(20, Text.equal, Text.hash);

    // Supported categories
    private let supportedCategories = [
        "DeFi", "Gaming", "Social", "NFT", "Infrastructure", 
        "Investment", "Community", "Education", "Art", "Other"
    ];

    // System functions for upgrades
    system func preupgrade() {
        daoMetadataEntries := Iter.toArray(daoMetadata.entries());
        daoStatsEntries := Iter.toArray(daoStats.entries());
        creatorDAOsEntries := Iter.toArray(creatorDAOs.entries());
        categoryDAOsEntries := Iter.toArray(categoryDAOs.entries());
    };

    system func postupgrade() {
        daoMetadata := HashMap.fromIter<Text, DAOMetadata>(
            daoMetadataEntries.vals(), 
            daoMetadataEntries.size(), 
            Text.equal, 
            Text.hash
        );
        daoStats := HashMap.fromIter<Text, DAOStats>(
            daoStatsEntries.vals(), 
            daoStatsEntries.size(), 
            Text.equal, 
            Text.hash
        );
        creatorDAOs := HashMap.fromIter<Principal, [Text]>(
            creatorDAOsEntries.vals(), 
            creatorDAOsEntries.size(), 
            Principal.equal, 
            Principal.hash
        );
        categoryDAOs := HashMap.fromIter<Text, [Text]>(
            categoryDAOsEntries.vals(), 
            categoryDAOsEntries.size(), 
            Text.equal, 
            Text.hash
        );
    };

    // Public functions

    /**
     * Register a new DAO in the global registry
     * 
     * NOTE: Logo is permanently stored during DAO creation.
     * The logo (logo_url, logo_asset_id, logo_type) cannot be changed after initialization.
     * No update function is provided for logo modification to ensure DAO branding permanence.
     */
    public shared(msg) func registerDAO(
        name: Text,
        description: Text,
        category: Text,
        is_public: Bool,
        dao_canister_id: Principal,
        website: ?Text,
        logo_url: ?Text,
        logo_asset_id: ?Text,
        logo_type: ?Text,
        token_symbol: ?Text
    ) : async Result<Text, Text> {
        let caller = msg.caller;
        
        // Validate category
        let validCategory = Array.find<Text>(supportedCategories, func(cat) = cat == category);
        if (validCategory == null) {
            return #err("Invalid category. Supported categories: " # debug_show(supportedCategories));
        };

        // Generate unique DAO ID
        let dao_id = "dao_" # Nat.toText(nextDAOId);
        nextDAOId += 1;

        // Check if DAO already exists
        switch (daoMetadata.get(dao_id)) {
            case (?_) return #err("DAO ID already exists");
            case null {};
        };

        let now = Time.now();
        let metadata : DAOMetadata = {
            dao_id = dao_id;
            name = name;
            description = description;
            creator_principal = caller;
            creation_date = now;
            member_count = 1; // Creator is the first member
            category = category;
            is_public = is_public;
            dao_canister_id = dao_canister_id;
            website = website;
            logo_url = logo_url;
            logo_asset_id = logo_asset_id;
            logo_type = logo_type;
            token_symbol = token_symbol;
            total_value_locked = 0;
            active_proposals = 0;
            last_activity = now;
        };

        let stats : DAOStats = {
            dao_id = dao_id;
            member_count = 1;
            total_proposals = 0;
            active_proposals = 0;
            total_staked = 0;
            treasury_balance = 0;
            governance_participation = 0.0;
            last_updated = now;
        };

        // Store DAO metadata and stats
        daoMetadata.put(dao_id, metadata);
        daoStats.put(dao_id, stats);

        // Update creator mapping
        let creatorDAOsList = switch (creatorDAOs.get(caller)) {
            case (?daos) daos;
            case null [];
        };
        let updatedCreatorDAOs = Array.append<Text>(creatorDAOsList, [dao_id]);
        creatorDAOs.put(caller, updatedCreatorDAOs);

        // Update category mapping
        let categoryDAOsList = switch (categoryDAOs.get(category)) {
            case (?daos) daos;
            case null [];
        };
        let updatedCategoryDAOs = Array.append<Text>(categoryDAOsList, [dao_id]);
        categoryDAOs.put(category, updatedCategoryDAOs);

        totalRegisteredDAOs += 1;

        Debug.print("DAO registered: " # name # " (ID: " # dao_id # ")");
        #ok(dao_id)
    };

    /**
     * Get all public DAOs with pagination
     */
    public query func getAllPublicDAOs(page: Nat, page_size: Nat) : async PaginationResult<DAOMetadata> {
        let publicDAOs = Buffer.Buffer<DAOMetadata>(0);
        
        for (metadata in daoMetadata.vals()) {
            if (metadata.is_public) {
                publicDAOs.add(metadata);
            };
        };

        let allPublicDAOs = Buffer.toArray(publicDAOs);
        let total_count = allPublicDAOs.size();
        
        // Calculate pagination
        let start_index = page * page_size;
        let end_index = Nat.min(start_index + page_size, total_count);
        
        let paginatedItems = if (start_index >= total_count) {
            []
        } else {
            Array.tabulate<DAOMetadata>(
                end_index - start_index,
                func(i) = allPublicDAOs[start_index + i]
            )
        };

        {
            items = paginatedItems;
            total_count = total_count;
            page = page;
            page_size = page_size;
            has_next = end_index < total_count;
            has_previous = page > 0;
        }
    };

    /**
     * Get DAOs created by a specific user
     */
    public query func getDAOsByCreator(creator: Principal) : async [DAOMetadata] {
        let creatorDAOsList = switch (creatorDAOs.get(creator)) {
            case (?daos) daos;
            case null return [];
        };

        let result = Buffer.Buffer<DAOMetadata>(0);
        for (dao_id in creatorDAOsList.vals()) {
            switch (daoMetadata.get(dao_id)) {
                case (?metadata) result.add(metadata);
                case null {};
            };
        };

        Buffer.toArray(result)
    };

    /**
     * Search DAOs with filters and sorting
     */
    public query func searchDAOs(
        searchQuery: Text,
        filters: ?SearchFilters,
        sort: ?SortOption,
        page: Nat,
        page_size: Nat
    ) : async PaginationResult<DAOMetadata> {
        let matchingDAOs = Buffer.Buffer<DAOMetadata>(0);
        let queryLower = Text.toLowercase(searchQuery);

        for (metadata in daoMetadata.vals()) {
            // Only include public DAOs in search results
            if (metadata.is_public) {
                // Text search
                let nameMatch = Text.contains(Text.toLowercase(metadata.name), #text queryLower);
                let descMatch = Text.contains(Text.toLowercase(metadata.description), #text queryLower);
                let textMatch = searchQuery == "" or nameMatch or descMatch;

                if (textMatch) {
                    // Apply filters
                    var passesFilters = true;
                    switch (filters) {
                        case (?f) {
                            // Category filter
                            switch (f.category) {
                                case (?cat) {
                                    if (metadata.category != cat) {
                                        passesFilters := false;
                                    };
                                };
                                case null {};
                            };

                            // Member count filters
                            if (passesFilters) {
                                switch (f.min_members) {
                                    case (?min) {
                                        if (metadata.member_count < min) {
                                            passesFilters := false;
                                        };
                                    };
                                    case null {};
                                };
                            };

                            if (passesFilters) {
                                switch (f.max_members) {
                                    case (?max) {
                                        if (metadata.member_count > max) {
                                            passesFilters := false;
                                        };
                                    };
                                    case null {};
                                };
                            };

                            // Date filters
                            if (passesFilters) {
                                switch (f.created_after) {
                                    case (?after) {
                                        if (metadata.creation_date < after) {
                                            passesFilters := false;
                                        };
                                    };
                                    case null {};
                                };
                            };

                            if (passesFilters) {
                                switch (f.created_before) {
                                    case (?before) {
                                        if (metadata.creation_date > before) {
                                            passesFilters := false;
                                        };
                                    };
                                    case null {};
                                };
                            };
                        };
                        case null {};
                    };

                    if (passesFilters) {
                        matchingDAOs.add(metadata);
                    };
                };
            };
        };

        // Sort results
        let sortedDAOs = switch (sort) {
            case (?#newest) {
                Array.sort(Buffer.toArray(matchingDAOs), func(a: DAOMetadata, b: DAOMetadata) : {#less; #equal; #greater} {
                    if (a.creation_date > b.creation_date) #less
                    else if (a.creation_date < b.creation_date) #greater
                    else #equal
                })
            };
            case (?#oldest) {
                Array.sort(Buffer.toArray(matchingDAOs), func(a: DAOMetadata, b: DAOMetadata) : {#less; #equal; #greater} {
                    if (a.creation_date < b.creation_date) #less
                    else if (a.creation_date > b.creation_date) #greater
                    else #equal
                })
            };
            case (?#most_members) {
                Array.sort(Buffer.toArray(matchingDAOs), func(a: DAOMetadata, b: DAOMetadata) : {#less; #equal; #greater} {
                    if (a.member_count > b.member_count) #less
                    else if (a.member_count < b.member_count) #greater
                    else #equal
                })
            };
            case (?#most_active) {
                Array.sort(Buffer.toArray(matchingDAOs), func(a: DAOMetadata, b: DAOMetadata) : {#less; #equal; #greater} {
                    if (a.last_activity > b.last_activity) #less
                    else if (a.last_activity < b.last_activity) #greater
                    else #equal
                })
            };
            case (?#highest_tvl) {
                Array.sort(Buffer.toArray(matchingDAOs), func(a: DAOMetadata, b: DAOMetadata) : {#less; #equal; #greater} {
                    if (a.total_value_locked > b.total_value_locked) #less
                    else if (a.total_value_locked < b.total_value_locked) #greater
                    else #equal
                })
            };
            case null Buffer.toArray(matchingDAOs); // No sorting
        };

        let total_count = sortedDAOs.size();
        
        // Calculate pagination
        let start_index = page * page_size;
        let end_index = Nat.min(start_index + page_size, total_count);
        
        let paginatedItems = if (start_index >= total_count) {
            []
        } else {
            Array.tabulate<DAOMetadata>(
                end_index - start_index,
                func(i) = sortedDAOs[start_index + i]
            )
        };

        {
            items = paginatedItems;
            total_count = total_count;
            page = page;
            page_size = page_size;
            has_next = end_index < total_count;
            has_previous = page > 0;
        }
    };

    /**
     * Get DAOs by category
     */
    public query func getDAOsByCategory(category: Text, page: Nat, page_size: Nat) : async PaginationResult<DAOMetadata> {
        let categoryDAOsList = switch (categoryDAOs.get(category)) {
            case (?daos) daos;
            case null return {
                items = [];
                total_count = 0;
                page = page;
                page_size = page_size;
                has_next = false;
                has_previous = false;
            };
        };

        let result = Buffer.Buffer<DAOMetadata>(0);
        for (dao_id in categoryDAOsList.vals()) {
            switch (daoMetadata.get(dao_id)) {
                case (?metadata) {
                    if (metadata.is_public) {
                        result.add(metadata);
                    };
                };
                case null {};
            };
        };

        let allCategoryDAOs = Buffer.toArray(result);
        let total_count = allCategoryDAOs.size();
        
        // Calculate pagination
        let start_index = page * page_size;
        let end_index = Nat.min(start_index + page_size, total_count);
        
        let paginatedItems = if (start_index >= total_count) {
            []
        } else {
            Array.tabulate<DAOMetadata>(
                end_index - start_index,
                func(i) = allCategoryDAOs[start_index + i]
            )
        };

        {
            items = paginatedItems;
            total_count = total_count;
            page = page;
            page_size = page_size;
            has_next = end_index < total_count;
            has_previous = page > 0;
        }
    };

    /**
     * Get DAO statistics
     */
    public query func getDAOStats(dao_id: Text) : async ?DAOStats {
        daoStats.get(dao_id)
    };

    /**
     * Update DAO statistics (called by DAO canisters)
     */
    public shared(msg) func updateDAOStats(
        dao_id: Text,
        member_count: ?Nat,
        total_proposals: ?Nat,
        active_proposals: ?Nat,
        total_staked: ?Nat,
        treasury_balance: ?Nat,
        governance_participation: ?Float
    ) : async Result<(), Text> {
        // Verify caller is the DAO canister
        switch (daoMetadata.get(dao_id)) {
            case (?metadata) {
                if (metadata.dao_canister_id != msg.caller) {
                    return #err("Only the DAO canister can update its stats");
                };
            };
            case null return #err("DAO not found");
        };

        let currentStats = switch (daoStats.get(dao_id)) {
            case (?stats) stats;
            case null return #err("DAO stats not found");
        };

        let updatedStats : DAOStats = {
            dao_id = currentStats.dao_id;
            member_count = Option.get(member_count, currentStats.member_count);
            total_proposals = Option.get(total_proposals, currentStats.total_proposals);
            active_proposals = Option.get(active_proposals, currentStats.active_proposals);
            total_staked = Option.get(total_staked, currentStats.total_staked);
            treasury_balance = Option.get(treasury_balance, currentStats.treasury_balance);
            governance_participation = Option.get(governance_participation, currentStats.governance_participation);
            last_updated = Time.now() / 1_000_000;
        };

        daoStats.put(dao_id, updatedStats);

        // Update metadata member count and activity
        switch (daoMetadata.get(dao_id)) {
            case (?metadata) {
                let updatedMetadata = {
                    dao_id = metadata.dao_id;
                    name = metadata.name;
                    description = metadata.description;
                    creator_principal = metadata.creator_principal;
                    creation_date = metadata.creation_date;
                    member_count = Option.get(member_count, metadata.member_count);
                    category = metadata.category;
                    is_public = metadata.is_public;
                    dao_canister_id = metadata.dao_canister_id;
                    website = metadata.website;
                    logo_url = metadata.logo_url;
                    logo_asset_id = metadata.logo_asset_id;
                    logo_type = metadata.logo_type;
                    token_symbol = metadata.token_symbol;
                    total_value_locked = Option.get(total_staked, metadata.total_value_locked);
                    active_proposals = Option.get(active_proposals, metadata.active_proposals);
                    last_activity = Time.now() / 1_000_000;
                };
                daoMetadata.put(dao_id, updatedMetadata);
            };
            case null {};
        };

        #ok()
    };

    /**
     * Update DAO metadata (admin only)
     */
    public shared(msg) func updateDAOMetadata(
        dao_id: Text,
        name: ?Text,
        description: ?Text,
        category: ?Text,
        is_public: ?Bool,
        website: ?Text,
        logo_url: ?Text,
        logo_asset_id: ?Text,
        logo_type: ?Text,
        token_symbol: ?Text
    ) : async Result<(), Text> {
        switch (daoMetadata.get(dao_id)) {
            case (?metadata) {
                // Verify caller is the creator or DAO canister
                if (metadata.creator_principal != msg.caller and metadata.dao_canister_id != msg.caller) {
                    return #err("Only the DAO creator or canister can update metadata");
                };

                // Validate new category if provided
                switch (category) {
                    case (?cat) {
                        let validCategory = Array.find<Text>(supportedCategories, func(c) = c == cat);
                        if (validCategory == null) {
                            return #err("Invalid category");
                        };
                    };
                    case null {};
                };

                let updatedMetadata = {
                    dao_id = metadata.dao_id;
                    name = Option.get(name, metadata.name);
                    description = Option.get(description, metadata.description);
                    creator_principal = metadata.creator_principal;
                    creation_date = metadata.creation_date;
                    member_count = metadata.member_count;
                    category = Option.get(category, metadata.category);
                    is_public = Option.get(is_public, metadata.is_public);
                    dao_canister_id = metadata.dao_canister_id;
                    website = website;
                    logo_url = logo_url;
                    logo_asset_id = switch (logo_asset_id) { case (?value) ?value; case null metadata.logo_asset_id };
                    logo_type = switch (logo_type) { case (?value) ?value; case null metadata.logo_type };
                    token_symbol = switch (token_symbol) { case (?value) ?value; case null metadata.token_symbol };
                    total_value_locked = metadata.total_value_locked;
                    active_proposals = metadata.active_proposals;
                    last_activity = Time.now();
                };

                daoMetadata.put(dao_id, updatedMetadata);
                #ok()
            };
            case null #err("DAO not found");
        }
    };

    /**
     * Get DAO metadata by ID
     */
    public query func getDAOMetadata(dao_id: Text) : async ?DAOMetadata {
        daoMetadata.get(dao_id)
    };

    /**
     * Get supported categories
     */
    public query func getSupportedCategories() : async [Text] {
        supportedCategories
    };

    /**
     * Get registry statistics
     */
    public query func getRegistryStats() : async {
        total_daos: Nat;
        public_daos: Nat;
        categories: [(Text, Nat)];
        total_members: Nat;
        total_tvl: Nat;
    } {
        var publicDAOCount = 0;
        var totalMembers = 0;
        var totalTVL = 0;
        let categoryCount = HashMap.HashMap<Text, Nat>(10, Text.equal, Text.hash);

        for (metadata in daoMetadata.vals()) {
            if (metadata.is_public) {
                publicDAOCount += 1;
                totalMembers += metadata.member_count;
                totalTVL += metadata.total_value_locked;

                let currentCount = switch (categoryCount.get(metadata.category)) {
                    case (?count) count;
                    case null 0;
                };
                categoryCount.put(metadata.category, currentCount + 1);
            };
        };

        {
            total_daos = totalRegisteredDAOs;
            public_daos = publicDAOCount;
            categories = Iter.toArray(categoryCount.entries());
            total_members = totalMembers;
            total_tvl = totalTVL;
        }
    };

    /**
     * Get trending DAOs (most active recently)
     */
    public query func getTrendingDAOs(limit: Nat) : async [DAOMetadata] {
        let publicDAOs = Buffer.Buffer<DAOMetadata>(0);
        
        for (metadata in daoMetadata.vals()) {
            if (metadata.is_public) {
                publicDAOs.add(metadata);
            };
        };

        let allPublicDAOs = Buffer.toArray(publicDAOs);
        let sortedByActivity = Array.sort(allPublicDAOs, func(a: DAOMetadata, b: DAOMetadata) : {#less; #equal; #greater} {
            if (a.last_activity > b.last_activity) #less
            else if (a.last_activity < b.last_activity) #greater
            else #equal
        });

        if (sortedByActivity.size() <= limit) {
            sortedByActivity
        } else {
            Array.tabulate<DAOMetadata>(limit, func(i) = sortedByActivity[i])
        }
    };

    /**
     * Remove DAO from registry (admin only)
     */
    public shared(msg) func removeDAO(dao_id: Text) : async Result<(), Text> {
        switch (daoMetadata.get(dao_id)) {
            case (?metadata) {
                // Only creator or DAO canister can remove
                if (metadata.creator_principal != msg.caller and metadata.dao_canister_id != msg.caller) {
                    return #err("Only the DAO creator or canister can remove the DAO");
                };

                // Remove from all mappings
                daoMetadata.delete(dao_id);
                daoStats.delete(dao_id);

                // Remove from creator mapping
                let creatorDAOsList = switch (creatorDAOs.get(metadata.creator_principal)) {
                    case (?daos) Array.filter<Text>(daos, func(id) = id != dao_id);
                    case null [];
                };
                creatorDAOs.put(metadata.creator_principal, creatorDAOsList);

                // Remove from category mapping
                let categoryDAOsList = switch (categoryDAOs.get(metadata.category)) {
                    case (?daos) Array.filter<Text>(daos, func(id) = id != dao_id);
                    case null [];
                };
                categoryDAOs.put(metadata.category, categoryDAOsList);

                totalRegisteredDAOs -= 1;

                Debug.print("DAO removed from registry: " # dao_id);
                #ok()
            };
            case null #err("DAO not found");
        }
    };

    /**
     * Remove DAO from registry (controller override)
     * Allows canister controller to remove any DAO (admin/emergency function)
     */
    public shared(msg) func adminRemoveDAO(dao_id: Text) : async Result<(), Text> {
        switch (daoMetadata.get(dao_id)) {
            case (?metadata) {
                // Remove from all mappings
                daoMetadata.delete(dao_id);
                daoStats.delete(dao_id);

                // Remove from creator mapping
                let creatorDAOsList = switch (creatorDAOs.get(metadata.creator_principal)) {
                    case (?daos) Array.filter<Text>(daos, func(id) = id != dao_id);
                    case null [];
                };
                creatorDAOs.put(metadata.creator_principal, creatorDAOsList);

                // Remove from category mapping
                let categoryDAOsList = switch (categoryDAOs.get(metadata.category)) {
                    case (?daos) Array.filter<Text>(daos, func(id) = id != dao_id);
                    case null [];
                };
                categoryDAOs.put(metadata.category, categoryDAOsList);

                totalRegisteredDAOs -= 1;

                Debug.print("DAO removed from registry by admin: " # dao_id # " (caller: " # Principal.toText(msg.caller) # ")");
                #ok()
            };
            case null #err("DAO not found");
        }
    };

    // Health check
    public query func health() : async { status: Text; timestamp: Int; total_daos: Nat } {
        {
            status = "healthy";
            timestamp = Time.now() / 1_000_000;
            total_daos = totalRegisteredDAOs;
        }
    };
}
