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

# Install note-service dependencies and generate Prisma client
echo "Installing note-service dependencies..."
cd note-service
npm install
npx prisma generate
cd ..

echo "--- Setup Complete! ---"