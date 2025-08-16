export const idlFactory = ({ IDL }) => {
  const Result_1 = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const AssetData = IDL.Vec(IDL.Nat8);
  const AssetId = IDL.Nat;
  const Result = IDL.Variant({ 'ok' : AssetId, 'err' : IDL.Text });
  const Time = IDL.Int;
  const Asset = IDL.Record({
    'id' : AssetId,
    'contentType' : IDL.Text,
    'data' : AssetData,
    'name' : IDL.Text,
    'size' : IDL.Nat,
    'tags' : IDL.Vec(IDL.Text),
    'isPublic' : IDL.Bool,
    'uploadedAt' : Time,
    'uploadedBy' : IDL.Principal,
  });
  const Result_2 = IDL.Variant({ 'ok' : Asset, 'err' : IDL.Text });
  const AssetMetadata = IDL.Record({
    'id' : AssetId,
    'contentType' : IDL.Text,
    'name' : IDL.Text,
    'size' : IDL.Nat,
    'tags' : IDL.Vec(IDL.Text),
    'isPublic' : IDL.Bool,
    'uploadedAt' : Time,
    'uploadedBy' : IDL.Principal,
  });
  return IDL.Service({
    'addAuthorizedUploader' : IDL.Func([IDL.Principal], [Result_1], []),
    'batchUploadAssets' : IDL.Func(
        [
          IDL.Vec(
            IDL.Tuple(
              IDL.Text,
              IDL.Text,
              AssetData,
              IDL.Bool,
              IDL.Vec(IDL.Text),
            )
          ),
        ],
        [IDL.Vec(Result)],
        [],
      ),
    'deleteAsset' : IDL.Func([AssetId], [Result_1], []),
    'getAsset' : IDL.Func([AssetId], [Result_2], []),
    'getAssetByName' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(AssetMetadata)],
        ['query'],
      ),
    'getAssetMetadata' : IDL.Func(
        [AssetId],
        [IDL.Opt(AssetMetadata)],
        ['query'],
      ),
    'getAuthorizedUploaders' : IDL.Func(
        [],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'getPublicAssets' : IDL.Func([], [IDL.Vec(AssetMetadata)], ['query']),
    'getStorageStats' : IDL.Func(
        [],
        [
          IDL.Record({
            'storageLimit' : IDL.Nat,
            'totalAssets' : IDL.Nat,
            'storageAvailable' : IDL.Nat,
            'storageUsed' : IDL.Nat,
            'averageFileSize' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'getSupportedContentTypes' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
    'getUserAssets' : IDL.Func([], [IDL.Vec(AssetMetadata)], []),
    'health' : IDL.Func(
        [],
        [
          IDL.Record({
            'status' : IDL.Text,
            'storageUsed' : IDL.Nat,
            'timestamp' : Time,
          }),
        ],
        ['query'],
      ),
    'init' : IDL.Func([IDL.Opt(IDL.Principal), IDL.Bool], [], []),
    'removeAuthorizedUploader' : IDL.Func([IDL.Principal], [Result_1], []),
    'searchAssetsByTag' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(AssetMetadata)],
        ['query'],
      ),
    'updateAssetMetadata' : IDL.Func(
        [
          AssetId,
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Bool),
          IDL.Opt(IDL.Vec(IDL.Text)),
        ],
        [Result_1],
        [],
      ),
    'updateStorageLimits' : IDL.Func(
        [IDL.Opt(IDL.Nat), IDL.Opt(IDL.Nat)],
        [Result_1],
        [],
      ),
    'uploadAsset' : IDL.Func(
        [IDL.Text, IDL.Text, AssetData, IDL.Bool, IDL.Vec(IDL.Text)],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
