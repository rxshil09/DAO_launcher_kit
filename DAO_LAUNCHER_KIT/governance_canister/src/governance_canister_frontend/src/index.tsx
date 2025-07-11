import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App'; // Assuming you created this
import { HttpAgent } from "@dfinity/agent";
import { Actor } from "@dfinity/agent";
import { idlFactory as backend_idl, canisterId as backend_id } from "../../declarations/governance_canister_backend";

const agent = new HttpAgent();

if (process.env.DFX_NETWORK === "local") {
  agent.fetchRootKey().catch((err) => {
    console.error("Could not fetch root key:", err);
  });
}

const governance_canister_backend = Actor.createActor(backend_idl, {
  agent,
  canisterId: backend_id,
});

// Then use governance_canister_backend in your components

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
