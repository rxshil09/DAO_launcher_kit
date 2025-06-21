import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from '../../../declarations/governance_canister_backend';
import { canisterId } from '../../../declarations/governance_canister_backend';


const agent = new HttpAgent();

const governanceActor = Actor.createActor(idlFactory, {
  agent,
  canisterId,
});

export default governanceActor;
