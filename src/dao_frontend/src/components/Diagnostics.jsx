import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDAOAPI } from '../utils/daoAPI';
import { useAssets } from '../hooks/useAssets';
import BackgroundParticles from './BackgroundParticles';
import { Loader2 } from 'lucide-react';

const formatPrincipal = (opt) => (opt && opt[0] ? opt[0].toText() : 'Not set');

const formatTimestamp = (t) => {
  if (!t) return 'N/A';
  try {
    const n = typeof t === 'bigint' ? Number(t) : t;
    const ms = n > 1e12 ? n / 1e6 : n;
    return new Date(ms).toLocaleString();
  } catch {
    return String(t);
  }
};

const formatStorage = (n) => {
  if (n === undefined || n === null) return 'N/A';
  try {
    const num = typeof n === 'bigint' ? Number(n) : n;
    if (Number.isNaN(num)) return String(n);
    if (num > 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(2)} MB`;
    if (num > 1024) return `${(num / 1024).toFixed(2)} KB`;
    return `${num} B`;
  } catch {
    return String(n);
  }
};

const Diagnostics = () => {
  const { isAuthenticated, loading } = useAuth();
  const daoAPI = useDAOAPI();
  const { getHealth: getAssetsHealth } = useAssets();

  const [references, setReferences] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [backendHealth, setBackendHealth] = useState(null);
  const [assetsHealth, setAssetsHealth] = useState(null);
  const [healthErrors, setHealthErrors] = useState({ backend: null, assets: null });

  useEffect(() => {
    const fetchData = async () => {
      if (!daoAPI) return;
      try {
        const refs = await daoAPI.getCanisterReferences();
        setReferences(refs);
      } catch (err) {
        console.error('Failed to fetch canister references', err);
        setError(err.message);
      }

      try {
        const backend = await daoAPI.healthCheck();
        setBackendHealth(backend);
      } catch (err) {
        console.error('Failed to fetch backend health', err);
        setHealthErrors((h) => ({ ...h, backend: err.message || 'Service unreachable' }));
      }

      try {
        const assets = await getAssetsHealth();
        setAssetsHealth(assets);
      } catch (err) {
        console.error('Failed to fetch assets health', err);
        setHealthErrors((h) => ({ ...h, assets: err.message || 'Service unreachable' }));
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [daoAPI, getAssetsHealth]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <BackgroundParticles />
        <div className="relative min-h-screen flex items-center justify-center px-4 z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-cyan-400 font-mono">Checking connectivity...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <BackgroundParticles />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24 sm:pt-28">
        <h1 className="text-3xl font-bold text-white mb-8 font-mono">Diagnostics</h1>
        <div className="bg-gray-800/50 p-6 rounded-xl border border-cyan-500/20">
          <h2 className="text-xl font-mono text-cyan-400 mb-4">Canister Principals</h2>
          {error ? (
            <p className="text-red-400">Error: {error}</p>
          ) : references ? (
            <ul className="space-y-1 text-sm">
              <li>Governance: {formatPrincipal(references.governance)}</li>
              <li>Staking: {formatPrincipal(references.staking)}</li>
              <li>Treasury: {formatPrincipal(references.treasury)}</li>
              <li>Proposals: {formatPrincipal(references.proposals)}</li>
            </ul>
          ) : (
            <p className="text-gray-400">No references available.</p>
          )}
        </div>
        <div className="bg-gray-800/50 p-6 rounded-xl border border-cyan-500/20 mt-8">
          <h2 className="text-xl font-mono text-cyan-400 mb-4">Service Health</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <span className="font-bold">DAO Backend:</span>{' '}
              {healthErrors.backend ? (
                <span className="text-red-400">Unreachable ({healthErrors.backend})</span>
              ) : backendHealth ? (
                <>
                  {backendHealth.status}
                  <span className="ml-2 text-gray-400">
                    Time: {formatTimestamp(backendHealth.timestamp)}
                  </span>
                  <span className="ml-2 text-gray-400">
                    Storage: {formatStorage(backendHealth.storageUsed)}
                  </span>
                </>
              ) : (
                'Unknown'
              )}
            </li>
            <li>
              <span className="font-bold">Assets:</span>{' '}
              {healthErrors.assets ? (
                <span className="text-red-400">Unreachable ({healthErrors.assets})</span>
              ) : assetsHealth ? (
                <>
                  {assetsHealth.status}
                  <span className="ml-2 text-gray-400">
                    Time: {formatTimestamp(assetsHealth.timestamp)}
                  </span>
                  <span className="ml-2 text-gray-400">
                    Storage: {formatStorage(assetsHealth.storageUsed)}
                  </span>
                </>
              ) : (
                'Unknown'
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;

