#!/bin/bash
# Ensure node-gyp uses the currently active Node.js version
# Get current Node.js version and architecture
NODE_VERSION=$(node -v | sed 's/v//')
NODE_ARCH=$(node -p "process.arch")
NODE_ABI=$(node -p "process.versions.modules") # NODE_MODULE_VERSION

echo "Rebuilding tree-sitter for Node.js v${NODE_VERSION} (ABI: ${NODE_ABI}, Arch: ${NODE_ARCH})..."

# Change to the tree-sitter module directory
(cd node_modules/tree-sitter && \
  echo "Cleaning tree-sitter build artifacts..." && \
  rm -rf build/Release && \
  # Use npx to run the locally installed node-gyp
  # Pass CXXFLAGS and explicit target/arch to node-gyp
  # --nodedir is crucial to point node-gyp to the correct Node.js installation for headers
  npx node-gyp rebuild \
    --target=${NODE_VERSION} \
    --arch=${NODE_ARCH} \
    --nodedir=$(node -p "require('path').resolve(process.execPath, '..', '..')") \
    -- \
    -DCXXFLAGS="-std=c++20" \
    -DCXX="g++ -std=c++20" \
    -DCFLAGS="-std=c++20" \
    -DCC="gcc -std=c++20" \
)
