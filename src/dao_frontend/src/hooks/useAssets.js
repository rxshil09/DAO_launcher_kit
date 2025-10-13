/**
 * useAssets Hook
 * 
 * Manages decentralized file storage operations including upload, retrieval,
 * metadata management, and access control. Supports both public and private assets.
 * 
 * @module hooks/useAssets
 * 
 * @returns {Object} Asset management interface
 * @returns {Function} uploadAsset - Upload a single file
 * @returns {Function} batchUploadAssets - Upload multiple files at once
 * @returns {Function} getAsset - Get asset data by ID
 * @returns {Function} getAssetMetadata - Get asset metadata only
 * @returns {Function} getAssetByName - Find asset by name
 * @returns {Function} getPublicAssets - Get all public assets
 * @returns {Function} getUserAssets - Get current user's assets
 * @returns {Function} searchAssetsByTag - Search assets by tag
 * @returns {Function} deleteAsset - Delete an asset
 * @returns {Function} updateAssetMetadata - Update asset name, visibility, or tags
 * @returns {Function} getStorageStats - Get storage usage statistics
 * @returns {Function} getAuthorizedUploaders - Get list of authorized uploaders
 * @returns {Function} addAuthorizedUploader - Add authorized uploader (admin)
 * @returns {Function} removeAuthorizedUploader - Remove authorized uploader (admin)
 * @returns {Function} updateStorageLimits - Update max file size and total storage (admin)
 * @returns {Function} getSupportedContentTypes - Get allowed file types
 * @returns {Function} getHealth - Check canister health status
 * @returns {boolean} loading - Loading state for operations
 * @returns {string|null} error - Error message if operation fails
 * 
 * @example
 * ```jsx
 * function FileUploader() {
 *   const { uploadAsset, getUserAssets, deleteAsset } = useAssets();
 *   
 *   const handleUpload = async (file) => {
 *     const assetId = await uploadAsset(
 *       file,
 *       true, // public
 *       ["logo", "branding"] // tags
 *     );
 *     console.log("Uploaded asset ID:", assetId);
 *   };
 *   
 *   const loadMyAssets = async () => {
 *     const assets = await getUserAssets();
 *     // Array of asset metadata objects
 *   };
 * }
 * ```
 * 
 * Supported Content Types:
 * - Images: image/png, image/jpeg, image/svg+xml
 * - Documents: application/pdf, text/plain
 * - Data: application/json
 * 
 * Storage Limits:
 * - Max File Size: Configurable (default 5MB)
 * - Max Total Storage: Configurable per DAO
 */

import { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useActors } from '../context/ActorContext';

export const useAssets = () => {
  const actors = useActors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Upload a single file to decentralized storage
   * 
   * @async
   * @param {File} file - File object to upload
   * @param {boolean} isPublic - Whether asset is publicly accessible (default: true)
   * @param {Array<string>} tags - Tags for categorization (default: [])
   * @returns {Promise<number>} Asset ID
   * @throws {Error} If upload fails (file too large, unsupported type, etc.)
   */
  const uploadAsset = async (file, isPublic = true, tags = []) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🎯 useAssets: Starting upload for', file.name);
      console.log('🔧 Assets actor available:', !!actors?.assets);
      
      const arrayBuffer = await file.arrayBuffer();
      const data = Array.from(new Uint8Array(arrayBuffer));
      console.log('📊 File data prepared, size:', data.length);
      
      const result = await actors.assets.uploadAsset(
        file.name,
        file.type,
        data,
        isPublic,
        tags
      );
      console.log('📤 Upload call result:', result);
      
      if (result.err) {
        throw new Error(result.err);
      }
      return result.ok;
    } catch (err) {
      console.error('❌ useAssets upload error:', err);
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
      console.log('🌐 useAssets: Getting public assets...');
      const result = await actors.assets.getPublicAssets();
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
      const result = await actors.assets.getUserAssets();
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

