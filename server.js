import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

// Tree-sitter imports
import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';

// Transformers.js imports
import { pipeline } from '@xenova/transformers';

// LanceDB imports
import { connect } from '@lancedb/lancedb';
// Import necessary data types and Field from apache-arrow
import { Utf8, Int32, FixedSizeList, Float32, Field as ArrowField } from 'apache-arrow';

// Define a custom Field object that mimics LanceDB's expected Field API
// This object provides factory methods for Apache Arrow data types.
const Field = {
    string: () => new Utf8(),
    int32: () => new Int32(),
    // For vector, LanceDB expects a FixedSizeList of Float32
    vector: (dim) => new FixedSizeList(new ArrowField('item', new Float32()), dim)
};

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'lancedb_data'); // Path for LanceDB storage

// --- Global Instances ---
let parser;
let embedder;
let db;
let table; // Our LanceDB table for code context

// --- Middleware ---
app.use(express.json({ limit: '50mb' })); // Allow larger JSON bodies for code snippets

// --- Initialization Function ---
async function initialize() {
    console.log('Initializing MCP Server...');

    // 1. Initialize Tree-sitter Parser
    console.log('Loading Tree-sitter JavaScript parser...');
    parser = new Parser();
    parser.setLanguage(JavaScript);
    console.log('Tree-sitter parser loaded.');

    // 2. Initialize Transformers.js Embedder
    console.log('Loading Transformers.js embedding model...');
    // Using a small, fast sentence-transformer model for demonstration
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Transformers.js embedding model loaded.');

    // 3. Initialize LanceDB
    console.log(`Initializing LanceDB at ${DB_PATH}...`);
    db = await connect(DB_PATH); // Use connect directly
    const tableName = 'code_context';

    // Define the schema for our LanceDB table
    // The 'vector' field will store our embeddings
    // Other fields store metadata about the code snippet
    const schema = {
        id: Field.string(), // Use custom Field
        text: Field.string(), // Use custom Field
        path: Field.string(), // Use custom Field
        start_line: Field.int32(), // Use custom Field
        end_line: Field.int32(), // Use custom Field
        type: Field.string(), // e.g., 'function', 'class', 'comment', 'variable'
        vector: Field.vector(384) // all-MiniLM-L6-v2 produces 384-dim vectors // Use custom Field
    };

    try {
        table = await db.openTable(tableName);
        console.log(`Opened existing LanceDB table: ${tableName}`);
    } catch (e) {
        console.log(`Table ${tableName} not found, creating new one...`);
        table = await db.createTable(tableName, schema);
        console.log(`Created new LanceDB table: ${tableName}`);
    }
    console.log('LanceDB initialized.');

    console.log('MCP Server initialization complete.');
}

// --- Helper Functions ---

/**
 * Parses code using Tree-sitter and extracts meaningful nodes.
 * For simplicity, this example extracts top-level function and class declarations.
 * In a real scenario, you'd extract more granular context.
 * @param {string} code The source code string.
 * @param {string} filePath The path of the file (for metadata).
 * @returns {Array<Object>} An array of extracted code snippets with metadata.
 */
async function extractCodeContext(code, filePath = 'untitled.js') {
    const tree = parser.parse(code);
    const contexts = [];
    let idCounter = 0;

    // Example: Find function and class declarations
    const query = JavaScript.query(`
        (function_declaration name: (identifier) @name body: (statement_block) @body)
        (class_declaration name: (identifier) @name body: (class_body) @body)
        (variable_declarator name: (identifier) @name value: (_) @value)
    `);

    for (const match of query.matches(tree.rootNode)) {
        const nameNode = match.captures.find(c => c.name === 'name')?.node;
        const bodyNode = match.captures.find(c => c.name === 'body')?.node;
        const valueNode = match.captures.find(c => c.name === 'value')?.node;

        let snippetText = '';
        let type = 'unknown';
        let startLine = 0;
        let endLine = 0;
        let identifier = 'anonymous';

        if (nameNode && bodyNode) {
            snippetText = bodyNode.text;
            type = nameNode.parent.type === 'function_declaration' ? 'function' : 'class';
            startLine = nameNode.parent.startPosition.row;
            endLine = nameNode.parent.endPosition.row;
            identifier = nameNode.text;
        } else if (nameNode && valueNode) {
            snippetText = valueNode.text;
            type = 'variable';
            startLine = nameNode.parent.startPosition.row;
            endLine = nameNode.parent.endPosition.row;
            identifier = nameNode.text;
        } else {
            continue; // Skip if we can't get meaningful context
        }

        contexts.push({
            id: `${filePath}::${identifier}::${idCounter++}`, // Unique ID for the snippet
            text: snippetText,
            path: filePath,
            start_line: startLine,
            end_line: endLine,
            type: type,
            identifier: identifier // Store the name of the function/class/variable
        });
    }

    // Also add the full file content as a general context
    contexts.push({
        id: `${filePath}::full_file`,
        text: code,
        path: filePath,
        start_line: 0,
        end_line: code.split('\n').length - 1,
        type: 'file',
        identifier: 'full_file'
    });

    return contexts;
}

