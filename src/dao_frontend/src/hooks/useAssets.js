import { useCallback, useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useActors } from '../context/ActorContext';
import { validateImage } from '../utils/fileUtils';

const assetUrlCache = new Map();

export const useAssets = () => {
  const actors = useActors();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const ensureAssetsActor = () => {
    if (!actors?.assets) {
      throw new Error('Assets actor not available');
    }
    return actors.assets;
  };

  const normalizeAssetId = (assetId) => {
    // Unwrap Candid optional ([] | [v]) gracefully
    if (Array.isArray(assetId)) {
      assetId = assetId.length ? assetId[0] : undefined;
    }
    if (typeof assetId === 'bigint') {
      return assetId;
    }
    if (typeof assetId === 'number') {
      return BigInt(assetId);
    }
    if (typeof assetId === 'string' && assetId.trim() !== '') {
      return BigInt(assetId.trim());
    }
    throw new Error('Invalid asset identifier');
  };

  const uploadAsset = async (file, isPublic = true, tags = []) => {
    const assetsActor = ensureAssetsActor();

    const validation = validateImage(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    setUploading(true);
    setLoading(true);
    setError(null);
    try {
      console.log("useAssets: starting upload for", file.name);

      const arrayBuffer = await file.arrayBuffer();
      const data = Array.from(new Uint8Array(arrayBuffer));
      console.log("useAssets: file data prepared, size:", data.length);

      const result = await assetsActor.uploadAsset(
        file.name,
        file.type,
        data,
        isPublic,
        tags
      );

      if (result.err) {
        throw new Error(result.err);
      }
      return result.ok;
    } catch (err) {
      console.error("useAssets upload error:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }; 

  const getAsset = async (assetId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ensureAssetsActor().getAsset(normalizeAssetId(assetId));
      if (res.err) {
        throw new Error(res.err);
      }
      return res.ok;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAssetObjectUrl = useCallback(async (assetId) => {
    setError(null);
    try {
      if (assetId === undefined || assetId === null || assetId === '') {
        throw new Error('Asset ID is required');
      }

      const id = normalizeAssetId(assetId);
      const cacheKey = id.toString();
      const cache = assetUrlCache;
      const cachedEntry = cache.get(cacheKey);

      const buildRelease = () => () => {
        const entry = cache.get(cacheKey);
        if (!entry) return;
        entry.refCount = Math.max(0, entry.refCount - 1);
        if (entry.refCount === 0) {
          if (entry.url.startsWith('blob:')) {
            URL.revokeObjectURL(entry.url);
          }
          cache.delete(cacheKey);
        }
      };

      if (cachedEntry) {
        cachedEntry.refCount += 1;
        return {
          url: cachedEntry.url,
          release: buildRelease(),
          contentType: cachedEntry.contentType,
          size: cachedEntry.size,
          cached: true,
        };
      }

      const assetsActor = ensureAssetsActor();
      let contentType = 'application/octet-stream';
      try {
        const meta = await assetsActor.getAssetMetadata(id);
        if (meta && meta.length > 0 && meta[0]) {
          contentType = meta[0].contentType || contentType;
        }
      } catch (metaErr) {
        console.warn('Failed to load asset metadata:', metaErr);
      }

      let bytes = null;
      try {
        const bytesResult = await assetsActor.getAssetBytes(id);
        if (Array.isArray(bytesResult) && bytesResult.length > 0 && bytesResult[0]) {
          bytes =
            bytesResult[0] instanceof Uint8Array
              ? bytesResult[0]
              : Uint8Array.from(bytesResult[0]);
        }
      } catch (bytesErr) {
        console.warn('Failed to load asset bytes via query:', bytesErr);
      }

      if (!bytes) {
        const res = await assetsActor.getAsset(id);
        if (res.err) {
          throw new Error(res.err);
        }
        bytes =
          res.ok.data instanceof Uint8Array
            ? res.ok.data
            : Uint8Array.from(res.ok.data);
        contentType = res.ok.contentType || contentType;
      }

      const blob = new Blob([bytes], {
        type: contentType || 'application/octet-stream',
      });
      const url = URL.createObjectURL(blob);

      cache.set(cacheKey, {
        url,
        refCount: 1,
        contentType,
        size: bytes.length,
      });

      return {
        url,
        release: buildRelease(),
        contentType,
        size: bytes.length,
        cached: false,
      };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [actors]);

  const getAssetMetadata = async (assetId) => {
    setLoading(true);
    setError(null);
    try {
      return await ensureAssetsActor().getAssetMetadata(normalizeAssetId(assetId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPublicAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🌐 useAssets: Getting public assets...');
      const result = await ensureAssetsActor().getPublicAssets();
      console.log('🌐 Public assets result:', result);
      return result;
    } catch (err) {
      console.error('❌ getPublicAssets error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('👤 useAssets: Getting user assets...');
      const result = await ensureAssetsActor().getUserAssets();
      console.log('👤 User assets result:', result);
      return result;
    } catch (err) {
      console.error('❌ getUserAssets error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchAssetsByTag = async (tag) => {
    setLoading(true);
    setError(null);
    try {
      return await ensureAssetsActor().searchAssetsByTag(tag);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAsset = async (assetId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ensureAssetsActor().deleteAsset(normalizeAssetId(assetId));
      if (res.err) {
        throw new Error(res.err);
      }
      return res.ok;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAssetMetadata = async (assetId, { name = null, isPublic = null, tags = null }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ensureAssetsActor().updateAssetMetadata(
        normalizeAssetId(assetId),
        name === null ? [] : [name],
        isPublic === null ? [] : [isPublic],
        tags === null ? [] : [tags]
      );
      if (res.err) {
        throw new Error(res.err);
      }
      return res.ok;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStorageStats = async () => {
    setLoading(true);
    setError(null);
    try {
      return await ensureAssetsActor().getStorageStats();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAuthorizedUploaders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ensureAssetsActor().getAuthorizedUploaders();
      return res.map((p) => p.toText());
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addAuthorizedUploader = async (principal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ensureAssetsActor().addAuthorizedUploader(
        Principal.fromText(principal)
      );
      if (res.err) {
        throw new Error(res.err);
      }
      return res.ok;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeAuthorizedUploader = async (principal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ensureAssetsActor().removeAuthorizedUploader(
        Principal.fromText(principal)
      );
      if (res.err) {
        throw new Error(res.err);
      }
      return res.ok;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateStorageLimits = async (
    maxFileSizeNew = null,
    maxTotalStorageNew = null
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ensureAssetsActor().updateStorageLimits(
        maxFileSizeNew === null ? [] : [BigInt(maxFileSizeNew)],
        maxTotalStorageNew === null ? [] : [BigInt(maxTotalStorageNew)]
      );
      if (res.err) {
        throw new Error(res.err);
      }
      return res.ok;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSupportedContentTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      return await ensureAssetsActor().getSupportedContentTypes();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAssetByName = async (name) => {
    setLoading(true);
    setError(null);
    try {
      return await ensureAssetsActor().getAssetByName(name);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const batchUploadAssets = async (files) => {
    setLoading(true);
    setError(null);
    try {
      const formatted = await Promise.all(
        files.map(async ({ file, isPublic = true, tags = [] }) => {
          const arrayBuffer = await file.arrayBuffer();
          const data = Array.from(new Uint8Array(arrayBuffer));
          return [file.name, file.type, data, isPublic, tags];
        })
      );
      return await ensureAssetsActor().batchUploadAssets(formatted);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      return await ensureAssetsActor().health();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadAsset,
    getAsset,
    getAssetObjectUrl,
    getAssetMetadata,
    getPublicAssets,
    getUserAssets,

    searchAssetsByTag,
    deleteAsset,
    updateAssetMetadata,
    getStorageStats,

    getAuthorizedUploaders,
    addAuthorizedUploader,
    removeAuthorizedUploader,
    updateStorageLimits,
    getSupportedContentTypes,
    getAssetByName,
    batchUploadAssets,
    getHealth,
    loading,
    uploading,
    error,
  };
};



