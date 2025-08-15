import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface GovernanceConfig {
  'maxProposalsPerUser' : bigint,
  'proposalDeposit' : TokenAmount,
  'votingPeriod' : bigint,
  'quorumThreshold' : bigint,
  'approvalThreshold' : bigint,
}
export interface MembershipChangeProposal {
  'member' : Principal,
  'action' : { 'add' : null } |
    { 'remove' : null },
  'role' : string,
}
export interface ParameterChangeProposal {
  'oldValue' : string,
  'parameter' : string,
  'newValue' : string,
}
export type Principal = Principal;
export interface Proposal {
  'id' : ProposalId,
  'status' : ProposalStatus,
  'title' : string,
  'votesAgainst' : bigint,
  'createdAt' : Time,
  'totalVotingPower' : bigint,
  'votingDeadline' : Time,
  'description' : string,
  'proposalType' : ProposalType,
  'votesInFavor' : bigint,
  'proposer' : Principal,
  'quorumThreshold' : bigint,
  'executionDeadline' : [] | [Time],
  'approvalThreshold' : bigint,
}
export type ProposalId = bigint;
export type ProposalStatus = { 'active' : null } |
  { 'cancelled' : null } |
  { 'pending' : null } |
  { 'executed' : null } |
  { 'failed' : null } |
  { 'succeeded' : null };
export type ProposalType = { 'membershipChange' : MembershipChangeProposal } |
  { 'parameterChange' : ParameterChangeProposal } |
  { 'treasuryTransfer' : TreasuryTransferProposal } |
  { 'textProposal' : string };
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : ProposalId } |
  { 'err' : string };
export type Time = bigint;
export type TokenAmount = bigint;
export interface TreasuryTransferProposal {
  'recipient' : Principal,
  'amount' : TokenAmount,
  'reason' : string,
}
export interface Vote {
  'votingPower' : bigint,
  'voter' : Principal,
  'timestamp' : Time,
  'choice' : VoteChoice,
  'proposalId' : ProposalId,
  'reason' : [] | [string],
}
export type VoteChoice = { 'against' : null } |
  { 'abstain' : null } |
  { 'inFavor' : null };
export interface _SERVICE {
  'createProposal' : ActorMethod<
    [string, string, ProposalType, [] | [bigint]],
    Result_1
  >,
  'executeProposal' : ActorMethod<[ProposalId], Result>,
  'getActiveProposals' : ActorMethod<[], Array<Proposal>>,
  'getAllProposals' : ActorMethod<[], Array<Proposal>>,
  'getConfig' : ActorMethod<[], [] | [GovernanceConfig]>,
  'getGovernanceStats' : ActorMethod<
    [],
    {
      'succeededProposals' : bigint,
      'totalVotes' : bigint,
      'totalProposals' : bigint,
      'failedProposals' : bigint,
      'activeProposals' : bigint,
    }
  >,
  'getProposal' : ActorMethod<[ProposalId], [] | [Proposal]>,
  'getProposalVotes' : ActorMethod<[ProposalId], Array<Vote>>,
  'getProposalsByStatus' : ActorMethod<[ProposalStatus], Array<Proposal>>,
  'getUserVote' : ActorMethod<[ProposalId, Principal], [] | [Vote]>,
  'updateConfig' : ActorMethod<[GovernanceConfig], Result>,
  'vote' : ActorMethod<[ProposalId, VoteChoice, [] | [string]], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
