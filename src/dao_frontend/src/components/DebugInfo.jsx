import React from 'react';

const DebugInfo = () => {
  const envVars = {
    'VITE_CANISTER_ID_DAO_BACKEND': import.meta.env.VITE_CANISTER_ID_DAO_BACKEND,
    'VITE_CANISTER_ID_GOVERNANCE': import.meta.env.VITE_CANISTER_ID_GOVERNANCE,
    'VITE_CANISTER_ID_STAKING': import.meta.env.VITE_CANISTER_ID_STAKING,
    'VITE_CANISTER_ID_TREASURY': import.meta.env.VITE_CANISTER_ID_TREASURY,
    'VITE_CANISTER_ID_PROPOSALS': import.meta.env.VITE_CANISTER_ID_PROPOSALS,
    'VITE_CANISTER_ID_ASSETS': import.meta.env.VITE_CANISTER_ID_ASSETS,
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      fontSize: '12px',
      borderRadius: '4px',
      maxWidth: '400px',
      zIndex: 9999 
    }}>
      <h3>Debug: Environment Variables</h3>
      {Object.entries(envVars).map(([key, value]) => (
        <div key={key}>
          <strong>{key.replace('VITE_CANISTER_ID_', '')}:</strong> {value || 'undefined'}
        </div>
      ))}
    </div>
  );
};

export default DebugInfo;
