import React from 'react';

const networks = [
  { id: 'icp', name: 'Internet Computer', logo: '🌐', description: 'Fast, secure, and scalable blockchain' },
  { id: 'ethereum', name: 'Ethereum', logo: '⟠', description: 'Most established smart contract platform' },
  { id: 'polygon', name: 'Polygon', logo: '⬟', description: 'Layer 2 scaling solution for Ethereum' }
];

export default function NetworkSelector({ selectedNetwork, onNetworkSelect }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Network</h3>
      <div className="grid gap-4">
        {networks.map((network) => (
          <div
            key={network.id}
            onClick={() => onNetworkSelect(network.id)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedNetwork === network.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{network.logo}</span>
              <div>
                <span className="font-medium">{network.name}</span>
                <p className="text-sm text-gray-600">{network.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}