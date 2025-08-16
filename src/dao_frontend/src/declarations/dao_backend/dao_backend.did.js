export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const UserId = IDL.Principal;
  const Time = IDL.Int;
  const UserProfile = IDL.Record({
    'id' : UserId,
    'bio' : IDL.Text,
    'displayName' : IDL.Text,
    'votingPower' : IDL.Nat,
    'joinedAt' : Time,
    'reputation' : IDL.Nat,
    'totalStaked' : IDL.Nat,
  });
  const ModuleFeature = IDL.Record({
    'moduleId' : IDL.Text,
    'features' : IDL.Vec(IDL.Text),
  });
  const DAOConfig = IDL.Record({
    'termsAccepted' : IDL.Bool,
    'fundingDuration' : IDL.Nat,
    'proposalThreshold' : IDL.Nat,
    'minInvestment' : IDL.Nat,
    'selectedModules' : IDL.Vec(IDL.Text),
    'totalSupply' : IDL.Nat,
    'website' : IDL.Text,
    'tokenSymbol' : IDL.Text,
    'initialPrice' : IDL.Nat,
    'votingPeriod' : IDL.Nat,
    'category' : IDL.Text,
    'tokenName' : IDL.Text,
    'fundingGoal' : IDL.Nat,
    'quorumThreshold' : IDL.Nat,
    'kycRequired' : IDL.Bool,
    'moduleFeatures' : IDL.Vec(ModuleFeature),
  });
  const TokenAmount = IDL.Nat;
  const DAOStats = IDL.Record({
    'treasuryBalance' : TokenAmount,
    'totalVotingPower' : IDL.Nat,
    'totalProposals' : IDL.Nat,
    'totalMembers' : IDL.Nat,
    'totalStaked' : TokenAmount,
    'activeProposals' : IDL.Nat,
  });
  return IDL.Service({
    'addAdmin' : IDL.Func([IDL.Principal], [Result], []),
    'adminRegisterUser' : IDL.Func(
        [IDL.Principal, IDL.Text, IDL.Text],
        [Result],
        [],
      ),
    'checkIsAdmin' : IDL.Func([IDL.Principal], [IDL.Bool], ['query']),
    'createProposal' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result_1], []),
    'getAllUsers' : IDL.Func([], [IDL.Vec(UserProfile)], ['query']),
    'getCanisterReferences' : IDL.Func(
        [],
        [
          IDL.Record({
            'staking' : IDL.Opt(IDL.Principal),
            'governance' : IDL.Opt(IDL.Principal),
            'proposals' : IDL.Opt(IDL.Principal),
            'treasury' : IDL.Opt(IDL.Principal),
          }),
        ],
        ['query'],
      ),
    'getDAOConfig' : IDL.Func([], [IDL.Opt(DAOConfig)], ['query']),
    'getDAOInfo' : IDL.Func(
        [],
        [
          IDL.Record({
            'initialized' : IDL.Bool,
            'name' : IDL.Text,
            'description' : IDL.Text,
            'totalMembers' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'getDAOStats' : IDL.Func([], [DAOStats], ['query']),
    'getGovernanceStats' : IDL.Func(
        [],
        [
          IDL.Record({
            'passedProposals' : IDL.Nat,
            'totalVotingPower' : IDL.Nat,
            'totalProposals' : IDL.Nat,
            'activeProposals' : IDL.Nat,
          }),
        ],
        [],
      ),
    'getUserProfile' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(UserProfile)],
        ['query'],
      ),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'health' : IDL.Func(
        [],
        [IDL.Record({ 'status' : IDL.Text, 'timestamp' : IDL.Int })],
        ['query'],
      ),
    'initialize' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Vec(IDL.Principal)],
        [Result],
        [],
      ),
    'registerUser' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'removeAdmin' : IDL.Func([IDL.Principal], [Result], []),
    'setCanisterReferences' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Principal, IDL.Principal],
        [Result],
        [],
      ),
    'setDAOConfig' : IDL.Func([DAOConfig], [Result], []),
    'updateUserProfile' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'vote' : IDL.Func([IDL.Nat, IDL.Text, IDL.Opt(IDL.Text)], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
