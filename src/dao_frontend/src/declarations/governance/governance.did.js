export const idlFactory = ({ IDL }) => {
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
  const ProposalId = IDL.Nat;
  const Result_1 = IDL.Variant({ 'ok' : ProposalId, 'err' : IDL.Text });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
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
  const GovernanceConfig = IDL.Record({
    'maxProposalsPerUser' : IDL.Nat,
    'proposalDeposit' : TokenAmount,
    'votingPeriod' : IDL.Nat,
    'quorumThreshold' : IDL.Nat,
    'approvalThreshold' : IDL.Nat,
  });
  const VoteChoice = IDL.Variant({
    'against' : IDL.Null,
    'abstain' : IDL.Null,
    'inFavor' : IDL.Null,
  });
  const Vote = IDL.Record({
    'votingPower' : IDL.Nat,
    'voter' : Principal,
    'timestamp' : Time,
    'choice' : VoteChoice,
    'proposalId' : ProposalId,
    'reason' : IDL.Opt(IDL.Text),
  });
  return IDL.Service({
    'createProposal' : IDL.Func(
        [IDL.Text, IDL.Text, ProposalType, IDL.Opt(IDL.Nat)],
        [Result_1],
        [],
      ),
    'executeProposal' : IDL.Func([ProposalId], [Result], []),
    'getActiveProposals' : IDL.Func([], [IDL.Vec(Proposal)], ['query']),
    'getAllProposals' : IDL.Func([], [IDL.Vec(Proposal)], ['query']),
    'getConfig' : IDL.Func([], [IDL.Opt(GovernanceConfig)], ['query']),
    'getGovernanceStats' : IDL.Func(
        [],
        [
          IDL.Record({
            'succeededProposals' : IDL.Nat,
            'totalVotes' : IDL.Nat,
            'totalProposals' : IDL.Nat,
            'failedProposals' : IDL.Nat,
            'activeProposals' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'getProposal' : IDL.Func([ProposalId], [IDL.Opt(Proposal)], ['query']),
    'getProposalVotes' : IDL.Func([ProposalId], [IDL.Vec(Vote)], ['query']),
    'getProposalsByStatus' : IDL.Func(
        [ProposalStatus],
        [IDL.Vec(Proposal)],
        ['query'],
      ),
    'getUserVote' : IDL.Func(
        [ProposalId, IDL.Principal],
        [IDL.Opt(Vote)],
        ['query'],
      ),
    'updateConfig' : IDL.Func([GovernanceConfig], [Result], []),
    'vote' : IDL.Func(
        [ProposalId, VoteChoice, IDL.Opt(IDL.Text)],
        [Result],
        [],
      ),
  });
};


export const init = ({ IDL }) => {
  return [];
};
