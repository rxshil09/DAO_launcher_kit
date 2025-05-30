import { useState, useCallback } from 'react';
import { validateDAOName, validateTokenSymbol, validateTotalSupply, validateDescription } from '../utils/validation';

export const useDAOConfig = () => {
  const [config, setConfig] = useState({
    name: '',
    description: '',
    network: 'icp',
    tokenConfig: {
      name: '',
      symbol: '',
      totalSupply: ''
    }
  });

  const [errors, setErrors] = useState({});

  const updateConfig = useCallback((updates) => {
    setConfig(prev => ({
      ...prev,
      ...updates
    }));
    
    // Clear related errors when updating
    const errorKeys = Object.keys(updates);
    setErrors(prev => {
      const newErrors = { ...prev };
      errorKeys.forEach(key => delete newErrors[key]);
      return newErrors;
    });
  }, []);

  const updateTokenConfig = useCallback((tokenUpdates) => {
    setConfig(prev => ({
      ...prev,
      tokenConfig: {
        ...prev.tokenConfig,
        ...tokenUpdates
      }
    }));
  }, []);

  const validateConfig = useCallback(() => {
    const newErrors = {};
    
    const nameError = validateDAOName(config.name);
    if (nameError) newErrors.name = nameError;
    
    const descError = validateDescription(config.description);
    if (descError) newErrors.description = descError;
    
    const symbolError = validateTokenSymbol(config.tokenConfig.symbol);
    if (symbolError) newErrors.tokenSymbol = symbolError;
    
    const supplyError = validateTotalSupply(config.tokenConfig.totalSupply);
    if (supplyError) newErrors.totalSupply = supplyError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [config]);

  return {
    config,
    errors,
    updateConfig,
    updateTokenConfig,
    validateConfig
  };
};