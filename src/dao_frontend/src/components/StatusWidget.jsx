import React, { useEffect, useState } from 'react';
import { useActors } from '../context/ActorContext';

const StatusWidget = () => {
  const { daoBackend, assets } = useActors();
  const [backendHealth, setBackendHealth] = useState(null);
  const [assetsHealth, setAssetsHealth] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - health may not be in generated types
        const backend = await daoBackend.health();
        setBackendHealth(backend);
      } catch (err) {
        console.error('Failed to fetch daoBackend health', err);
      }
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - health may not be in generated types
        const asset = await assets.health();
        setAssetsHealth(asset);
      } catch (err) {
        console.error('Failed to fetch assets health', err);
      }
    };
    fetchHealth();
  }, [daoBackend, assets]);

  const formatHeartbeat = (hb) => {
    if (!hb) return 'N/A';
    try {
      const n = typeof hb === 'bigint' ? Number(hb) : hb;
      // assume nanoseconds if large number
      const ms = n > 1e12 ? n / 1e6 : n;
      return new Date(ms).toLocaleString();
    } catch {
      return String(hb);
    }
  };

  const backendStatus = backendHealth?.status || backendHealth?.ok?.status || 'Unknown';
  const backendHeartbeat = backendHealth?.last_heartbeat || backendHealth?.ok?.last_heartbeat;
  const assetsStatus = assetsHealth?.status || assetsHealth?.ok?.status || 'Unknown';
  const assetsHeartbeat = assetsHealth?.last_heartbeat || assetsHealth?.ok?.last_heartbeat;

  return (
    <div className="bg-gray-800/50 p-4 rounded-xl border border-cyan-500/20 mb-8">
      <h2 className="text-lg font-mono text-cyan-400 mb-2">Service Health</h2>
      <div className="space-y-1 text-sm">
        <div>
          <span className="font-bold">DAO Backend:</span> {backendStatus}
          <span className="ml-2 text-gray-400">Last heartbeat: {formatHeartbeat(backendHeartbeat)}</span>
        </div>
        <div>
          <span className="font-bold">Assets:</span> {assetsStatus}
          <span className="ml-2 text-gray-400">Last heartbeat: {formatHeartbeat(assetsHeartbeat)}</span>
        </div>
      </div>
    </div>
  );
};

export default StatusWidget;
