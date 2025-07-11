// src/SignIn.jsx
import React, { useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';

export default function SignIn() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);

  const login = async () => {
    const authClient = await AuthClient.create();
    await authClient.login({
      identityProvider: "https://identity.ic0.app",
      onSuccess: async () => {
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal().toText();
        setPrincipal(principal);
        setIsAuthenticated(true);
      },
    });
  };

  const logout = async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
    setIsAuthenticated(false);
    setPrincipal(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
      <h1 className="text-3xl font-bold mb-4">Sign In with Internet Identity</h1>
      {isAuthenticated ? (
        <>
          <p className="mb-4">👤 Logged in as:</p>
          <code className="bg-gray-200 p-2 rounded">{principal}</code>
          <button
            className="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={logout}
          >
            Logout
          </button>
        </>
      ) : (
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={login}
        >
          Sign In with Internet Identity
        </button>
      )}
    </div>
  );
}
