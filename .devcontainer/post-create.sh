#!/bin/bash
set -e
echo "--- Running Post-Create Setup ---"

# Ensure script is executable
chmod +x ./build-zk.sh

# Install root and frontend dependencies
npm install
cd frontend && npm install

echo "--- Setup Complete! ---"
