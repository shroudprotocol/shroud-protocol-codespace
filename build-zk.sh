#!/bin/bash

set -e # Exit on error

# 1. Compile the circuit
echo "Compiling withdraw.circom..."
./bin/circom circuits/withdraw.circom --r1cs --wasm --output zk-build
echo "✅ Circuit compiled"

# 2. Phase 1 Powers of Tau
echo "Using powers_of_tau_14.ptau..."
if [ ! -f zk-build/powers_of_tau_14.ptau ]; then
    echo "powers_of_tau_14.ptau not found. Please download it."
    exit 1
fi
echo "✅ Powers of Tau file found"

# 3. Phase 2: Circuit-specific setup
echo "Starting circuit-specific setup (zkey)..."
npx snarkjs groth16 setup zk-build/withdraw.r1cs zk-build/powers_of_tau_14.ptau zk-build/withdraw_0000.zkey
echo "✅ zkey created"

# 4. Contribute to the ceremony
echo "Contributing to the ceremony..."
npx snarkjs zkey contribute zk-build/withdraw_0000.zkey zk-build/withdraw_final.zkey --name="Shroud Protocol 1st Contribution" -v -e="$(openssl rand -hex 32)"
echo "✅ Contribution complete"

# 5. Export the verifier contract
echo "Exporting the verifier contract..."
npx snarkjs zkey export solidityverifier zk-build/withdraw_final.zkey contracts/Groth16Verifier.sol
echo "✅ Verifier contract exported to contracts/Groth16Verifier.sol"

# 6. (Optional) Print zkey info
# CORRECTED: The command is 'file info', not 'zkey info'
npx snarkjs file info zk-build/withdraw_final.zkey
echo "✅ Zkey info displayed"

echo "🚀 ZK build process complete!"