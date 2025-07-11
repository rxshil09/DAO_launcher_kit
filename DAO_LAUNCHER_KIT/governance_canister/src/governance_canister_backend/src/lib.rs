use candid::{CandidType, Deserialize};
use ic_cdk::{api::caller, init, query, update};
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};

type ProposalId = u64;

#[derive(CandidType, Deserialize, Clone)]
struct Proposal {
    id: ProposalId,
    title: String,
    description: String,
    yes_votes: u64,
    no_votes: u64,
    voters: Vec<String>,
}

thread_local! {
    static PROPOSALS: RefCell<HashMap<ProposalId, Proposal>> = RefCell::new(HashMap::new());
}

#[init]
fn init() {
    ic_cdk::println!("Governance canister initialized.");
}

#[update]
fn create_proposal(title: String, description: String) -> ProposalId {
    let id = ic_cdk::api::time();

    let proposal = Proposal {
        id,
        title,
        description,
        yes_votes: 0,
        no_votes: 0,
        voters: Vec::new(),
    };

    PROPOSALS.with(|proposals| {
        proposals.borrow_mut().insert(id, proposal);
    });

    id
}

#[update]
fn vote(id: ProposalId, vote_yes: bool) -> Result<(), String> {
    let voter_id = caller().to_text();

    PROPOSALS.with(|proposals| {
        let mut map = proposals.borrow_mut();
        if let Some(p) = map.get_mut(&id) {
            if p.voters.contains(&voter_id) {
                return Err("You have already voted.".to_string());
            }

            if vote_yes {
                p.yes_votes += 1;
            } else {
                p.no_votes += 1;
            }

            p.voters.push(voter_id);
            Ok(())
        } else {
            Err(format!("Proposal {} not found.", id))
        }
    })
}

#[query]
fn get_proposal(id: ProposalId) -> Option<Proposal> {
    PROPOSALS.with(|proposals| proposals.borrow().get(&id).cloned())
}

#[query]
fn list_proposals() -> Vec<Proposal> {
    PROPOSALS.with(|proposals| proposals.borrow().values().cloned().collect())
}
