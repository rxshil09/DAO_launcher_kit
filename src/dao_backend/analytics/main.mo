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
import Float "mo:base/Float";
import Int "mo:base/Int";
import Nat32 "mo:base/Nat32";
import Option "mo:base/Option";

/**
 * Analytics Canister
 * 
 * This canister tracks and analyzes platform-wide metrics for the DAO ecosystem:
 * - Event tracking for all DAO activities
 * - Time-series data collection for growth analysis
 * - Platform metrics aggregation and reporting
 * - Real-time statistics for public dashboard
 * 
 * The analytics system provides comprehensive insights into:
 * - Platform growth and adoption
 * - DAO ecosystem health
 * - User engagement patterns
 * - Financial metrics and TVL trends
 * - Governance participation analytics
 */
persistent actor AnalyticsCanister {
    type Result<T, E> = Result.Result<T, E>;
    type Time = Time.Time;

    // Time constants
    private let MILLIS_PER_DAY : Int = 86_400_000;

    // Analytics Event Types
    public type EventType = {
        #DAO_CREATED;
        #USER_JOINED;
        #PROPOSAL_CREATED;
        #VOTE_CAST;
        #TREASURY_DEPOSIT;
        #TREASURY_WITHDRAWAL;
        #TOKENS_STAKED;
        #TOKENS_UNSTAKED;
        #REWARDS_CLAIMED;
        #DAO_UPDATED;
        #MEMBER_ADDED;
        #MEMBER_REMOVED;
    };

    public type AnalyticsEvent = {
        id: Nat;
        event_type: EventType;
        dao_id: ?Text;
        user_id: ?Principal;
        timestamp: Time;
        metadata: [(Text, Text)];
        value: ?Float; // For numerical events (amounts, counts, etc.)
    };

    public type TimeSeriesData = {
        timestamp: Time;
        value: Float;
        metadata: [(Text, Text)];
    };

    public type PlatformMetrics = {
        total_daos: Nat;
        total_users: Nat;
        total_proposals: Nat;
        total_votes: Nat;
        total_tvl: Float;
        active_daos_24h: Nat;
        active_users_24h: Nat;
        proposals_created_24h: Nat;
        votes_cast_24h: Nat;
        treasury_volume_24h: Float;
        last_updated: Time;
    };

    public type ActivitySummary = {
        period: Text; // "daily", "weekly", "monthly"
        start_time: Time;
        end_time: Time;
        dao_creations: Nat;
        user_registrations: Nat;
        proposals_created: Nat;
        votes_cast: Nat;
        treasury_volume: Float;
        staking_volume: Float;
        unique_active_users: Nat;
        unique_active_daos: Nat;
    };

    public type GrowthMetrics = {
        dao_growth_rate: Float; // Percentage growth
        user_growth_rate: Float;
        tvl_growth_rate: Float;
        proposal_growth_rate: Float;
        period_days: Nat;
    };

    public type GovernanceStats = {
        total_proposals: Nat;
        active_proposals: Nat;
        passed_proposals: Nat;
        failed_proposals: Nat;
        average_voting_participation: Float;
        average_proposal_duration: Float;
        most_active_governance_dao: ?Text;
        governance_activity_trend: Float;
    };

    public type TreasuryAnalytics = {
        total_tvl: Float;
        total_deposits: Float;
        total_withdrawals: Float;
        net_flow_24h: Float;
        average_dao_treasury: Float;
        largest_treasury: Float;
        treasury_growth_rate: Float;
        most_active_treasury_dao: ?Text;
    };

    public type CategoryMetrics = {
        category: Text;
        dao_count: Nat;
        total_members: Nat;
        total_tvl: Float;
        avg_dao_size: Float;
        growth_rate: Float;
    };

    // Stable storage for upgrade persistence
    private var nextEventId : Nat = 1;
    private var eventsEntries : [(Nat, AnalyticsEvent)] = [];
    private var dailyMetricsEntries : [(Text, ActivitySummary)] = []; // Key: "YYYY-MM-DD"
    private var weeklyMetricsEntries : [(Text, ActivitySummary)] = []; // Key: "YYYY-WW"
    private var monthlyMetricsEntries : [(Text, ActivitySummary)] = []; // Key: "YYYY-MM"
    private var platformMetricsCache : ?PlatformMetrics = null;
    private var lastCacheUpdate : Time = 0;

    // Runtime storage - rebuilt from stable storage after upgrades
    private transient var events = HashMap.HashMap<Nat, AnalyticsEvent>(1000, Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n) });
    private transient var dailyMetrics = HashMap.HashMap<Text, ActivitySummary>(365, Text.equal, Text.hash);
    private transient var weeklyMetrics = HashMap.HashMap<Text, ActivitySummary>(52, Text.equal, Text.hash);
    private transient var monthlyMetrics = HashMap.HashMap<Text, ActivitySummary>(12, Text.equal, Text.hash);

    // Cache settings
    private let CACHE_DURATION_NS = 5 * 60 * 1_000_000_000; // 5 minutes in nanoseconds

    // System functions for upgrades
    system func preupgrade() {
        eventsEntries := Iter.toArray(events.entries());
        dailyMetricsEntries := Iter.toArray(dailyMetrics.entries());
        weeklyMetricsEntries := Iter.toArray(weeklyMetrics.entries());
        monthlyMetricsEntries := Iter.toArray(monthlyMetrics.entries());
    };

    system func postupgrade() {
        events := HashMap.fromIter<Nat, AnalyticsEvent>(
            eventsEntries.vals(), 
            eventsEntries.size(), 
            Nat.equal, 
            func(n: Nat) : Nat32 { Nat32.fromNat(n) }
        );
        dailyMetrics := HashMap.fromIter<Text, ActivitySummary>(
            dailyMetricsEntries.vals(),
            dailyMetricsEntries.size(),
            Text.equal,
            Text.hash
        );
        weeklyMetrics := HashMap.fromIter<Text, ActivitySummary>(
            weeklyMetricsEntries.vals(),
            weeklyMetricsEntries.size(),
            Text.equal,
            Text.hash
        );
        monthlyMetrics := HashMap.fromIter<Text, ActivitySummary>(
            monthlyMetricsEntries.vals(),
            monthlyMetricsEntries.size(),
            Text.equal,
            Text.hash
        );
    };

    // Public functions

    /**
     * Record an analytics event
     */
    public shared(msg) func recordEvent(
        event_type: EventType,
        dao_id: ?Text,
        user_id: ?Principal,
        metadata: [(Text, Text)],
        value: ?Float
    ) : async Result<Nat, Text> {
        let eventId = nextEventId;
        nextEventId += 1;

        let event : AnalyticsEvent = {
            id = eventId;
            event_type = event_type;
            dao_id = dao_id;
            user_id = user_id;
            timestamp = Time.now() / 1_000_000;
            metadata = metadata;
            value = value;
        };

        events.put(eventId, event);

        // Update daily metrics
        let dateKey = formatDateKey(event.timestamp);
        updateDailyMetrics(dateKey, event);

        // Invalidate cache
        platformMetricsCache := null;

        Debug.print("Analytics event recorded: " # debug_show(event_type) # " (ID: " # Nat.toText(eventId) # ")");
        #ok(eventId)
    };

    /**
     * Get current platform metrics with caching
     */
    public query func getPlatformMetrics() : async PlatformMetrics {
        let now = Time.now();
        
        // Return cached metrics if still valid
        switch (platformMetricsCache) {
            case (?cached) {
                if (now - lastCacheUpdate < CACHE_DURATION_NS) {
                    return cached;
                };
            };
            case null {};
        };

        // Calculate fresh metrics
        calculatePlatformMetrics()
    };

    /**
     * Get time series data for charts
     */
    public query func getTimeSeriesData(metric: Text, timeframe: Text, days: Nat) : async [TimeSeriesData] {
        if (days == 0) { return [] };
        let result = Buffer.Buffer<TimeSeriesData>(0);
        let now = Time.now() / 1_000_000;

        let upper: Nat = days - 1;
        for (i in Iter.range(0, upper)) {
            let dayOffsetNat : Nat = upper - i;
            var timestamp : Int = now;
            var k : Nat = dayOffsetNat;
            // Subtract one day 'k' times to avoid Nat->Int conversions
            while (k > 0) {
                timestamp -= MILLIS_PER_DAY;
                k -= 1;
            };
            let dateKey = formatDateKey(timestamp);

            let value = switch (dailyMetrics.get(dateKey)) {
                case (?summary) {
                    switch (metric) {
                        case ("dao_creations") Float.fromInt(summary.dao_creations);
                        case ("user_registrations") Float.fromInt(summary.user_registrations);
                        case ("proposals_created") Float.fromInt(summary.proposals_created);
                        case ("votes_cast") Float.fromInt(summary.votes_cast);
                        case ("treasury_volume") summary.treasury_volume;
                        case ("staking_volume") summary.staking_volume;
                        case ("active_users") Float.fromInt(summary.unique_active_users);
                        case ("active_daos") Float.fromInt(summary.unique_active_daos);
                        case (_) 0.0;
                    }
                };
                case null 0.0;
            };

            result.add({
                timestamp = timestamp;
                value = value;
                metadata = [("date", dateKey)];
            });
        };

        Buffer.toArray(result)
    };

    /**
     * Get activity summary for a specific period
     */
    public query func getActivitySummary(period: Text) : async ?ActivitySummary {
        let now = Time.now() / 1_000_000;
        let key = switch (period) {
            case ("today") formatDateKey(now);
            case ("this_week") formatWeekKey(now);
            case ("this_month") formatMonthKey(now);
            case (_) formatDateKey(now);
        };

        switch (period) {
            case ("today") dailyMetrics.get(key);
            case ("this_week") weeklyMetrics.get(key);
            case ("this_month") monthlyMetrics.get(key);
            case (_) dailyMetrics.get(key);
        }
    };

    /**
     * Get growth metrics comparing current period to previous
     */
    public query func getGrowthMetrics(days: Nat) : async GrowthMetrics {
        let now = Time.now() / 1_000_000;
        // Compute periodStart by subtracting one day 'days' times
        var periodStart = now;
        var k1 : Nat = days;
        while (k1 > 0) { periodStart -= MILLIS_PER_DAY; k1 -= 1; };
        // Compute previousPeriodStart from periodStart similarly
        var previousPeriodStart = periodStart;
        var k2 : Nat = days;
        while (k2 > 0) { previousPeriodStart -= MILLIS_PER_DAY; k2 -= 1; };

        let currentPeriodEvents = getEventsInPeriod(periodStart, now);
        let previousPeriodEvents = getEventsInPeriod(previousPeriodStart, periodStart);

        let currentDAOs = countEventsByType(currentPeriodEvents, #DAO_CREATED);
        let previousDAOs = countEventsByType(previousPeriodEvents, #DAO_CREATED);
        let daoGrowthRate = calculateGrowthRate(previousDAOs, currentDAOs);

        let currentUsers = countEventsByType(currentPeriodEvents, #USER_JOINED);
        let previousUsers = countEventsByType(previousPeriodEvents, #USER_JOINED);
        let userGrowthRate = calculateGrowthRate(previousUsers, currentUsers);

        let currentTVL = sumEventValues(currentPeriodEvents, #TREASURY_DEPOSIT) - sumEventValues(currentPeriodEvents, #TREASURY_WITHDRAWAL);
        let previousTVL = sumEventValues(previousPeriodEvents, #TREASURY_DEPOSIT) - sumEventValues(previousPeriodEvents, #TREASURY_WITHDRAWAL);
        let tvlGrowthRate = calculateGrowthRate(Int.abs(Float.toInt(previousTVL)), Int.abs(Float.toInt(currentTVL)));

        let currentProposals = countEventsByType(currentPeriodEvents, #PROPOSAL_CREATED);
        let previousProposals = countEventsByType(previousPeriodEvents, #PROPOSAL_CREATED);
        let proposalGrowthRate = calculateGrowthRate(previousProposals, currentProposals);

        {
            dao_growth_rate = daoGrowthRate;
            user_growth_rate = userGrowthRate;
            tvl_growth_rate = tvlGrowthRate;
            proposal_growth_rate = proposalGrowthRate;
            period_days = days;
        }
    };

    /**
     * Get governance statistics
     */
    public query func getGovernanceStats() : async GovernanceStats {
        var totalProposals = 0;
        var totalVotes = 0;
        var proposalDurations = Buffer.Buffer<Float>(0);
        let daoVotingActivity = HashMap.HashMap<Text, Nat>(10, Text.equal, Text.hash);

        for (event in events.vals()) {
            switch (event.event_type) {
                case (#PROPOSAL_CREATED) {
                    totalProposals += 1;
                    switch (event.dao_id) {
                        case (?dao) {
                            let currentCount = switch (daoVotingActivity.get(dao)) {
                                case (?count) count;
                                case null 0;
                            };
                            daoVotingActivity.put(dao, currentCount + 1);
                        };
                        case null {};
                    };
                };
                case (#VOTE_CAST) {
                    totalVotes += 1;
                };
                case (_) {};
            };
        };

        let averageParticipation = if (totalProposals > 0) {
            Float.fromInt(totalVotes) / Float.fromInt(totalProposals)
        } else { 0.0 };

        // Find most active DAO
        var mostActiveDAO : ?Text = null;
        var maxActivity = 0;
        for ((dao, activity) in daoVotingActivity.entries()) {
            if (activity > maxActivity) {
                maxActivity := activity;
                mostActiveDAO := ?dao;
            };
        };

        {
            total_proposals = totalProposals;
            active_proposals = 0; // Would need to query governance canister
            passed_proposals = 0; // Would need to query governance canister
            failed_proposals = 0; // Would need to query governance canister
            average_voting_participation = averageParticipation;
            average_proposal_duration = 7.0; // Default 7 days
            most_active_governance_dao = mostActiveDAO;
            governance_activity_trend = 0.0; // Would calculate based on recent activity
        }
    };

    /**
     * Get treasury analytics
     */
    public query func getTreasuryAnalytics() : async TreasuryAnalytics {
        var totalDeposits = 0.0;
        var totalWithdrawals = 0.0;
        var netFlow24h = 0.0;
        let daoTreasuryActivity = HashMap.HashMap<Text, Float>(10, Text.equal, Text.hash);
        let now = Time.now() / 1_000_000;
        let yesterday = now - MILLIS_PER_DAY;

        for (event in events.vals()) {
            switch (event.event_type) {
                case (#TREASURY_DEPOSIT) {
                    let amount = Option.get(event.value, 0.0);
                    totalDeposits += amount;
                    
                    if (event.timestamp >= yesterday) {
                        netFlow24h += amount;
                    };

                    switch (event.dao_id) {
                        case (?dao) {
                            let currentAmount = switch (daoTreasuryActivity.get(dao)) {
                                case (?amt) amt;
                                case null 0.0;
                            };
                            daoTreasuryActivity.put(dao, currentAmount + amount);
                        };
                        case null {};
                    };
                };
                case (#TREASURY_WITHDRAWAL) {
                    let amount = Option.get(event.value, 0.0);
                    totalWithdrawals += amount;
                    
                    if (event.timestamp >= yesterday) {
                        netFlow24h -= amount;
                    };
                };
                case (_) {};
            };
        };

        // Find most active treasury DAO
        var mostActiveDAO : ?Text = null;
        var maxActivity = 0.0;
        for ((dao, activity) in daoTreasuryActivity.entries()) {
            if (activity > maxActivity) {
                maxActivity := activity;
                mostActiveDAO := ?dao;
            };
        };

        let totalTVL = totalDeposits - totalWithdrawals;
        let daoCount = daoTreasuryActivity.size();
        let averageTreasury = if (daoCount > 0) {
            totalTVL / Float.fromInt(daoCount)
        } else { 0.0 };

        {
            total_tvl = totalTVL;
            total_deposits = totalDeposits;
            total_withdrawals = totalWithdrawals;
            net_flow_24h = netFlow24h;
            average_dao_treasury = averageTreasury;
            largest_treasury = maxActivity;
            treasury_growth_rate = 0.0; // Would calculate based on historical data
            most_active_treasury_dao = mostActiveDAO;
        }
    };

    /**
     * Get category-based metrics
     */
    public query func getCategoryMetrics() : async [CategoryMetrics] {
        let categoryStats = HashMap.HashMap<Text, {
            dao_count: Nat;
            total_members: Nat;
            total_tvl: Float;
        }>(10, Text.equal, Text.hash);

        // This would need to be populated by DAO registry data
        // For now, return empty array as placeholder
        []
    };

    /**
     * Get top performing DAOs
     */
    public query func getTopDAOs(limit: Nat) : async [(Text, Float)] {
        let daoActivity = HashMap.HashMap<Text, Float>(10, Text.equal, Text.hash);

        for (event in events.vals()) {
            switch (event.dao_id) {
                case (?dao) {
                    let currentScore = switch (daoActivity.get(dao)) {
                        case (?score) score;
                        case null 0.0;
                    };
                    
                    let eventScore = switch (event.event_type) {
                        case (#PROPOSAL_CREATED) 10.0;
                        case (#VOTE_CAST) 5.0;
                        case (#USER_JOINED) 3.0;
                        case (#TREASURY_DEPOSIT) Option.get(event.value, 0.0) / 1000.0;
                        case (_) 1.0;
                    };
                    
                    daoActivity.put(dao, currentScore + eventScore);
                };
                case null {};
            };
        };

        let sortedDAOs = Array.sort(
            Iter.toArray(daoActivity.entries()),
            func(a: (Text, Float), b: (Text, Float)) : {#less; #equal; #greater} {
                if (a.1 > b.1) #less
                else if (a.1 < b.1) #greater
                else #equal
            }
        );

        if (sortedDAOs.size() <= limit) {
            sortedDAOs
        } else {
            Array.tabulate<(Text, Float)>(limit, func(i) = sortedDAOs[i])
        }
    };

    /**
     * Get events for a specific time period
     */
    public query func getEventsInTimeframe(
        start_time: Time,
        end_time: Time,
        event_types: ?[EventType]
    ) : async [AnalyticsEvent] {
        let filteredEvents = Buffer.Buffer<AnalyticsEvent>(0);

        for (event in events.vals()) {
            if (event.timestamp >= start_time and event.timestamp <= end_time) {
                let includeEvent = switch (event_types) {
                    case (?types) {
                        Array.find<EventType>(types, func(t) = t == event.event_type) != null
                    };
                    case null true;
                };
                
                if (includeEvent) {
                    filteredEvents.add(event);
                };
            };
        };

        Buffer.toArray(filteredEvents)
    };

    // Helper functions

    private func calculatePlatformMetrics() : PlatformMetrics {
        var totalDAOs = 0;
        var totalUsers = 0;
        var totalProposals = 0;
        var totalVotes = 0;
        var totalTVL = 0.0;
        
        let now = Time.now() / 1_000_000;
        let yesterday = now - MILLIS_PER_DAY;
        
        var activeDAOs24h = 0;
        var activeUsers24h = 0;
        var proposalsCreated24h = 0;
        var votesCast24h = 0;
        var treasuryVolume24h = 0.0;

        let uniqueDAOs24h = HashMap.HashMap<Text, Bool>(10, Text.equal, Text.hash);
        let uniqueUsers24h = HashMap.HashMap<Principal, Bool>(100, Principal.equal, Principal.hash);

        for (event in events.vals()) {
            switch (event.event_type) {
                case (#DAO_CREATED) {
                    totalDAOs += 1;
                    if (event.timestamp >= yesterday) {
                        switch (event.dao_id) {
                            case (?dao) { uniqueDAOs24h.put(dao, true); };
                            case null {};
                        };
                    };
                };
                case (#USER_JOINED) {
                    totalUsers += 1;
                    if (event.timestamp >= yesterday) {
                        switch (event.user_id) {
                            case (?user) { uniqueUsers24h.put(user, true); };
                            case null {};
                        };
                    };
                };
                case (#PROPOSAL_CREATED) {
                    totalProposals += 1;
                    if (event.timestamp >= yesterday) {
                        proposalsCreated24h += 1;
                    };
                };
                case (#VOTE_CAST) {
                    totalVotes += 1;
                    if (event.timestamp >= yesterday) {
                        votesCast24h += 1;
                    };
                };
                case (#TREASURY_DEPOSIT) {
                    let amount = Option.get(event.value, 0.0);
                    totalTVL += amount;
                    if (event.timestamp >= yesterday) {
                        treasuryVolume24h += amount;
                    };
                };
                case (#TREASURY_WITHDRAWAL) {
                    let amount = Option.get(event.value, 0.0);
                    totalTVL -= amount;
                    if (event.timestamp >= yesterday) {
                        treasuryVolume24h += amount;
                    };
                };
                case (_) {};
            };
        };

        let metrics = {
            total_daos = totalDAOs;
            total_users = totalUsers;
            total_proposals = totalProposals;
            total_votes = totalVotes;
            total_tvl = totalTVL;
            active_daos_24h = uniqueDAOs24h.size();
            active_users_24h = uniqueUsers24h.size();
            proposals_created_24h = proposalsCreated24h;
            votes_cast_24h = votesCast24h;
            treasury_volume_24h = treasuryVolume24h;
            last_updated = Time.now() / 1_000_000;
        };

        // Cache the result
        platformMetricsCache := ?metrics;
        lastCacheUpdate := Time.now();

        metrics
    };

    private func updateDailyMetrics(dateKey: Text, event: AnalyticsEvent) {
        let currentSummary = switch (dailyMetrics.get(dateKey)) {
            case (?summary) summary;
            case null {
                {
                    period = "daily";
                    start_time = event.timestamp;
                    end_time = event.timestamp;
                    dao_creations = 0;
                    user_registrations = 0;
                    proposals_created = 0;
                    votes_cast = 0;
                    treasury_volume = 0.0;
                    staking_volume = 0.0;
                    unique_active_users = 0;
                    unique_active_daos = 0;
                }
            };
        };

        let updatedSummary = switch (event.event_type) {
            case (#DAO_CREATED) {
                {
                    period = currentSummary.period;
                    start_time = currentSummary.start_time;
                    end_time = event.timestamp;
                    dao_creations = currentSummary.dao_creations + 1;
                    user_registrations = currentSummary.user_registrations;
                    proposals_created = currentSummary.proposals_created;
                    votes_cast = currentSummary.votes_cast;
                    treasury_volume = currentSummary.treasury_volume;
                    staking_volume = currentSummary.staking_volume;
                    unique_active_users = currentSummary.unique_active_users;
                    unique_active_daos = currentSummary.unique_active_daos;
                }
            };
            case (#USER_JOINED) {
                {
                    period = currentSummary.period;
                    start_time = currentSummary.start_time;
                    end_time = event.timestamp;
                    dao_creations = currentSummary.dao_creations;
                    user_registrations = currentSummary.user_registrations + 1;
                    proposals_created = currentSummary.proposals_created;
                    votes_cast = currentSummary.votes_cast;
                    treasury_volume = currentSummary.treasury_volume;
                    staking_volume = currentSummary.staking_volume;
                    unique_active_users = currentSummary.unique_active_users;
                    unique_active_daos = currentSummary.unique_active_daos;
                }
            };
            case (#PROPOSAL_CREATED) {
                {
                    period = currentSummary.period;
                    start_time = currentSummary.start_time;
                    end_time = event.timestamp;
                    dao_creations = currentSummary.dao_creations;
                    user_registrations = currentSummary.user_registrations;
                    proposals_created = currentSummary.proposals_created + 1;
                    votes_cast = currentSummary.votes_cast;
                    treasury_volume = currentSummary.treasury_volume;
                    staking_volume = currentSummary.staking_volume;
                    unique_active_users = currentSummary.unique_active_users;
                    unique_active_daos = currentSummary.unique_active_daos;
                }
            };
            case (#VOTE_CAST) {
                {
                    period = currentSummary.period;
                    start_time = currentSummary.start_time;
                    end_time = event.timestamp;
                    dao_creations = currentSummary.dao_creations;
                    user_registrations = currentSummary.user_registrations;
                    proposals_created = currentSummary.proposals_created;
                    votes_cast = currentSummary.votes_cast + 1;
                    treasury_volume = currentSummary.treasury_volume;
                    staking_volume = currentSummary.staking_volume;
                    unique_active_users = currentSummary.unique_active_users;
                    unique_active_daos = currentSummary.unique_active_daos;
                }
            };
            case (#TREASURY_DEPOSIT or #TREASURY_WITHDRAWAL) {
                {
                    period = currentSummary.period;
                    start_time = currentSummary.start_time;
                    end_time = event.timestamp;
                    dao_creations = currentSummary.dao_creations;
                    user_registrations = currentSummary.user_registrations;
                    proposals_created = currentSummary.proposals_created;
                    votes_cast = currentSummary.votes_cast;
                    treasury_volume = currentSummary.treasury_volume + Option.get(event.value, 0.0);
                    staking_volume = currentSummary.staking_volume;
                    unique_active_users = currentSummary.unique_active_users;
                    unique_active_daos = currentSummary.unique_active_daos;
                }
            };
            case (#TOKENS_STAKED or #TOKENS_UNSTAKED) {
                {
                    period = currentSummary.period;
                    start_time = currentSummary.start_time;
                    end_time = event.timestamp;
                    dao_creations = currentSummary.dao_creations;
                    user_registrations = currentSummary.user_registrations;
                    proposals_created = currentSummary.proposals_created;
                    votes_cast = currentSummary.votes_cast;
                    treasury_volume = currentSummary.treasury_volume;
                    staking_volume = currentSummary.staking_volume + Option.get(event.value, 0.0);
                    unique_active_users = currentSummary.unique_active_users;
                    unique_active_daos = currentSummary.unique_active_daos;
                }
            };
            case (_) currentSummary;
        };

        dailyMetrics.put(dateKey, updatedSummary);
    };

    private func getEventsInPeriod(startTime: Time, endTime: Time) : [AnalyticsEvent] {
        let filteredEvents = Buffer.Buffer<AnalyticsEvent>(0);
        for (event in events.vals()) {
            if (event.timestamp >= startTime and event.timestamp <= endTime) {
                filteredEvents.add(event);
            };
        };
        Buffer.toArray(filteredEvents)
    };

    private func countEventsByType(events: [AnalyticsEvent], eventType: EventType) : Nat {
        var count = 0;
        for (event in events.vals()) {
            if (event.event_type == eventType) {
                count += 1;
            };
        };
        count
    };

    private func sumEventValues(events: [AnalyticsEvent], eventType: EventType) : Float {
        var sum = 0.0;
        for (event in events.vals()) {
            if (event.event_type == eventType) {
                sum += Option.get(event.value, 0.0);
            };
        };
        sum
    };

    private func calculateGrowthRate(previous: Nat, current: Nat) : Float {
        if (previous == 0) {
            if (current > 0) { 100.0 } else { 0.0 }
        } else {
            ((Float.fromInt(current) - Float.fromInt(previous)) / Float.fromInt(previous)) * 100.0
        }
    };

    private func formatDateKey(timestamp: Time) : Text {
        // Simple date formatting - in production you'd want proper date handling
        let days = timestamp / MILLIS_PER_DAY;
        Nat.toText(Int.abs(days))
    };

    private func formatWeekKey(timestamp: Time) : Text {
        let weeks = timestamp / (7 * MILLIS_PER_DAY);
        Nat.toText(Int.abs(weeks))
    };

    private func formatMonthKey(timestamp: Time) : Text {
        let months = timestamp / (30 * MILLIS_PER_DAY);
        Nat.toText(Int.abs(months))
    };

    // Health check
    public query func health() : async { status: Text; timestamp: Int; total_events: Nat } {
        {
            status = "healthy";
            timestamp = Time.now() / 1_000_000;
            total_events = events.size();
        }
    };
}
