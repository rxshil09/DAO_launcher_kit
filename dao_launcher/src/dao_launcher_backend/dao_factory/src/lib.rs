use candid::{CandidType, Principal};
use ic_cdk::api::call::call;
use ic_cdk::export::Deserialize;
use ic_cdk_macros::*;

#[update]
async fn create_dao(name: String) -> Principal {
    let canister_id = ic_cdk::api::management_canister::provisional::create_canister()
        .await
        .expect("Failed to create DAO canister")
        .0;

    let wasm_module = include_bytes!("../../target/wasm32-unknown-unknown/release/dao_governance.wasm");

    ic_cdk::api::management_canister::install_code(
        canister_id,
        wasm_module.to_vec(),
        name.as_bytes().to_vec(),
        None,
    )
    .await
    .expect("Failed to install DAO ");

    canister_id
}
