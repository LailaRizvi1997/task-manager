#!/bin/bash
set -e

echo "=== Starting build process ==="
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

echo "=== Entering client directory ==="
cd client
echo "Client directory contents:"
ls -la

echo "=== Installing dependencies ==="
npm install --legacy-peer-deps

echo "=== Running build ==="
npm run build

echo "=== Build complete ==="
echo "Dist contents:"
ls -la dist/