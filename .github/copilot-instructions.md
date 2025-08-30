# Copilot Instructions

This document provides instructions for AI coding agents to effectively contribute to this codebase.

## Architecture Overview

This project is a Node.js server that implements a Model Context Protocol (MCP) for AI code assistants. It uses Express.js to provide an API for ingesting and querying code context.

- **Entry Point**: The main server logic is in `server.js`, which initializes the server, database, and other components.
- **Modular Structure**: The application logic is organized under the `src/` directory.
  - `src/routes/`: Contains the API endpoint handlers.
    - `ingest.js`: Handles code ingestion (`/ingest-context`).
    - `query.js`: Handles context queries (`/query-context`).
    - `debug.js`: Provides debugging endpoints.
  - `src/globals.js`: Manages shared, global instances of key components like the LanceDB table, Tree-sitter parser, and embedding model. This is a critical pattern to understand for accessing these components from different modules.
  - `src/utils.js`: Contains utility functions for parsing code with Tree-sitter (`extractCodeContext`) and generating embeddings with Transformers.js (`generateEmbedding`).
  - `src/ingestion.js`: Implements the logic for scanning and ingesting all project files on server startup.

## Key Technologies

- **Tree-sitter**: Used for parsing source code into an Abstract Syntax Tree (AST). The current implementation supports JavaScript and Java.
- **Transformers.js**: Uses the `Xenova/all-MiniLM-L6-v2` model to generate vector embeddings for code snippets.
- **LanceDB**: A vector database used to store and query code embeddings. The database is stored locally in the `lancedb_data` directory.

## Developer Workflow

### Installation

To install the project dependencies, run:
```bash
npm install
```

### Running the Server

To start the server, run:
```bash
npm start
```
The server will be available at `http://localhost:3000`.

### Testing Endpoints

You can test the API endpoints using `curl`. For example, to test the query endpoint:
```bash
curl -X POST http://localhost:3000/query-context \
-H "Content-Type: application/json" \
-d '{
  "query": "how to initialize the server"
}'
```

## Code Conventions and Patterns

### Global State Management

Key instances (e.g., `table`, `parser`, `embedder`) are initialized in `server.js` and shared across the application via setters and getters in `src/globals.js`. When you need to access one of these instances, import it from `src/globals.js`.

### LanceDB Interaction

- **Table Creation**: The LanceDB table is created in `server.js` with a `cosine` metric for vector search. This is crucial for accurate query results.
- **Querying**: When querying the table in `src/routes/query.js`, the results are iterated using a `while` loop with the `next()` method, as the `for await...of` loop is not compatible with the iterator returned by LanceDB.

Example of iterating query results in `src/routes/query.js`:
```javascript
const recordBatchIterator = await table.search(queryVector).limit(10).execute();
let results = [];
let nextResult;
while (!(nextResult = await recordBatchIterator.next()).done) {
    if (nextResult.value && typeof nextResult.value.toArray === 'function') {
        results.push(...nextResult.value.toArray());
    }
}
```

### Parser Development

When developing or modifying Tree-sitter parsers in this project, follow these patterns:

#### Query Organization
- Keep query patterns in separate files (e.g., `javascript-query.js`, `typescript-query.js`)
- Group related patterns together (functions, classes, modules, etc.)
- Add single-line comments above each pattern group to describe what it captures
- Use clear and consistent capture names (e.g., `@name`, `@class_name`, `@method_name`)

#### Testing Parser Changes
1. Start with a single pattern and its test
2. Write focused test cases with minimal code examples
3. Test each pattern type separately before combining
4. Include positive test cases for all supported variations
5. Use descriptive test names that match the pattern being tested

#### Query Pattern Development
1. Keep patterns simple and focused
2. Use proper Tree-sitter field captures (e.g., `name:`, `body:`)
3. Test patterns incrementally before adding complexity
4. Consider common variations of the syntax
5. Document pattern assumptions and limitations

#### Supported Pattern Types
Currently supported JavaScript patterns include:
- Function declarations and calls
- Class declarations and methods
- Variable declarations (const, let, var)
- Error handling (try/catch)
- Module imports and exports
- Comments (JSDoc, single-line, multi-line)

### Error Handling

API routes use `try...catch` blocks to handle errors. When an error occurs, a JSON response with a `500` status code and an error message is returned.
