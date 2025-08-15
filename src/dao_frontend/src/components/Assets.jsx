import React, { useState, useEffect } from 'react';
import { useAssets } from '../hooks/useAssets';

const Assets = () => {
  const {
    uploadAsset,
    getAsset,
    getPublicAssets,
    searchAssetsByTag,
    deleteAsset,
    updateAssetMetadata,
    getStorageStats,
    loading,
    error,
  } = useAssets();
  const [file, setFile] = useState(null);
  const [assets, setAssets] = useState([]);
  const [tag, setTag] = useState('');
  const [stats, setStats] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editPublic, setEditPublic] = useState(true);

  const fetchStats = async () => {
    try {
      const s = await getStorageStats();
      setStats(s);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssets = async (t = '') => {
    try {
      const list = t ? await searchAssetsByTag(t) : await getPublicAssets();
      setAssets(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchStats();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    try {
      await uploadAsset(file, true, []);
      setFile(null);
      fetchAssets(tag);
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await fetchAssets(tag);
  };

  const handleView = async (id) => {
    try {
      const asset = await getAsset(id);
      const blob = new Blob([new Uint8Array(asset.data)], { type: asset.contentType });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAsset(id);
      fetchAssets(tag);
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (asset) => {
    setEditingId(asset.id);
    setEditName(asset.name);
    setEditTags(asset.tags.join(', '));
    setEditPublic(asset.isPublic);
  };

  const handleUpdate = async (e, id) => {
    e.preventDefault();
    const tagsArray = editTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    try {
      await updateAssetMetadata(id, {
        name: editName,
        isPublic: editPublic,
        tags: tagsArray,
      });
      setEditingId(null);
      fetchAssets(tag);
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4">
      <h2 className="text-2xl font-mono mb-4">Assets</h2>
      {stats && (
        <div className="mb-4 text-sm">
          <p>Total Assets: {Number(stats.totalAssets)}</p>
          <p>Storage Used: {Number(stats.storageUsed)}</p>
          <p>Storage Available: {Number(stats.storageAvailable)}</p>
          <p>Average File Size: {Number(stats.averageFileSize)}</p>
        </div>
      )}
      <form onSubmit={handleUpload} className="mb-6">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mb-2" />
        <button type="submit" disabled={loading} className="px-4 py-2 bg-cyan-600 rounded">
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      <form onSubmit={handleSearch} className="mb-6 flex space-x-2">
        <input
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="Search by tag"
          className="px-2 py-1 text-black"
        />
        <button type="submit" className="px-3 py-1 bg-cyan-600 rounded">
          Search
        </button>
        <button
          type="button"
          onClick={() => {
            setTag('');
            fetchAssets();
          }}
          className="px-3 py-1 bg-gray-600 rounded"
        >
          Clear
        </button>
      </form>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ul>
        {assets.map((asset) => (
          <li key={Number(asset.id)} className="mb-2">
            {editingId === asset.id ? (
              <form onSubmit={(e) => handleUpdate(e, asset.id)} className="flex flex-wrap items-center space-x-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="px-2 py-1 text-black"
                />
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="tags"
                  className="px-2 py-1 text-black"
                />
                <label className="flex items-center space-x-1">
                  <input type="checkbox" checked={editPublic} onChange={(e) => setEditPublic(e.target.checked)} />
                  <span>Public</span>
                </label>
                <button type="submit" className="px-2 py-1 bg-cyan-600 rounded">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="px-2 py-1 bg-gray-600 rounded"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex justify-between items-center">
                <span>{asset.name}</span>
                <div className="space-x-2">
                  <button onClick={() => handleView(asset.id)} className="text-cyan-400 underline">
                    View
                  </button>
                  <button onClick={() => startEdit(asset)} className="text-yellow-400 underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(asset.id)} className="text-red-500 underline">
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Assets;
