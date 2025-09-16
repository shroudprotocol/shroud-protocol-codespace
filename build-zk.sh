#!/bin/bash
set -e

# Configuration
CIRCOM_BINARY="./bin/circom"
BUILD_DIR="./zk-build"
PTAU_FILE="${BUILD_DIR}/powers_of_tau_14.ptau"
CIRCOM_VERSION="v2.1.8"
CIRCOM_URL="https://github.com/iden3/circom/releases/download/${CIRCOM_VERSION}/circom-linux-amd64"
PTAU_URL="https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_14.ptau"

# Environment Setup
mkdir -p ./bin "$BUILD_DIR"
if [ ! -f "$CIRCOM_BINARY" ]; then echo "Downloading circom..." && wget -q --show-progress -O "$CIRCOM_BINARY" "$CIRCOM_URL" && chmod +x "$CIRCOM_BINARY"; fi
if [ ! -f "$PTAU_FILE" ]; then echo "Downloading PTAU..." && wget -q --show-progress -O "$PTAU_FILE" "$PTAU_URL"; fi

# Main Build Process
echo "Compiling withdraw.circom..."
"$CIRCOM_BINARY" circuits/withdraw.circom --r1cs --wasm --output "$BUILD_DIR" -l node_modules
echo "✅ Circuit compiled"

# snarkjs steps
echo "Starting ZKey setup..."
npx snarkjs groth16 setup "${BUILD_DIR}/withdraw.r1cs" "$PTAU_FILE" "${BUILD_DIR}/withdraw_0000.zkey"
npx snarkjs zkey contribute "${BUILD_DIR}/withdraw_0000.zkey" "${BUILD_DIR}/withdraw_final.zkey" --name="Shroud Protocol Contribution" -v -e="$(openssl rand -hex 32)"
echo "✅ ZKey created"

# Export Verifier
npx snarkjs zkey export solidityverifier "${BUILD_DIR}/withdraw_final.zkey" contracts/Groth16Verifier.sol
echo "✅ Verifier contract exported."

# Copy assets to frontend
echo "Copying assets to frontend..."
cp "${BUILD_DIR}/withdraw_js/withdraw.wasm" "frontend/public/withdraw.wasm"
cp "${BUILD_DIR}/withdraw_final.zkey" "frontend/public/withdraw_final.zkey"
echo "✅ Assets copied."

echo "🚀 ZK build process complete!"
