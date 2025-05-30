import React from 'react';

export default function TokenConfiguration({ tokenConfig, onTokenConfigUpdate, errors = {} }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token Name
          </label>
          <input
            type="text"
            value={tokenConfig.name}
            onChange={(e) => onTokenConfigUpdate({ name: e.target.value })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.tokenName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., MyDAO Token"
          />
          {errors.tokenName && (
            <p className="mt-1 text-sm text-red-600">{errors.tokenName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token Symbol
          </label>
          <input
            type="text"
            value={tokenConfig.symbol}
            onChange={(e) => onTokenConfigUpdate({ symbol: e.target.value.toUpperCase() })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.tokenSymbol ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., MYD"
            maxLength={6}
          />
          {errors.tokenSymbol && (
            <p className="mt-1 text-sm text-red-600">{errors.tokenSymbol}</p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Total Supply
        </label>
        <input
          type="number"
          value={tokenConfig.totalSupply}
          onChange={(e) => onTokenConfigUpdate({ totalSupply: e.target.value })}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.totalSupply ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="1000000"
          min="1"
        />
        {errors.totalSupply && (
          <p className="mt-1 text-sm text-red-600">{errors.totalSupply}</p>
        )}
        <p className="mt-2 text-sm text-gray-600">
          This is the total number of governance tokens that will be created for your DAO.
        </p>
      </div>
    </div>
  );
}