/**
 * Generates embeddings for a given text using the loaded Transformers.js model.
 * @param {string} text The text to embed.
 * @returns {Promise<Array<number>>} The embedding vector.
 */
async function generateEmbedding(text) {
    const output = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

// --- API Endpoints ---

/**
 * Endpoint to ingest code context into the LanceDB.
 * This would typically be called by an IDE extension when a file is saved or opened.
 * Request Body:
 * {
 *   "filePath": "path/to/your/file.js",
 *   "code": "console.log('Hello World'); function foo() {}"
 * }
 */
app.post('/ingest-context', async (req, res) => {
    const { filePath, code } = req.body;

    if (!filePath || !code) {
        return res.status(400).json({ error: 'filePath and code are required.' });
    }

    try {
        console.log(`Ingesting context for: ${filePath}`);
        const contexts = await extractCodeContext(code, filePath);
        const records = [];

        for (const ctx of contexts) {
            const vector = await generateEmbedding(ctx.text);
            records.push({
                id: ctx.id,
                text: ctx.text,
                path: ctx.path,
                start_line: ctx.start_line,
                end_line: ctx.end_line,
                type: ctx.type,
                vector: vector
            });
        }

        // Delete existing records for this file before adding new ones
        // This ensures the database is up-to-date for the given file
        await table.delete(`path = '${filePath}'`);
        await table.add(records);

        console.log(`Successfully ingested ${records.length} contexts for ${filePath}`);
        res.json({ message: `Context ingested for ${filePath}`, count: records.length });

    } catch (error) {
        console.error(`Error ingesting context for ${filePath}:`, error);
        res.status(500).json({ error: 'Failed to ingest context', details: error.message });
    }
});

/**
 * Endpoint to query for relevant code context based on a natural language query or code snippet.
 * This would be called by the AI model or client to get context.
 * Request Body:
 * {
 *   "query": "How do I read a file in Node.js?",
 *   "currentFilePath": "path/to/current/file.js" // Optional: to prioritize context from the same file
 * }
 */
app.post('/query-context', async (req, res) => {
    const { query, currentFilePath } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'query is required.' });
    }

    try {
        console.log(`Querying context for: "${query}"`);
        const queryVector = await generateEmbedding(query);

        let results = await table.search(queryVector)
                                 .limit(10) // Get top 10 most relevant results
                                 .execute();

        // Optional: Prioritize results from the current file if provided
        if (currentFilePath) {
            results.sort((a, b) => {
                const aIsCurrentFile = a.path === currentFilePath;
                const bIsCurrentFile = b.path === currentFilePath;
                if (aIsCurrentFile && !bIsCurrentFile) return -1;
                if (!aIsCurrentFile && bIsCurrentFile) return 1;
                return b._distance - a._distance; // Maintain original relevance for others
            });
        }

        console.log(`Found ${results.length} relevant contexts.`);
        res.json({ results: results.map(r => ({
            text: r.text,
            path: r.path,
            start_line: r.start_line,
            end_line: r.end_line,
            type: r.type,
            score: 1 - r._distance // Convert distance to a similarity score (0-1)
        }))});

    } catch (error) {
        console.error(`Error querying context for "${query}":`, error);
        res.status(500).json({ error: 'Failed to query context', details: error.message });
    }
});

// --- Start Server ---
initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`MCP Server listening on port ${PORT}`);
        console.log(`Ingest context: POST http://localhost:${PORT}/ingest-context`);
        console.log(`Query context: POST http://localhost:${PORT}/query-context`);
    });
}).catch(err => {
    console.error('Failed to initialize MCP Server:', err);
    process.exit(1);
});
