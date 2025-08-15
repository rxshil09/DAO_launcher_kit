export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ ok: IDL.Null, err: IDL.Text });
  const ModuleFeature = IDL.Record({
    moduleId: IDL.Text,
    features: IDL.Vec(IDL.Text),
  });
  const DAOConfig = IDL.Record({
    category: IDL.Text,
    website: IDL.Text,
    selectedModules: IDL.Vec(IDL.Text),
    moduleFeatures: IDL.Vec(ModuleFeature),
    tokenName: IDL.Text,
    tokenSymbol: IDL.Text,
    totalSupply: IDL.Nat,
    initialPrice: IDL.Nat,
    votingPeriod: IDL.Nat,
    quorumThreshold: IDL.Nat,
    proposalThreshold: IDL.Nat,
    fundingGoal: IDL.Nat,
    fundingDuration: IDL.Nat,
    minInvestment: IDL.Nat,
    termsAccepted: IDL.Bool,
    kycRequired: IDL.Bool,
  });
  const DAOInfo = IDL.Record({
    name: IDL.Text,
    description: IDL.Text,
    totalMembers: IDL.Nat,
    initialized: IDL.Bool,
  });
  const DAOStats = IDL.Record({
    totalMembers: IDL.Nat,
    totalProposals: IDL.Nat,
    activeProposals: IDL.Nat,
    totalStaked: IDL.Nat,
    treasuryBalance: IDL.Nat,
    totalVotingPower: IDL.Nat,
  });
  return IDL.Service({
    initialize: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Vec(IDL.Principal)],
      [Result],
      []
    ),
    setCanisterReferences: IDL.Func(
      [IDL.Principal, IDL.Principal, IDL.Principal, IDL.Principal],
      [Result],
      []
    ),
    registerUser: IDL.Func([IDL.Text, IDL.Text], [Result], []),

    adminRegisterUser: IDL.Func([IDL.Principal, IDL.Text, IDL.Text], [Result], []),

    setDAOConfig: IDL.Func([DAOConfig], [Result], []),

    getDAOConfig: IDL.Func([], [IDL.Opt(DAOConfig)], ['query']),
    getCanisterReferences: IDL.Func(
      [],
      [
        IDL.Record({
          governance: IDL.Opt(IDL.Principal),
          staking: IDL.Opt(IDL.Principal),
          treasury: IDL.Opt(IDL.Principal),
          proposals: IDL.Opt(IDL.Principal),
        })
      ],
      ['query'],
    ),
    getDAOStats: IDL.Func([], [DAOStats], ['query']),

  });
};

export const init = ({ IDL }) => {
  return [];
};

