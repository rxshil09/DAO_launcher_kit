import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Principal = Principal;
export type ProposalId = bigint;
export type Result = { 'ok' : bigint } |
  { 'err' : string };
export type Result_1 = { 'ok' : null } |
  { 'err' : string };
export type Time = bigint;
export type TokenAmount = bigint;
export interface TreasuryBalance {
  'total' : TokenAmount,
  'reserved' : TokenAmount,
  'locked' : TokenAmount,
  'available' : TokenAmount,
}
export interface TreasuryTransaction {
  'id' : bigint,
  'to' : [] | [Principal],
  'status' : { 'pending' : null } |
    { 'completed' : null } |
    { 'failed' : null },
  'transactionType' : TreasuryTransactionType,
  'from' : [] | [Principal],
  'description' : string,
  'timestamp' : Time,
  'amount' : TokenAmount,
  'proposalId' : [] | [ProposalId],
}
export type TreasuryTransactionType = { 'fee' : null } |
  { 'deposit' : null } |
  { 'stakingReward' : null } |
  { 'withdrawal' : null } |
  { 'proposalExecution' : null };
export interface _SERVICE {
  'addAuthorizedPrincipal' : ActorMethod<[Principal], Result_1>,
  'deposit' : ActorMethod<[TokenAmount, string], Result>,
  'getAuthorizedPrincipals' : ActorMethod<[], Array<Principal>>,
  'getBalance' : ActorMethod<[], TreasuryBalance>,
  'getRecentTransactions' : ActorMethod<[bigint], Array<TreasuryTransaction>>,
  'getTransaction' : ActorMethod<[bigint], [] | [TreasuryTransaction]>,
  'getTransactionsByType' : ActorMethod<
    [TreasuryTransactionType],
    Array<TreasuryTransaction>
  >,
  'getTreasuryStats' : ActorMethod<
    [],
    {
      'balance' : TreasuryBalance,
      'totalWithdrawals' : TokenAmount,
      'averageTransactionAmount' : number,
      'totalDeposits' : TokenAmount,
      'totalTransactions' : bigint,
    }
  >,
  'lockTokens' : ActorMethod<[TokenAmount, string], Result_1>,
  'releaseReservedTokens' : ActorMethod<[TokenAmount, string], Result_1>,
  'removeAuthorizedPrincipal' : ActorMethod<[Principal], Result_1>,
  'reserveTokens' : ActorMethod<[TokenAmount, string], Result_1>,
  'unlockTokens' : ActorMethod<[TokenAmount, string], Result_1>,
  'withdraw' : ActorMethod<
    [Principal, TokenAmount, string, [] | [ProposalId]],
    Result
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
