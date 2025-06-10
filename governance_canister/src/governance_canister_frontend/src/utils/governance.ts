import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../../declarations/governance_canister_backend';
import { canisterId } from '../../../declarations/governance_canister_backend';


const agent = new HttpAgent({ host: 'http://127.0.0.1:4943' });

const governanceActorPromise = (async () => {
  await agent.fetchRootKey();
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
})();

export default governanceActorPromise;
