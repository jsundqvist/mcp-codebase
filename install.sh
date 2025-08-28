#!/bin/bash

echo "Performing a clean installation..."

echo "1. Deleting node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

echo "2. Clearing npm cache..."
npm cache clean --force

echo "3. Running npm install to fetch fresh dependencies with CXXFLAGS..."
# Set CXXFLAGS for native module compilation before npm install
CXXFLAGS="-std=c++20" npm install

echo "Installation complete. Please try 'npm start' now."
