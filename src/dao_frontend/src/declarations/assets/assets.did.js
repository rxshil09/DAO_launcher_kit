export const idlFactory = ({ IDL }) => {
  const Asset = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    contentType: IDL.Text,
    size: IDL.Nat,
    data: IDL.Vec(IDL.Nat8),
    uploadedBy: IDL.Principal,
    uploadedAt: IDL.Int,
    isPublic: IDL.Bool,
    tags: IDL.Vec(IDL.Text),
  });
  const AssetMetadata = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    contentType: IDL.Text,
    size: IDL.Nat,
    uploadedBy: IDL.Principal,
    uploadedAt: IDL.Int,
    isPublic: IDL.Bool,
    tags: IDL.Vec(IDL.Text),
  });
  const ResultAssetId = IDL.Variant({ ok: IDL.Nat, err: IDL.Text });
  const ResultAsset = IDL.Variant({ ok: Asset, err: IDL.Text });
  return IDL.Service({
    uploadAsset: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Vec(IDL.Nat8), IDL.Bool, IDL.Vec(IDL.Text)],
      [ResultAssetId],
      []
    ),
    getAsset: IDL.Func([IDL.Nat], [ResultAsset], []),
    getAssetMetadata: IDL.Func([IDL.Nat], [IDL.Opt(AssetMetadata)], ['query']),
    getPublicAssets: IDL.Func([], [IDL.Vec(AssetMetadata)], ['query']),
    getUserAssets: IDL.Func([], [IDL.Vec(AssetMetadata)], []),
  });
};

export const init = ({ IDL }) => {
  return [];
};
