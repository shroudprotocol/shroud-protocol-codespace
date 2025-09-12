#!/bin/bash
set -e

echo "--- Running Post-Create Setup ---"

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "--- Setup Complete! ---"