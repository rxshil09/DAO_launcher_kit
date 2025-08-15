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
import Nat32 "mo:base/Nat32";

import Types "../shared/types";

persistent actor ProposalsCanister {
    type Result<T, E> = Result.Result<T, E>;
    type Proposal = Types.Proposal;
    type Vote = Types.Vote;
    type ProposalId = Types.ProposalId;
    type GovernanceConfig = Types.GovernanceConfig;

    // Proposal template types
    public type ProposalTemplate = {
        id: Nat;
        name: Text;
        description: Text;
        category: Text;
        requiredFields: [Text];
        template: Text;
    };

    public type ProposalCategory = {
        id: Text;
        name: Text;
        description: Text;
        color: Text;
    };

    // Stable storage for upgrades
    private var nextProposalId : Nat = 1;
    private var nextTemplateId : Nat = 1;
    private var proposalsEntries : [(ProposalId, Proposal)] = [];
    private var votesEntries : [(Text, Vote)] = []; // Key: proposalId_voter
    private var templatesEntries : [(Nat, ProposalTemplate)] = [];
    private var categoriesEntries : [(Text, ProposalCategory)] = [];
    private var configEntries : [(Text, GovernanceConfig)] = [];

    // Runtime storage
    private transient var proposals = HashMap.HashMap<ProposalId, Proposal>(10, Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n) });
    private transient var votes = HashMap.HashMap<Text, Vote>(100, Text.equal, Text.hash);
    private transient var templates = HashMap.HashMap<Nat, ProposalTemplate>(10, Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n) });
    private transient var categories = HashMap.HashMap<Text, ProposalCategory>(10, Text.equal, Text.hash);
    private transient var config = HashMap.HashMap<Text, GovernanceConfig>(1, Text.equal, Text.hash);

    // Initialize default data
    private func initializeDefaults() {
        // Initialize default configuration
        let defaultConfig : GovernanceConfig = {
            votingPeriod = 7 * 24 * 60 * 60 * 1_000_000_000; // 7 days in nanoseconds
            quorumThreshold = 1000; // Minimum 1000 voting power
            approvalThreshold = 51; // 51% approval needed
            proposalDeposit = 100; // 100 tokens required
            maxProposalsPerUser = 3; // Max 3 active proposals per user
        };
        config.put("default", defaultConfig);

        // Initialize default categories
        let defaultCategories = [
            { id = "governance"; name = "Governance"; description = "Protocol governance and parameter changes"; color = "blue" },
            { id = "treasury"; name = "Treasury"; description = "Treasury management and fund allocation"; color = "green" },
            { id = "technical"; name = "Technical"; description = "Technical upgrades and improvements"; color = "purple" },
            { id = "community"; name = "Community"; description = "Community initiatives and events"; color = "orange" },
            { id = "partnership"; name = "Partnership"; description = "Strategic partnerships and collaborations"; color = "pink" }
        ];

        for (category in defaultCategories.vals()) {
            categories.put(category.id, category);
        };

        // Initialize default templates
        let defaultTemplates = [
            {
                id = 1;
                name = "Treasury Transfer";
                description = "Request funds from the treasury";
                category = "treasury";
                requiredFields = ["recipient", "amount", "reason"];
                template = "Transfer {amount} tokens to {recipient} for {reason}";
            },
            {
                id = 2;
                name = "Parameter Change";
                description = "Change a protocol parameter";
                category = "governance";
                requiredFields = ["parameter", "newValue", "justification"];
                template = "Change {parameter} from current value to {newValue}. Justification: {justification}";
            },
            {
                id = 3;
                name = "Community Initiative";
                description = "Propose a community initiative";
                category = "community";
                requiredFields = ["title", "description", "budget", "timeline"];
                template = "Community Initiative: {title}. Description: {description}. Budget: {budget}. Timeline: {timeline}";
            }
        ];

        for (template in defaultTemplates.vals()) {
            templates.put(template.id, template);
        };

        nextTemplateId := 4;
    };

    // System functions for upgrades
    system func preupgrade() {
        proposalsEntries := Iter.toArray(proposals.entries());
        votesEntries := Iter.toArray(votes.entries());
        templatesEntries := Iter.toArray(templates.entries());
        categoriesEntries := Iter.toArray(categories.entries());
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
        templates := HashMap.fromIter<Nat, ProposalTemplate>(
            templatesEntries.vals(), 
            templatesEntries.size(), 
            Nat.equal, 
            func(n: Nat) : Nat32 { Nat32.fromNat(n) }
        );
        categories := HashMap.fromIter<Text, ProposalCategory>(
            categoriesEntries.vals(), 
            categoriesEntries.size(), 
            Text.equal, 
            Text.hash
        );
        config := HashMap.fromIter<Text, GovernanceConfig>(
            configEntries.vals(), 
            configEntries.size(), 
            Text.equal, 
            Text.hash
        );
        
        if (config.size() == 0 or categories.size() == 0 or templates.size() == 0) {
            initializeDefaults();
        };
    };

    // Initialize on first deployment
    if (config.size() == 0) {
        initializeDefaults();
    };

    // Public functions

    // Create a new proposal
    public shared(msg) func createProposal(
        title: Text,
        description: Text,
        proposalType: Types.ProposalType,
        category: ?Text,
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

    // Create proposal from template
    public shared(_msg) func createProposalFromTemplate(
        templateId: Nat,
        title: Text,
        parameters: [(Text, Text)],
        votingPeriod: ?Nat
    ) : async Result<ProposalId, Text> {
        let template = switch (templates.get(templateId)) {
            case (?t) t;
            case null return #err("Template not found");
        };

        // Validate required fields
        for (field in template.requiredFields.vals()) {
            let found = Array.find<(Text, Text)>(parameters, func((key, _)) = key == field);
            if (found == null) {
                return #err("Missing required field: " # field);
            };
        };

        // Generate description from template
        var description = template.template;
        for ((key, value) in parameters.vals()) {
            description := Text.replace(description, #text("{" # key # "}"), value);
        };

        // Create proposal with text type for now
        await createProposal(
            title,
            description,
            #textProposal(description),
            ?template.category,
            votingPeriod
        )
    };

    // Batch vote on multiple proposals
    public shared(_msg) func batchVote(
        votes: [(ProposalId, Types.VoteChoice, Nat, ?Text)]
    ) : async [Result<(), Text>] {
        let results = Buffer.Buffer<Result<(), Text>>(votes.size());
        
        for ((proposalId, choice, votingPower, reason) in votes.vals()) {
            let result = await vote(proposalId, choice, votingPower, reason);
            results.add(result);
        };
        
        Buffer.toArray(results)
    };

    // Cast a vote on a proposal
    public shared(msg) func vote(
        proposalId: ProposalId,
        choice: Types.VoteChoice,
        votingPower: Nat,
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

    // Query functions

    // Get proposal by ID
    public query func getProposal(proposalId: ProposalId) : async ?Proposal {
        proposals.get(proposalId)
    };

    // Get all proposals
    public query func getAllProposals() : async [Proposal] {
        Iter.toArray(proposals.vals())
    };

    // Get proposals by category
    public query func getProposalsByCategory(category: Text) : async [Proposal] {
        let filteredProposals = Buffer.Buffer<Proposal>(0);
        // For now, we'll return all proposals since we don't store category in proposal
        // In a real implementation, you'd add category field to Proposal type
        for (proposal in proposals.vals()) {
            filteredProposals.add(proposal);
        };
        Buffer.toArray(filteredProposals)
    };

    // Get trending proposals (by vote activity)
    public query func getTrendingProposals(limit: Nat) : async [Proposal] {
        let allProposals = Iter.toArray(proposals.vals());
        let sortedProposals = Array.sort(allProposals, func(a: Proposal, b: Proposal) : {#less; #equal; #greater} {
            if (a.totalVotingPower > b.totalVotingPower) #less
            else if (a.totalVotingPower < b.totalVotingPower) #greater
            else #equal
        });
        
        if (sortedProposals.size() <= limit) {
            sortedProposals
        } else {
            Array.tabulate<Proposal>(limit, func(i) = sortedProposals[i])
        }
    };

    // Get proposal templates
    public query func getProposalTemplates() : async [ProposalTemplate] {
        Iter.toArray(templates.vals())
    };

    // Get proposal categories
    public query func getProposalCategories() : async [ProposalCategory] {
        Iter.toArray(categories.vals())
    };

    // Get template by ID
    public query func getTemplate(templateId: Nat) : async ?ProposalTemplate {
        templates.get(templateId)
    };

    // Get templates by category
    public query func getTemplatesByCategory(category: Text) : async [ProposalTemplate] {
        let filteredTemplates = Buffer.Buffer<ProposalTemplate>(0);
        for (template in templates.vals()) {
            if (template.category == category) {
                filteredTemplates.add(template);
            };
        };
        Buffer.toArray(filteredTemplates)
    };

    // Administrative functions

    // Add new template
    public shared(_msg) func addTemplate(
        name: Text,
        description: Text,
        category: Text,
        requiredFields: [Text],
        template: Text
    ) : async Result<Nat, Text> {
        let templateId = nextTemplateId;
        nextTemplateId += 1;

        let newTemplate : ProposalTemplate = {
            id = templateId;
            name = name;
            description = description;
            category = category;
            requiredFields = requiredFields;
            template = template;
        };

        templates.put(templateId, newTemplate);
        #ok(templateId)
    };

    // Add new category
    public shared(_msg) func addCategory(
        id: Text,
        name: Text,
        description: Text,
        color: Text
    ) : async Result<(), Text> {
        let newCategory : ProposalCategory = {
            id = id;
            name = name;
            description = description;
            color = color;
        };

        categories.put(id, newCategory);
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

    // Get proposal statistics
    public query func getProposalStats() : async {
        totalProposals: Nat;
        activeProposals: Nat;
        succeededProposals: Nat;
        failedProposals: Nat;
        totalVotes: Nat;
        totalTemplates: Nat;
        totalCategories: Nat;
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
            totalTemplates = templates.size();
            totalCategories = categories.size();
        }
    };
}