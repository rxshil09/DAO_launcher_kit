import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useActors } from '../context/ActorContext';
import BackgroundParticles from './BackgroundParticles';
import { Loader2 } from 'lucide-react';
import StatusWidget from './StatusWidget';
import { safeJsonStringify } from '../utils/jsonUtils';

const formatPrincipal = (opt) => (opt && opt[0] ? opt[0].toText() : 'Not set');

const DAOStatus = () => {
  const { isAuthenticated, loading } = useAuth();
  const { daoBackend } = useActors();

  const [config, setConfig] = useState(null);
  const [references, setReferences] = useState(null);
  const [stats, setStats] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - generated type may not include these methods yet
        const cfgOpt = await daoBackend.getDAOConfig();
        const cfg = Array.isArray(cfgOpt) && cfgOpt.length ? cfgOpt[0] : null;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const refs = await daoBackend.getCanisterReferences();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const s = await daoBackend.getDAOStats();
        setConfig(cfg);
        setReferences(refs);
        setStats(s);
      } catch (err) {
        console.error('Failed to fetch DAO status', err);
      } finally {
        setFetching(false);
      }
    };
    fetchStatus();
  }, [daoBackend]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <BackgroundParticles />
        <div className="relative min-h-screen flex items-center justify-center px-4 z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-cyan-400 font-mono">Loading status...</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24 sm:pt-28">
        <h1 className="text-3xl font-bold text-white mb-8 font-mono">DAO Status</h1>
        <StatusWidget />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 p-6 rounded-xl border border-cyan-500/20">
            <h2 className="text-xl font-mono text-cyan-400 mb-4">Configuration</h2>
            {config ? (
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                {safeJsonStringify(config, 2)}
              </pre>
            ) : (
              <p className="text-gray-400">No configuration found.</p>
            )}
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-cyan-500/20">
            <h2 className="text-xl font-mono text-cyan-400 mb-4">Canister References</h2>
            {references ? (
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
          <div className="bg-gray-800/50 p-6 rounded-xl border border-cyan-500/20">
            <h2 className="text-xl font-mono text-cyan-400 mb-4">DAO Stats</h2>
            {stats ? (
              <ul className="space-y-1 text-sm">
                <li>Total Members: {stats.totalMembers?.toString()}</li>
                <li>Total Proposals: {stats.totalProposals?.toString()}</li>
                <li>Active Proposals: {stats.activeProposals?.toString()}</li>
                <li>Total Staked: {stats.totalStaked?.toString()}</li>
                <li>Treasury Balance: {stats.treasuryBalance?.toString()}</li>
                <li>Total Voting Power: {stats.totalVotingPower?.toString()}</li>
              </ul>
            ) : (
              <p className="text-gray-400">No stats available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DAOStatus;

