import React, { useEffect, useState } from 'react';
import { useAssets } from '../../hooks/useAssets';
import { Plus, Trash2 } from 'lucide-react';

const ManagementAssetsAdmin: React.FC = () => {
  const {
    getAuthorizedUploaders,
    addAuthorizedUploader,
    removeAuthorizedUploader,
    getStorageStats,
    updateStorageLimits,
  } = useAssets();

  const [uploaders, setUploaders] = useState<string[]>([]);
  const [newUploader, setNewUploader] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [maxFileSize, setMaxFileSize] = useState('');
  const [maxTotalStorage, setMaxTotalStorage] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [uploaderList, storageStats] = await Promise.all([
        getAuthorizedUploaders(),
        getStorageStats(),
      ]);
      setUploaders(uploaderList);
      setStats(storageStats);
    } catch (err: any) {
      setError(err.message ?? String(err));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddUploader = async () => {
    if (!newUploader) return;
    setMessage('');
    setError('');
    try {
      await addAuthorizedUploader(newUploader);
      setMessage('Uploader added successfully');
      setNewUploader('');
      await loadData();
    } catch (err: any) {
      setError(err.message ?? String(err));
    }
  };

  const handleRemoveUploader = async (principal: string) => {
    setMessage('');
    setError('');
    try {
      await removeAuthorizedUploader(principal);
      setMessage('Uploader removed successfully');
      await loadData();
    } catch (err: any) {
      setError(err.message ?? String(err));
    }
  };

  const handleUpdateLimits = async () => {
    setMessage('');
    setError('');
    try {
      const maxFile = maxFileSize ? parseInt(maxFileSize, 10) : null;
      const maxTotal = maxTotalStorage ? parseInt(maxTotalStorage, 10) : null;
      await updateStorageLimits(maxFile, maxTotal);
      setMessage('Storage limits updated');
      setMaxFileSize('');
      setMaxTotalStorage('');
      await loadData();
    } catch (err: any) {
      setError(err.message ?? String(err));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 font-mono">ASSETS ADMIN</h2>
        <p className="text-gray-400">Manage uploaders and storage limits</p>
      </div>

      {message && <p className="text-green-400">{message}</p>}
      {error && <p className="text-red-400">{error}</p>}

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white font-mono">Authorized Uploaders</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newUploader}
            onChange={(e) => setNewUploader(e.target.value)}
            placeholder="Principal"
            className="flex-grow px-3 py-2 bg-gray-800 text-white rounded"
          />
          <button
            onClick={handleAddUploader}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </button>
        </div>
        <ul className="space-y-2">
          {uploaders.map((p) => (
            <li
              key={p}
              className="flex justify-between items-center bg-gray-800/50 p-2 rounded"
            >
              <span className="text-white font-mono text-sm break-all">{p}</span>
              <button
                onClick={() => handleRemoveUploader(p)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white font-mono">Storage Limits</h3>
        {stats && (
          <div className="text-gray-400 text-sm space-y-1">
            <p>Used: {stats.storageUsed?.toString()} bytes</p>
            <p>Limit: {stats.storageLimit?.toString()} bytes</p>
            <p>Available: {stats.storageAvailable?.toString()} bytes</p>
          </div>
        )}
        <div className="flex space-x-2">
          <input
            type="number"
            value={maxFileSize}
            onChange={(e) => setMaxFileSize(e.target.value)}
            placeholder="Max file size (bytes)"
            className="flex-grow px-3 py-2 bg-gray-800 text-white rounded"
          />
          <input
            type="number"
            value={maxTotalStorage}
            onChange={(e) => setMaxTotalStorage(e.target.value)}
            placeholder="Max total storage (bytes)"
            className="flex-grow px-3 py-2 bg-gray-800 text-white rounded"
          />
          <button
            onClick={handleUpdateLimits}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagementAssetsAdmin;

