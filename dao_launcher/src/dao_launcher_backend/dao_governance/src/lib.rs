use candid::{CandidType, Deserialize};
use ic_cdk_macros::*;
use std::collections::HashMap;

#[derive(Clone, CandidType, Deserialize)]
struct Proposal {
    id: u64,
    description: String,
    votes_yes: u64,
    votes_no: u64,
    executed: bool,
}

thread_local! {
    static PROPOSALS: std::cell::RefCell<HashMap<u64, Proposal>> = std::cell::RefCell::new(HashMap::new());
    static NEXT_ID: std::cell::RefCell<u64> = std::cell::RefCell::new(0);
}

#[update]
fn submit_proposal(description: String) -> u64{
    let id = NEXT_ID.with(|id_ref| {
        let mut id = id_ref.borrow_mut();
        let current = *id;
        *id += 1;
        current
    });

    let proposal = Proposal {
        id,
        description,
        votes_yes: 0,
        votes_no: 0,
        executed: false,
    };

    PROPOSALS.with(|map| map.borrow_mut().insert(id, proposal));
    id
}

#[update]
fn vote(proposal_id: u64, yes: bool) {
    PROPOSALS.with(|map| {
        if let Some(p) = map.borrow_mut().get_mut(&proposal_id){
            if yes {
                p.votes_yes += 1;
            } else {
                p.votes_no += 1;
            }
        }
    });
}

#[update]
fn execute_proposal(proposal_id: u64) -> bool {
    PROPOSALS.with(|map| {
        if let Some(p) = map.borrow_mut().get_mut(&proposal_id) {
            if p.votes_yes > p.votes_no && !p.executed {
                p.executed = true;
                return true;
            }
        }
        false
    })
}

#[query]
fn get_proposals() -> Vec<Proposal> {
    PROPOSALS.with(|map| map.borrow().values().cloned().collect())
}
