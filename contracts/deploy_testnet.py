"""
Deploy EducateChain Vault to Algorand TestNet.

Usage:
    Step 1: python deploy_testnet.py generate
        → Creates a temporary deployer account and saves it to .deployer.json
        → Send 5 ALGO to the generated address from your Lute wallet

    Step 2: python deploy_testnet.py deploy
        → Deploys the contract using the funded deployer account
        → Opts the contract into USDC ASA
        → Saves deployment info to deployment_info.json

Prerequisites:
    - pip install py-algorand-sdk
    - The compiled contract (run: python -m puyapy educatechain_vault.py --out-dir out)
"""

import os
import sys
import json
import base64

import algosdk
from algosdk.v2client import algod
from algosdk import transaction, account

# ── Configuration ─────────────────────────────────────────────────────

ALGOD_URL = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = ""
USDC_TESTNET_ASA_ID = 10458941  # USDC on Algorand testnet

OUT_DIR = os.path.join(os.path.dirname(__file__), "out")
APPROVAL_FILE = os.path.join(OUT_DIR, "EducateChainVault.approval.teal")
CLEAR_FILE = os.path.join(OUT_DIR, "EducateChainVault.clear.teal")
ARC56_FILE = os.path.join(OUT_DIR, "EducateChainVault.arc56.json")
DEPLOYER_FILE = os.path.join(os.path.dirname(__file__), ".deployer.json")


def get_client() -> algod.AlgodClient:
    return algod.AlgodClient(ALGOD_TOKEN, ALGOD_URL)


def compile_teal(client: algod.AlgodClient, teal_file: str) -> bytes:
    """Compile a TEAL file and return the program bytes."""
    with open(teal_file, "r") as f:
        teal_source = f.read()
    response = client.compile(teal_source)
    return base64.b64decode(response["result"])


# ── Step 1: Generate deployer ─────────────────────────────────────────

def cmd_generate():
    """Generate a fresh Algorand account for deployment."""
    print("🔑 Generating temporary deployer account...\n")

    sk = account.generate_account()[0]
    addr = account.address_from_private_key(sk)

    # Save to file
    deployer_data = {"private_key": sk, "address": addr}
    with open(DEPLOYER_FILE, "w") as f:
        json.dump(deployer_data, f, indent=2)

    print(f"✅ Deployer account generated!")
    print(f"   Address: {addr}")
    print(f"   Saved to: {DEPLOYER_FILE}\n")
    print(f"=" * 60)
    print(f"📋 NEXT STEP:")
    print(f"   Send 5 ALGO from your Lute wallet (TestNet) to:")
    print(f"   {addr}")
    print(f"")
    print(f"   Then run:  python deploy_testnet.py deploy")
    print(f"=" * 60)


# ── Step 2: Deploy ────────────────────────────────────────────────────

