#!/bin/zsh
# Run each JavaScript test file in its own process for reliable Tree-sitter testing
for file in test/javascript/*.test.js; do
  echo "Running $file..."
  npm test -- "$file"
  if [[ $? -ne 0 ]]; then
    echo "Test failed: $file"
    exit 1
  fi
  echo "---"
done
