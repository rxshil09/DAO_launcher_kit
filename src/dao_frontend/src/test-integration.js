/**
 * Integration Test Script
 * This script tests the frontend-backend integration
 */

import { createActor } from './config/agent.js';
import { idlFactory } from '@declarations/dao_backend/dao_backend.did.js';
import { HttpAgent } from '@dfinity/agent';

async function testIntegration() {
  try {
    console.log('🧪 Testing Frontend-Backend Integration...');
    
    // Create an agent
    const agent = new HttpAgent({
      host: "http://127.0.0.1:4943",
      verifyQuerySignatures: false,
    });
    
    // Fetch root key for local development
    await agent.fetchRootKey();
    
    // Create actor
    const actor = Actor.createActor(idlFactory, {
      agent,
      canisterId: import.meta.env.VITE_CANISTER_ID_DAO_BACKEND,
    });
    
    // Test health endpoint
    const health = await actor.health();
    console.log('✅ Health check:', health);
    
    // Test DAO stats
    const stats = await actor.getDAOStats();
    console.log('✅ DAO Stats:', stats);
    
    console.log('🎉 Integration test successful!');
    return true;
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    return false;
  }
}

// Export for use in other files
export { testIntegration };
