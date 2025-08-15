import { Actor, HttpAgent } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";
import { idlFactory as daoBackendIdl } from "../declarations/dao_backend";
import { idlFactory as governanceIdl } from "../declarations/governance";

declare global {
  interface Window {
    global: typeof globalThis;
  }
}

// Ensure global is defined in the browser context
if (typeof window !== "undefined") {
  window.global = window;
}

const createActor = async (canisterId: string, idlFactory: IDL.InterfaceFactory) => {
  try {
    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST || "http://localhost:4943",
      verifyQuerySignatures: false
    });

    // Only fetch the root key when we're in development
    if (import.meta.env.VITE_DFX_NETWORK !== "ic") {
      await agent.fetchRootKey().catch(err => {
        console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
        console.error(err);
      });
    }

    return Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });
  } catch (error) {
    console.error("Error creating actor:", error);
    throw error;
  }
};

export const initializeAgents = async () => {
  try {
    const daoBackend = await createActor(
      import.meta.env.VITE_CANISTER_ID_DAO_BACKEND,
      daoBackendIdl
    );
    const governance = await createActor(
      import.meta.env.VITE_CANISTER_ID_GOVERNANCE,
      governanceIdl
    );

    return {
      daoBackend,
      governance,
    };
  } catch (error) {
    console.error("Failed to initialize actors:", error);
    throw error;
  }
};