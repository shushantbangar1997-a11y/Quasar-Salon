#!/bin/bash
set -e

echo "==> Installing mobile dependencies..."
cd mobile && npm install --legacy-peer-deps 2>&1 | tail -5
cd ..

echo "==> Installing backend dependencies..."
cd backend/functions && npm install --legacy-peer-deps 2>&1 | tail -5
cd ../..

echo "==> Post-merge setup complete."
