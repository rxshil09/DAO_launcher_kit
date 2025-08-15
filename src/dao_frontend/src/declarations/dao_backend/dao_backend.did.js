export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ ok: IDL.Null, err: IDL.Text });
  const DAOInfo = IDL.Record({
    name: IDL.Text,
    description: IDL.Text,
    totalMembers: IDL.Nat,
    initialized: IDL.Bool,
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
    getDAOInfo: IDL.Func([], [DAOInfo], ['query']),
  });
};

export const init = ({ IDL }) => {
  return [];
};

