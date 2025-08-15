import React, { useState, useEffect } from 'react';
import { useAssets } from '../hooks/useAssets';

const Assets = () => {
  const { uploadAsset, getAsset, getPublicAssets, loading, error } = useAssets();
  const [file, setFile] = useState(null);
  const [assets, setAssets] = useState([]);

  const fetchAssets = async () => {
    try {
      const list = await getPublicAssets();
      setAssets(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    try {
      await uploadAsset(file, true, []);
      setFile(null);
      fetchAssets();
    } catch (err) {
      console.error(err);
    }
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

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4">
      <h2 className="text-2xl font-mono mb-4">Assets</h2>
      <form onSubmit={handleUpload} className="mb-6">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mb-2" />
        <button type="submit" disabled={loading} className="px-4 py-2 bg-cyan-600 rounded">
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ul>
        {assets.map((asset) => (
          <li key={Number(asset.id)} className="flex justify-between items-center mb-2">
            <span>{asset.name}</span>
            <button onClick={() => handleView(asset.id)} className="text-cyan-400 underline">
              View
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Assets;
