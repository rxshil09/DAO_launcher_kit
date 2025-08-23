/**
 * Simple event bus for cross-component communication
 * Used to notify components about DAO creation and other events
 */

class EventBus {
  constructor() {
    this.events = {};
  }

  // Subscribe to an event
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  // Emit an event
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }

    // Also emit as custom DOM event for broader compatibility
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(event, { detail: data }));
    }
  }

  // Remove all listeners for an event
  off(event) {
    delete this.events[event];
  }

  // Remove all listeners
  clear() {
    this.events = {};
  }
}

// Create singleton instance
const eventBus = new EventBus();

// Event constants
export const EVENTS = {
  DAO_CREATED: 'dao-created',
  DAO_UPDATED: 'dao-updated',
  DAO_DELETED: 'dao-deleted',
  USER_REGISTERED: 'user-registered',
  PROPOSAL_CREATED: 'proposal-created',
  VOTE_CAST: 'vote-cast'
};

export default eventBus;