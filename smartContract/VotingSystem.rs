// src/lib.rs

use ic_cdk::api::management_canister::main::http_request::{HttpResponse, TransformArgs};
use ic_cdk::export::candid::{CandidType, Deserialize};
use ic_cdk_macros::{query, update};
use ic_cdk::export::Principal;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};

// A Proposal with an id, description, and vote count.
#[derive(Clone, Debug, CandidType, Deserialize)]
struct Proposal {
    id: u64,
    description: String,
    votes: u64,
}

// Storage for all proposals.
thread_local! {
    static PROPOSALS: RefCell<Vec<Proposal>> = RefCell::default();
    // Tracks which principals have voted on which proposal IDs.
    static VOTERS: RefCell<HashMap<u64, HashSet<Principal>>> = RefCell::default();
    // Auto-incrementing ID counter.
    static NEXT_ID: RefCell<u64> = RefCell::new(1);
}

/// Create a new proposal. Returns its assigned ID.
#[update]
fn create_proposal(description: String) -> u64 {
    // Generate a new unique ID
    let id = NEXT_ID.with(|c| {
        let mut ctr = c.borrow_mut();
        let current = *ctr;    
        *ctr += 1;
        current
    });

    // Insert into PROPOSALS
    PROPOSALS.with(|ps| {
        ps.borrow_mut().push(Proposal {
            id,
            description,
            votes: 0,
        })
    });

    id
}

/// Cast a vote for a given proposal ID.
/// Returns `true` if vote succeeded, `false` if user already voted or proposal not found.
#[update]
fn vote(proposal_id: u64) -> bool {
    let caller = ic_cdk::caller();

    // Check proposal exists
    let exists = PROPOSALS.with(|ps| ps.borrow().iter().any(|p| p.id == proposal_id));
    if !exists {
        return false;
    }

    // Check & record voter's participation
    let already_voted = VOTERS.with(|v| {
        let mut map = v.borrow_mut();
        let voters = map.entry(proposal_id).or_default();
        if voters.contains(&caller) {
            true
        } else {
            voters.insert(caller);
            false
        }
    });
    if already_voted {
        return false;
    }

    // Increment vote count
    PROPOSALS.with(|ps| {
        for p in ps.borrow_mut().iter_mut() {
            if p.id == proposal_id {
                p.votes += 1;
                break;
            }
        }
    });

    true
}

/// Retrieve the list of all proposals and their current vote counts.
#[query]
fn list_proposals() -> Vec<Proposal> {
    PROPOSALS.with(|ps| ps.borrow().clone())
}
