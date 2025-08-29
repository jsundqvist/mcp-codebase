#!/bin/bash
curl -X POST http://localhost:3000/query-context -H "Content-Type: application/json" -d '{"query": "How do I calculate sum of two numbers?", "currentFilePath": "my_project/utils.js"}'
