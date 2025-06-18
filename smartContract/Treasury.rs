// src/lib.rs

use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use ic_cdk_macros::{query, update};
use std::cell::RefCell;

// Replace this with the actual principal of the owner when deploying
const OWNER_PRINCIPAL: &str = "aaaaa-aa";


thread_local! {
    static OWNER: Principal = Principal::from_text(OWNER_PRINCIPAL).unwrap();
    // Track last withdrawal call for transparency (optional)
    static LAST_WITHDRAWAL: RefCell<Option<Withdrawal>> = RefCell::default();
}

/// A record of a withdrawal
#[derive(Clone, CandidType, Deserialize)]
struct Withdrawal {
    to: Principal,
    amount: u128,
}

/// An update call to withdraw cycles from this canister’s treasury.
/// Only the OWNER can call this.
#[update]
fn withdraw(to: Principal, amount: u128) -> Result<(), String> {
    let caller = ic_cdk::caller();
    // Enforce owner-only access
    let owner = OWNER.with(|o| *o);
    if caller != owner {
        return Err("Unauthorized: only owner can withdraw".to_string());
    }

    // Attempt to transfer cycles
    ic_cdk::api::call::call_cycles_accept(
        to,
        "ic0.poke",   // any method; cycles-only transfer
        (),
        amount as u64,
    )
    .map_err(|(code, msg)| format!("Transfer failed: {} – {}", code as u8, msg))?;

    // Record withdrawal
    LAST_WITHDRAWAL.with(|cell| {
        *cell.borrow_mut() = Some(Withdrawal { to, amount });
    });

    Ok(())
}

/// Query the canister’s current cycle balance.
#[query]
fn treasury_balance() -> u128 {
    ic_cdk::api::canister_balance128()
}


#[query]
fn last_withdrawal() -> Option<Withdrawal> {
    LAST_WITHDRAWAL.with(|cell| cell.borrow().clone())
}
