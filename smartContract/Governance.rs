// src/lib.rs

use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use ic_cdk_macros::{update, query};
use ic_cdk::api::call::call;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};

// A proposal’s action: target canister, method name, and args in Candid bytes.
#[derive(Clone, CandidType, Deserialize)]
struct Action {
    canister: Principal,
    method: String,
    args: Vec<u8>,
}

// A governance proposal.
#[derive(Clone, CandidType, Deserialize)]
struct Proposal {
    id: u64,
    description: String,
    action: Action,
    votes_yes: u64,
    votes_no: u64,
    executed: bool,
}

// In-memory storage
thread_local! {
    // All proposals by id
    static PROPOSALS: RefCell<HashMap<u64, Proposal>> = RefCell::default();
    // Which principals have voted on which proposal
    static VOTERS: RefCell<HashMap<u64, HashSet<Principal>>> = RefCell::default();
    // Next proposal ID
    static NEXT_ID: RefCell<u64> = RefCell::new(1);
}

// Create a new proposal. Returns its ID.
#[update]
fn create_proposal(description: String, target: Principal, method: String, args: Vec<u8>) -> u64 {
    let id = NEXT_ID.with(|n| {
        let mut v = n.borrow_mut();
        let cur = *v;
        *v += 1;
        cur
    });

    let proposal = Proposal {
        id,
        description,
        action: Action { canister: target, method, args },
        votes_yes: 0,
        votes_no: 0,
        executed: false,
    };

    PROPOSALS.with(|map| map.borrow_mut().insert(id, proposal));
    VOTERS.with(|map| map.borrow_mut().insert(id, HashSet::new()));

    id
}

// Vote yes on a proposal.
#[update]
fn vote_yes(id: u64) -> Result<(), String> {
    vote(id, true)
}

// Vote no on a proposal.
#[update]
fn vote_no(id: u64) -> Result<(), String> {
    vote(id, false)
}

// Internal voting logic
fn vote(id: u64, yes: bool) -> Result<(), String> {
    let caller = ic_cdk::caller();

    // Check proposal exists
    PROPOSALS.with(|map| {
        let mut map = map.borrow_mut();
        let prop = map.get_mut(&id).ok_or("Proposal not found")?;
        if prop.executed {
            return Err("Proposal already executed".to_string());
        }

        // Check caller hasn't voted yet
        VOTERS.with(|vmap| {
            let mut vmap = vmap.borrow_mut();
            let voters = vmap.get_mut(&id).unwrap();
            if !voters.insert(caller) {
                return Err("Already voted".to_string());
            }

            // Register vote
            if yes {
                prop.votes_yes += 1;
            } else {
                prop.votes_no += 1;
            }
            Ok(())
        })
    })
}

// Execute the proposal if yes-votes > no-votes
#[update]
async fn execute(id: u64) -> Result<String, String> {
    // Retrieve and check
    let action = PROPOSALS.with(|map| {
        let mut map = map.borrow_mut();
        let prop = map.get_mut(&id).ok_or("Proposal not found")?;
        if prop.executed {
            return Err("Already executed".to_string());
        }
        if prop.votes_yes <= prop.votes_no {
            return Err("Not enough yes votes".to_string());
        }
        prop.executed = true;
        Ok(prop.action.clone())
    })?;

    // Perform the cross-canister call
    let (res,): (Result<Vec<u8>, (u64, String)>,) =
        call(action.canister, &action.method, (), action.args)
            .await
            .map_err(|(code, msg)| format!("Call failed: {} – {}", code, msg))?;

    Ok(format!("Executed; result bytes: {:?}", res))
}

// Query all proposals (for frontend)
#[query]
fn list_proposals() -> Vec<Proposal> {
    PROPOSALS.with(|map| map.borrow().values().cloned().collect())
}