def cmd_deploy():
    """Deploy the contract using the funded deployer account."""
    print("🚀 EducateChain Vault — TestNet Deployment\n")

    # Load deployer
    if not os.path.exists(DEPLOYER_FILE):
        print("ERROR: No deployer account found.")
        print("       Run:  python deploy_testnet.py generate")
        sys.exit(1)

    with open(DEPLOYER_FILE, "r") as f:
        deployer_data = json.load(f)

    sk = deployer_data["private_key"]
    deployer_addr = deployer_data["address"]

    # Connect
    client = get_client()
    status = client.status()
    print(f"✅ Connected to Algorand TestNet (round {status['last-round']})")

    # Check balance
    info = client.account_info(deployer_addr)
    balance_algo = info["amount"] / 1_000_000
    print(f"✅ Deployer: {deployer_addr}")
    print(f"   Balance: {balance_algo:.2f} ALGO\n")

    if balance_algo < 3:
        print(f"⚠️  Insufficient balance ({balance_algo:.2f} ALGO). Need at least 3 ALGO.")
        print(f"   Send ALGO from your Lute wallet to: {deployer_addr}")
        sys.exit(1)

    # Compile TEAL
    print("📦 Compiling TEAL programs...")
    approval_program = compile_teal(client, APPROVAL_FILE)
    clear_program = compile_teal(client, CLEAR_FILE)
    print(f"   Approval: {len(approval_program)} bytes")
    print(f"   Clear:    {len(clear_program)} bytes\n")

    # Read schema from ARC-56
    with open(ARC56_FILE, "r") as f:
        arc56 = json.load(f)
    state_schema = arc56.get("state", {})
    gs = state_schema.get("schema", {}).get("global", {})
    global_ints = gs.get("ints", 5)
    global_bytes = gs.get("bytes", 2)

    print(f"📋 State Schema: {global_ints} ints, {global_bytes} bytes\n")

    # Build create app transaction with ABI args
    params = client.suggested_params()

    from algosdk.abi import Method
    from algosdk.atomic_transaction_composer import (
        AtomicTransactionComposer,
        AccountTransactionSigner,
    )

    signer = AccountTransactionSigner(sk)
    create_method = Method.from_signature("create(address,uint64)void")
    extra_pages = (len(approval_program) - 1) // 2048

    atc = AtomicTransactionComposer()
    atc.add_method_call(
        app_id=0,
        method=create_method,
        sender=deployer_addr,
        sp=params,
        signer=signer,
        method_args=[deployer_addr, USDC_TESTNET_ASA_ID],
        approval_program=approval_program,
        clear_program=clear_program,
        global_schema=transaction.StateSchema(global_ints, global_bytes),
        local_schema=transaction.StateSchema(0, 0),
        extra_pages=extra_pages,
    )

    print("📡 Deploying contract...")
    result = atc.execute(client, 4)
    tx_id = result.tx_ids[0]
    tx_info = client.pending_transaction_info(tx_id)
    app_id = tx_info["application-index"]
    app_address = algosdk.logic.get_application_address(app_id)

    print(f"\n🎉 Contract Deployed!")
    print(f"   App ID:      {app_id}")
    print(f"   App Address: {app_address}")
    print(f"   Tx ID:       {tx_id}")
    print(f"   Explorer:    https://lora.algokit.io/testnet/application/{app_id}\n")

    # Fund app account for MBR
    print("💰 Funding app account (2 ALGO for MBR)...")
    fund_txn = transaction.PaymentTxn(
        sender=deployer_addr,
        sp=params,
        receiver=app_address,
        amt=2_000_000,
    )
    signed_fund = fund_txn.sign(sk)
    fund_tx_id = client.send_transaction(signed_fund)
    transaction.wait_for_confirmation(client, fund_tx_id, 4)
    print(f"   ✅ Funded 2 ALGO → {app_address}\n")

    # Bootstrap (sets deployer as first reviewer — needs box MBR)
    print("🔧 Bootstrapping vault (setting admin as reviewer)...")
    bootstrap_method = Method.from_signature("bootstrap()void")
    params_bs = client.suggested_params()

    # Box reference: "r_" prefix (2 bytes) + 32-byte address = 34 bytes key
    import algosdk.encoding as enc
    deployer_pk = enc.decode_address(deployer_addr)
    box_name = b"r_" + deployer_pk

    atc_bs = AtomicTransactionComposer()
    atc_bs.add_method_call(
        app_id=app_id,
        method=bootstrap_method,
        sender=deployer_addr,
        sp=params_bs,
        signer=signer,
        method_args=[],
        boxes=[[app_id, box_name]],
    )
    result_bs = atc_bs.execute(client, 4)
    print(f"   ✅ Bootstrapped! Tx: {result_bs.tx_ids[0]}\n")

    # Opt contract into USDC
    print(f"🔗 Opting contract into USDC (ASA {USDC_TESTNET_ASA_ID})...")
    opt_method = Method.from_signature("opt_in_to_asset(uint64)void")
    params2 = client.suggested_params()
    params2.fee = 2000  # Extra fee for inner txn (fee pooling)
    params2.flat_fee = True

    atc2 = AtomicTransactionComposer()
    atc2.add_method_call(
        app_id=app_id,
        method=opt_method,
        sender=deployer_addr,
        sp=params2,
        signer=signer,
        method_args=[USDC_TESTNET_ASA_ID],
        foreign_assets=[USDC_TESTNET_ASA_ID],
    )
    result2 = atc2.execute(client, 4)
    print(f"   ✅ Opted in! Tx: {result2.tx_ids[0]}\n")

    # Save deployment info
    deploy_info = {
        "app_id": app_id,
        "app_address": app_address,
        "network": "testnet",
        "usdc_asa_id": USDC_TESTNET_ASA_ID,
        "deployer": deployer_addr,
        "tx_id": tx_id,
    }
    info_file = os.path.join(os.path.dirname(__file__), "deployment_info.json")
    with open(info_file, "w") as f:
        json.dump(deploy_info, f, indent=2)
    print(f"📄 Deployment info saved to: {info_file}")

    print("\n" + "═" * 60)
    print("✅ DEPLOYMENT COMPLETE")
    print("═" * 60)
    print(f"\nApp ID for frontend: {app_id}")
    print(f"\nNext steps:")
    print(f"  1. Update VAULT_APP_ID = {app_id} in DonationPage.tsx")
    print(f"  2. cd ../new_frontend && npm run dev")
    print(f"  3. Connect Lute wallet and test donation!")


if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in ("generate", "deploy"):
        print("Usage:")
        print("  python deploy_testnet.py generate   # Step 1: create deployer account")
        print("  python deploy_testnet.py deploy      # Step 2: deploy (after funding)")
        sys.exit(1)

    if sys.argv[1] == "generate":
        cmd_generate()
    elif sys.argv[1] == "deploy":
        cmd_deploy()
