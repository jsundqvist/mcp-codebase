#!/bin/bash

echo "Performing a clean installation..."

echo "1. Deleting node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

echo "2. Clearing npm cache..."
npm cache clean --force

echo "3. Running npm install to fetch fresh dependencies..."
npm install

echo "4. Running npm run install-deps for native module compilation..."
# This script already contains CXXFLAGS="-std=c++20" npm install
# which will trigger node-gyp rebuilds for native modules.
npm run install-deps

echo "Installation complete. Please try 'npm start' now."
