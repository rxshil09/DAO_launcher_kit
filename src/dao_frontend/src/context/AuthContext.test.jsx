import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { ActorProvider } from './ActorContext';
import { initializeAgents } from '../config/agent';

// Mock AuthClient from DFINITY
const mockPrincipal = { toString: () => 'aaaa-bbbb' };
const mockIdentity = { getPrincipal: () => mockPrincipal };
const mockAuthClient = {
  login: ({ onSuccess }) => { onSuccess(); },
  isAuthenticated: () => Promise.resolve(false),
  getIdentity: () => mockIdentity,
  logout: vi.fn(),
};

vi.mock('@dfinity/auth-client', () => ({
  AuthClient: {
    create: vi.fn(() => Promise.resolve(mockAuthClient)),
  },
}));

vi.mock('./ActorContext', async () => {
  const actual = await vi.importActual('./ActorContext');
  return {
    ...actual,
    useActors: () => ({
      daoBackend: { registerUser: vi.fn(async () => ({ ok: null })) },
    }),
  };
});

vi.mock('../config/agent', () => ({
  initializeAgents: vi.fn(async () => ({})),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates identity and principal after login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.authClient).toBeDefined());

    await act(async () => {
      await result.current.login();
    });

    expect(result.current.identity).toBe(mockIdentity);
    expect(result.current.principal).toBe('aaaa-bbbb');
  });

  it('ActorProvider receives authenticated identity', async () => {
    const wrapper = ({ children }) => (
      <AuthProvider>
        <ActorProvider>{children}</ActorProvider>
      </AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.authClient).toBeDefined());

    await act(async () => {
      await result.current.login();
    });

    await waitFor(() => {
      expect(initializeAgents).toHaveBeenCalledWith(mockIdentity);
    });
  });
});
