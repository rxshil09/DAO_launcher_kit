import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useDAOAPI } from '../../utils/daoAPI';
// @ts-ignore - AuthContext is a .jsx file
import { useAuth } from '../../context/AuthContext';
import { useOutletContext } from 'react-router-dom';
import { DAO } from '../../types/dao';
import { Principal } from '@dfinity/principal';

const ManagementAdmins: React.FC = () => {
  const { dao } = useOutletContext<{ dao: DAO }>();
  const daoAPI = useDAOAPI();
  const { principal } = useAuth();

  const [admins, setAdmins] = useState<string[]>([]);
  const [newAdmin, setNewAdmin] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const loadAdmins = async () => {
    if (!daoAPI) return;
    try {
      setLoading(true);
      const users = await daoAPI.getAllUsers();
      const adminList: string[] = [];
      for (const user of users) {
        const isAdmin = await daoAPI.checkIsAdmin(user.id);
        if (isAdmin) {
          adminList.push(user.id.toText());
        }
      }
      setAdmins(adminList);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  const verifyAccess = async () => {
    if (!daoAPI || !principal) return;
    try {
      const isAdmin = await daoAPI.checkIsAdmin(Principal.fromText(principal));
      setIsAuthorized(isAdmin);
      if (isAdmin) {
        await loadAdmins();
      } else {
        setError('Only admins can manage administrators');
      }
    } catch (err: any) {
      setError(err.message ?? String(err));
    }
  };

  useEffect(() => {
    verifyAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daoAPI, principal]);

  const handleAddAdmin = async () => {
    if (!newAdmin || !daoAPI) return;
    setMessage('');
    setError('');
    try {
      await daoAPI.addAdmin(Principal.fromText(newAdmin));
      setMessage('Admin added successfully');
      setNewAdmin('');
      await loadAdmins();
    } catch (err: any) {
      setError(err.message ?? String(err));
    }
  };

  const handleRemoveAdmin = async (admin: string) => {
    if (!daoAPI) return;
    setMessage('');
    setError('');
    try {
      await daoAPI.removeAdmin(Principal.fromText(admin));
      setMessage('Admin removed successfully');
      await loadAdmins();
    } catch (err: any) {
      setError(err.message ?? String(err));
    }
  };

  if (!isAuthorized) {
    return (
      <div className="space-y-4">
        {error && <p className="text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2 font-mono">ADMINISTRATORS</h2>
        <p className="text-gray-400">Manage administrator access for {dao.name}</p>
      </div>

      {message && <p className="text-green-400">{message}</p>}
      {error && <p className="text-red-400">{error}</p>}

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white font-mono">Current Admins</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newAdmin}
            onChange={(e) => setNewAdmin(e.target.value)}
            placeholder="Principal"
            className="flex-grow px-3 py-2 bg-gray-800 text-white rounded"
          />
          <button
            onClick={handleAddAdmin}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </button>
        </div>
        {loading ? (
          <p className="text-gray-400">Loading admins...</p>
        ) : (
          <ul className="space-y-2">
            {admins.map((p) => (
              <li
                key={p}
                className="flex justify-between items-center bg-gray-800/50 p-2 rounded"
              >
                <span className="text-white font-mono text-sm break-all">{p}</span>
                <button
                  onClick={() => handleRemoveAdmin(p)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManagementAdmins;

