import { useState } from 'react';
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

  return {
    uploadAsset,
    getAsset,
    getAssetMetadata,
    getPublicAssets,
    getUserAssets,
    loading,
    error,
  };
};
