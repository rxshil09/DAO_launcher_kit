import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDAOAPI } from '../utils/daoAPI';
import BackgroundParticles from './BackgroundParticles';
import { Loader2 } from 'lucide-react';

const formatPrincipal = (opt) => (opt && opt[0] ? opt[0].toText() : 'Not set');

const Diagnostics = () => {
  const { isAuthenticated, loading } = useAuth();
  const daoAPI = useDAOAPI();

  const [references, setReferences] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReferences = async () => {
      if (!daoAPI) return;
      try {
        const refs = await daoAPI.getCanisterReferences();
        setReferences(refs);
      } catch (err) {
        console.error('Failed to fetch canister references', err);
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };
    fetchReferences();
  }, [daoAPI]);

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
      </div>
    </div>
  );
};

export default Diagnostics;

