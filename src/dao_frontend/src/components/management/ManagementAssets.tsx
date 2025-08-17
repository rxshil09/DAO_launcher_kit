import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { DAO } from '../../types/dao';
import { useAssets } from '../../hooks/useAssets';

const ManagementAssets: React.FC = () => {
  const { dao } = useOutletContext<{ dao: DAO }>();
  const {
    getAuthorizedUploaders,
    addAuthorizedUploader,
    removeAuthorizedUploader,
    updateStorageLimits,
    getStorageStats,
  } = useAssets();

  const [uploaders, setUploaders] = useState<string[]>([]);
  const [newUploader, setNewUploader] = useState('');
  const [maxFileSize, setMaxFileSize] = useState('');
  const [maxTotalStorage, setMaxTotalStorage] = useState('');
  const [stats, setStats] = useState<any>(null);

  const fetchUploaders = async () => {
    try {
      const list = await getAuthorizedUploaders();
      setUploaders(list);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const s = await getStorageStats();
      setStats(s);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUploaders();
    fetchStats();
  }, []);

  const handleAddUploader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUploader) return;
    try {
      await addAuthorizedUploader(newUploader);
      setNewUploader('');
      fetchUploaders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveUploader = async (p: string) => {
    try {
      await removeAuthorizedUploader(p);
      fetchUploaders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStorageLimits(
        maxFileSize ? BigInt(maxFileSize) : null,
        maxTotalStorage ? BigInt(maxTotalStorage) : null
      );
      setMaxFileSize('');
      setMaxTotalStorage('');
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 font-mono">ASSETS</h2>
          <p className="text-gray-400">
            Manage digital assets and files for {dao.name}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all font-semibold"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Asset</span>
        </motion.button>
      </div>

      <section>
        <h3 className="text-xl font-bold text-white mb-4 font-mono">
          Authorized Uploaders
        </h3>
        <form onSubmit={handleAddUploader} className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newUploader}
            onChange={(e) => setNewUploader(e.target.value)}
            placeholder="Principal"
            className="px-2 py-1 text-black flex-1"
          />
          <button type="submit" className="px-3 py-1 bg-blue-600 rounded">
            Add
          </button>
        </form>
        <ul className="space-y-2">
          {uploaders.map((u) => (
            <li
              key={u}
              className="flex justify-between items-center bg-gray-800/50 p-2 rounded"
            >
              <span className="font-mono text-sm break-all">{u}</span>
              <button
                onClick={() => handleRemoveUploader(u)}
                className="text-red-400 text-sm"
              >
                Remove
              </button>
            </li>
          ))}
          {uploaders.length === 0 && (
            <li className="text-gray-400 text-sm">No authorized uploaders</li>
          )}
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-white mb-4 font-mono">
          Storage Limits
        </h3>
        {stats && (
          <div className="text-sm text-gray-300 mb-4">
            <p>
              Storage Used: {Number(stats.storageUsed)} /{' '}
              {Number(stats.storageLimit)}
            </p>
          </div>
        )}
        <form
          onSubmit={handleUpdateLimits}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <input
            type="number"
            value={maxFileSize}
            onChange={(e) => setMaxFileSize(e.target.value)}
            placeholder="Max file size"
            className="px-2 py-1 text-black"
          />
          <input
            type="number"
            value={maxTotalStorage}
            onChange={(e) => setMaxTotalStorage(e.target.value)}
            placeholder="Max total storage"
            className="px-2 py-1 text-black"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-green-600 rounded text-white"
          >
            Update
          </button>
        </form>
      </section>
    </div>
  );
};

export default ManagementAssets;

