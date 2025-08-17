import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface DAOConfig {
  'termsAccepted' : boolean,
  'fundingDuration' : bigint,
  'proposalThreshold' : bigint,
  'minInvestment' : bigint,
  'selectedModules' : Array<string>,
  'totalSupply' : bigint,
  'website' : string,
  'tokenSymbol' : string,
  'initialPrice' : bigint,
  'votingPeriod' : bigint,
  'category' : string,
  'tokenName' : string,
  'fundingGoal' : bigint,
  'quorumThreshold' : bigint,
  'kycRequired' : boolean,
  'moduleFeatures' : Array<ModuleFeature>,
}
export interface DAOStats {
  'treasuryBalance' : TokenAmount,
  'totalVotingPower' : bigint,
  'totalProposals' : bigint,
  'totalMembers' : bigint,
  'totalStaked' : TokenAmount,
  'activeProposals' : bigint,
}
export interface Activity {
  'activityType' : string,
  'title' : string,
  'description' : string,
  'timestamp' : Time,
  'status' : string,
}
export interface ModuleFeature {
  'moduleId' : string,
  'features' : Array<string>,
}
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : bigint } |
  { 'err' : string };
export type Time = bigint;
export type TokenAmount = bigint;
export type UserId = Principal;
export interface UserProfile {
  'id' : UserId,
  'bio' : string,
  'displayName' : string,
  'votingPower' : bigint,
  'joinedAt' : Time,
  'reputation' : bigint,
  'totalStaked' : bigint,
}
export interface _SERVICE {
  'addAdmin' : ActorMethod<[Principal], Result>,
  'adminRegisterUser' : ActorMethod<[Principal, string, string], Result>,
  'checkIsAdmin' : ActorMethod<[Principal], boolean>,
  'createProposal' : ActorMethod<[string, string, string], Result_1>,
  'getAllUsers' : ActorMethod<[], Array<UserProfile>>,
  'getCanisterReferences' : ActorMethod<
    [],
    {
      'staking' : [] | [Principal],
      'governance' : [] | [Principal],
      'proposals' : [] | [Principal],
      'treasury' : [] | [Principal],
    }
  >,
  'getDAOConfig' : ActorMethod<[], [] | [DAOConfig]>,
  'getDAOInfo' : ActorMethod<
    [],
    {
      'initialized' : boolean,
      'name' : string,
      'description' : string,
      'totalMembers' : bigint,
    }
  >,
  'getDAOStats' : ActorMethod<[], DAOStats>,
  'getRecentActivity' : ActorMethod<[], Array<Activity>>,
  'getGovernanceStats' : ActorMethod<
    [],
    {
      'passedProposals' : bigint,
      'totalVotingPower' : bigint,
      'totalProposals' : bigint,
      'activeProposals' : bigint,
    }
  >,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'greet' : ActorMethod<[string], string>,
  'health' : ActorMethod<[], { 'status' : string, 'timestamp' : bigint }>,
  'initialize' : ActorMethod<[string, string, Array<Principal>], Result>,
  'registerUser' : ActorMethod<[string, string], Result>,
  'removeAdmin' : ActorMethod<[Principal], Result>,
  'setCanisterReferences' : ActorMethod<
    [Principal, Principal, Principal, Principal],
    Result
  >,
  'setDAOConfig' : ActorMethod<[DAOConfig], Result>,
  'updateUserProfile' : ActorMethod<[string, string], Result>,
  'vote' : ActorMethod<[bigint, string, [] | [string]], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
