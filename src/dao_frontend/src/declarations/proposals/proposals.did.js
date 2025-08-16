export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const ProposalId = IDL.Nat;
  const VoteChoice = IDL.Variant({
    'against' : IDL.Null,
    'abstain' : IDL.Null,
    'inFavor' : IDL.Null,
  });
  const Principal = IDL.Principal;
  const MembershipChangeProposal = IDL.Record({
    'member' : Principal,
    'action' : IDL.Variant({ 'add' : IDL.Null, 'remove' : IDL.Null }),
    'role' : IDL.Text,
  });
  const ParameterChangeProposal = IDL.Record({
    'oldValue' : IDL.Text,
    'parameter' : IDL.Text,
    'newValue' : IDL.Text,
  });
  const TokenAmount = IDL.Nat;
  const TreasuryTransferProposal = IDL.Record({
    'recipient' : Principal,
    'amount' : TokenAmount,
    'reason' : IDL.Text,
  });
  const ProposalType = IDL.Variant({
    'membershipChange' : MembershipChangeProposal,
    'parameterChange' : ParameterChangeProposal,
    'treasuryTransfer' : TreasuryTransferProposal,
    'textProposal' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'ok' : ProposalId, 'err' : IDL.Text });
  const ProposalStatus = IDL.Variant({
    'active' : IDL.Null,
    'cancelled' : IDL.Null,
    'pending' : IDL.Null,
    'executed' : IDL.Null,
    'failed' : IDL.Null,
    'succeeded' : IDL.Null,
  });
  const Time = IDL.Int;
  const Proposal = IDL.Record({
    'id' : ProposalId,
    'status' : ProposalStatus,
    'title' : IDL.Text,
    'votesAgainst' : IDL.Nat,
    'createdAt' : Time,
    'totalVotingPower' : IDL.Nat,
    'votingDeadline' : Time,
    'description' : IDL.Text,
    'proposalType' : ProposalType,
    'votesInFavor' : IDL.Nat,
    'proposer' : Principal,
    'quorumThreshold' : IDL.Nat,
    'executionDeadline' : IDL.Opt(Time),
    'approvalThreshold' : IDL.Nat,
  });
  const ProposalCategory = IDL.Record({
    'id' : IDL.Text,
    'name' : IDL.Text,
    'color' : IDL.Text,
    'description' : IDL.Text,
  });
  const ProposalTemplate = IDL.Record({
    'id' : IDL.Nat,
    'name' : IDL.Text,
    'description' : IDL.Text,
    'requiredFields' : IDL.Vec(IDL.Text),
    'template' : IDL.Text,
    'category' : IDL.Text,
  });
  return IDL.Service({
    'addCategory' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [Result],
        [],
      ),
    'addTemplate' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Vec(IDL.Text), IDL.Text],
        [Result_2],
        [],
      ),
    'batchVote' : IDL.Func(
        [
          IDL.Vec(
            IDL.Tuple(ProposalId, VoteChoice, IDL.Opt(IDL.Text))
          ),
        ],
        [IDL.Vec(Result)],
        [],
      ),
    'createProposal' : IDL.Func(
        [IDL.Text, IDL.Text, ProposalType, IDL.Opt(IDL.Text), IDL.Opt(IDL.Nat)],
        [Result_1],
        [],
      ),
    'createProposalFromTemplate' : IDL.Func(
        [
          IDL.Nat,
          IDL.Text,
          IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
          IDL.Opt(IDL.Nat),
        ],
        [Result_1],
        [],
      ),
    'getAllProposals' : IDL.Func([], [IDL.Vec(Proposal)], ['query']),
    'getProposal' : IDL.Func([ProposalId], [IDL.Opt(Proposal)], ['query']),
    'getProposalCategories' : IDL.Func(
        [],
        [IDL.Vec(ProposalCategory)],
        ['query'],
      ),
    'getProposalStats' : IDL.Func(
        [],
        [
          IDL.Record({
            'succeededProposals' : IDL.Nat,
            'totalVotes' : IDL.Nat,
            'totalProposals' : IDL.Nat,
            'totalCategories' : IDL.Nat,
            'failedProposals' : IDL.Nat,
            'totalTemplates' : IDL.Nat,
            'activeProposals' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'getProposalTemplates' : IDL.Func(
        [],
        [IDL.Vec(ProposalTemplate)],
        ['query'],
      ),
    'getProposalsByCategory' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(Proposal)],
        ['query'],
      ),
    'getTemplate' : IDL.Func([IDL.Nat], [IDL.Opt(ProposalTemplate)], ['query']),
    'getTemplatesByCategory' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(ProposalTemplate)],
        ['query'],
      ),
    'getTrendingProposals' : IDL.Func(
        [IDL.Nat],
        [IDL.Vec(Proposal)],
        ['query'],
      ),
    'vote' : IDL.Func(
        [ProposalId, VoteChoice, IDL.Opt(IDL.Text)],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
