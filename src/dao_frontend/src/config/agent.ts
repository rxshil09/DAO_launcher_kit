import { Actor, HttpAgent } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";

declare global {
  interface Window {
    global: typeof globalThis;
  }
}

// Ensure global is defined in the browser context
if (typeof window !== "undefined") {
  window.global = window;
}

// Temporary IDL definitions until we fix the import issues
const createActorInterface = () => {
  return IDL.Service({
    'createDAO': IDL.Func([IDL.Text], [IDL.Variant({ 'Ok': IDL.Text, 'Err': IDL.Text })], []),
    'getDAODetails': IDL.Func([IDL.Text], [IDL.Opt(IDL.Record({
      'name': IDL.Text,
      'description': IDL.Text,
      'creator': IDL.Principal
    }))], ['query'])
  });
};

const createActor = async (canisterId: string) => {
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

    return Actor.createActor(createActorInterface, {
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
    const daoBackend = await createActor(import.meta.env.VITE_CANISTER_ID_DAO_BACKEND);
    const governance = await createActor(import.meta.env.VITE_CANISTER_ID_GOVERNANCE);
    
    return {
      daoBackend,
      governance,
    };
  } catch (error) {
    console.error("Failed to initialize actors:", error);
    throw error;
  }
};