export const idlFactory = ({ IDL }) => {
  const Result_1 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const TokenAmount = IDL.Nat;
  const Result = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const Principal = IDL.Principal;
  const TreasuryTransactionType = IDL.Variant({
    'fee' : IDL.Null,
    'deposit' : IDL.Null,
    'stakingReward' : IDL.Null,
    'withdrawal' : IDL.Null,
    'proposalExecution' : IDL.Null,
  });
  const Time = IDL.Int;
  const ProposalId = IDL.Nat;
  const TreasuryTransaction = IDL.Record({
    'id' : IDL.Nat,
    'to' : IDL.Opt(Principal),
    'status' : IDL.Variant({
      'pending' : IDL.Null,
      'completed' : IDL.Null,
      'failed' : IDL.Null,
    }),
    'transactionType' : TreasuryTransactionType,
    'from' : IDL.Opt(Principal),
    'description' : IDL.Text,
    'timestamp' : Time,
    'amount' : TokenAmount,
    'proposalId' : IDL.Opt(ProposalId),
  });
  const TreasuryBalance = IDL.Record({
    'total' : TokenAmount,
    'reserved' : TokenAmount,
    'locked' : TokenAmount,
    'available' : TokenAmount,
  });
  return IDL.Service({
    'addAuthorizedPrincipal' : IDL.Func([IDL.Principal], [Result_1], []),
    'deposit' : IDL.Func([TokenAmount, IDL.Text], [Result], []),
    'getAuthorizedPrincipals' : IDL.Func(
        [],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'getBalance' : IDL.Func([], [TreasuryBalance], ['query']),
    'getRecentTransactions' : IDL.Func(
        [IDL.Nat],
        [IDL.Vec(TreasuryTransaction)],
        ['query'],
      ),
    'getTransaction' : IDL.Func(
        [IDL.Nat],
        [IDL.Opt(TreasuryTransaction)],
        ['query'],
      ),
    'getTransactionsByType' : IDL.Func(
        [TreasuryTransactionType],
        [IDL.Vec(TreasuryTransaction)],
        ['query'],
      ),
    'getTreasuryStats' : IDL.Func(
        [],
        [
          IDL.Record({
            'balance' : TreasuryBalance,
            'totalWithdrawals' : TokenAmount,
            'averageTransactionAmount' : IDL.Float64,
            'totalDeposits' : TokenAmount,
            'totalTransactions' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'lockTokens' : IDL.Func([TokenAmount, IDL.Text], [Result_1], []),
    'releaseReservedTokens' : IDL.Func([TokenAmount, IDL.Text], [Result_1], []),
    'removeAuthorizedPrincipal' : IDL.Func([IDL.Principal], [Result_1], []),
    'reserveTokens' : IDL.Func([TokenAmount, IDL.Text], [Result_1], []),
    'unlockTokens' : IDL.Func([TokenAmount, IDL.Text], [Result_1], []),
    'withdraw' : IDL.Func(
        [IDL.Principal, TokenAmount, IDL.Text, IDL.Opt(ProposalId)],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
