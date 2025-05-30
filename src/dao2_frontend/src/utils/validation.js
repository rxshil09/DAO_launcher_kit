export const validateDAOName = (name) => {
  if (!name || name.trim().length < 3) {
    return 'DAO name must be at least 3 characters long';
  }
  if (name.length > 50) {
    return 'DAO name must be less than 50 characters';
  }
  if (!/^[a-zA-Z0-9\s-_]+$/.test(name)) {
    return 'DAO name can only contain letters, numbers, spaces, hyphens, and underscores';
  }
  return null;
};

export const validateTokenSymbol = (symbol) => {
  if (!symbol || symbol.trim().length < 2) {
    return 'Token symbol must be at least 2 characters long';
  }
  if (symbol.length > 6) {
    return 'Token symbol must be less than 6 characters';
  }
  if (!/^[A-Z]+$/.test(symbol)) {
    return 'Token symbol can only contain uppercase letters';
  }
  return null;
};

export const validateTotalSupply = (supply) => {
  const num = parseInt(supply);
  if (isNaN(num) || num <= 0) {
    return 'Total supply must be a positive number';
  }
  if (num > 1000000000000) {
    return 'Total supply cannot exceed 1 trillion tokens';
  }
  return null;
};

export const validateDescription = (description) => {
  if (!description || description.trim().length < 10) {
    return 'Description must be at least 10 characters long';
  }
  if (description.length > 500) {
    return 'Description must be less than 500 characters';
  }
  return null;
};

export const validateModuleSelection = (selectedModules) => {
  const hasSelectedModules = Object.values(selectedModules).some(category => 
    Object.values(category).some(module => module)
  );
  
  if (!hasSelectedModules) {
    return 'Please select at least one module';
  }
  return null;
};