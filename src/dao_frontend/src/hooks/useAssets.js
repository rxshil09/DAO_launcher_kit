import { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useActors } from '../context/ActorContext';

export const useAssets = () => {
  const actors = useActors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadAsset = async (file, isPublic = true, tags = []) => {
    setLoading(true);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = Array.from(new Uint8Array(arrayBuffer));
      const result = await actors.assets.uploadAsset(
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
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAsset = async (assetId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await actors.assets.getAsset(BigInt(assetId));
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

  const getAssetMetadata = async (assetId) => {
    setLoading(true);
    setError(null);
    try {
      return await actors.assets.getAssetMetadata(BigInt(assetId));
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
      return await actors.assets.getPublicAssets();
    } catch (err) {
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
      return await actors.assets.getUserAssets();
    } catch (err) {
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
      return await actors.assets.searchAssetsByTag(tag);
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
      const res = await actors.assets.deleteAsset(BigInt(assetId));
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
      const res = await actors.assets.updateAssetMetadata(
        BigInt(assetId),
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
      return await actors.assets.getStorageStats();
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
      const res = await actors.assets.getAuthorizedUploaders();
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
      const res = await actors.assets.addAuthorizedUploader(
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
      const res = await actors.assets.removeAuthorizedUploader(
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
      const res = await actors.assets.updateStorageLimits(
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
      return await actors.assets.getSupportedContentTypes();
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
      return await actors.assets.getAssetByName(name);
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
      return await actors.assets.batchUploadAssets(formatted);
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
      return await actors.assets.health();
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
    error,
  };
};
