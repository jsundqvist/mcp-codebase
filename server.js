import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

// Transformers.js imports
import { pipeline } from '@xenova/transformers';

// LanceDB imports
import * as lancedb from '@lancedb/lancedb';
import { Field, FixedSizeList, Int32, Utf8, Float32, Schema } from 'apache-arrow';

import { setEmbedder, setDb, setTable } from './src/globals.js';
import { ingestProjectFiles } from './src/ingestion.js';
import { createJavaScriptParser } from './src/parsers/javascript.js';
import { createTypeScriptParser } from './src/parsers/typescript.js';
import { createJavaParser } from './src/parsers/java.js';
import ingestRoute from './src/routes/ingest.js';
import queryRoute from './src/routes/query.js';
import debugRoute from './src/routes/debug.js';

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'lancedb_data'); // Path for LanceDB storage

// --- Middleware ---
app.use(express.json({ limit: '50mb' }));

// --- Routes ---
app.use(ingestRoute);
app.use(queryRoute);
app.use(debugRoute);

// --- Initialization Function ---
async function initialize() {
    console.log('Initializing MCP Server...');

    // 1. Initialize Transformers.js Embedder
    console.log('Loading Transformers.js embedding model...');
    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    setEmbedder(embedder);
    console.log('Transformers.js embedding model loaded.');

    // 3. Initialize LanceDB
    console.log(`Initializing LanceDB at ${DB_PATH}...`);
    const db = await lancedb.connect(DB_PATH);
    setDb(db);
    console.log(`LanceDB connected to: ${DB_PATH}`);
    const tableName = 'code_context';

    const codeContextSchema = new Schema([
        new Field('id', new Utf8()),
        new Field('text', new Utf8()),
        new Field('path', new Utf8()),
        new Field('start_line', new Int32()),
        new Field('end_line', new Int32()),
        new Field('type', new Utf8()),
        new Field('vector', new FixedSizeList(384, new Field('item', new Float32()))),
        new Field('file_hash', new Utf8()), // Hash of file contents for detecting changes
    ]);

    let table;
    try {
        // Try to open the table, if it fails, it will be created.
        table = await db.openTable(tableName);
        console.log(`Opened existing LanceDB table: ${tableName}`);
    } catch (e) {
        console.log(`Table ${tableName} not found, creating new one with explicit schema...`);
        
        const dummyData = [{
            id: 'dummy',
            text: 'dummy',
            path: 'dummy',
            start_line: 0,
            end_line: 0,
            type: 'dummy',
            vector: Array(384).fill(0),
            file_hash: 'dummy'
        }];
        
        table = await db.createTable(tableName, dummyData, {
            schema: codeContextSchema,
            vectorIndex: {
                type: 'ivf_pq',
                metric: 'cosine',
            }
        });
        
        // Since we added dummy data to create the table, we should delete it immediately after.
        await table.delete("id = 'dummy'");
        console.log(`Created new LanceDB table: ${tableName} with cosine metric.`);
    }
    setTable(table);
    console.log('LanceDB initialized.');

    // 4. Ingest project files by language
    console.log('Starting project file ingestion...');
    
    // JavaScript files
    await ingestProjectFiles(__dirname, ['.js', '.jsx', '.mjs'], createJavaScriptParser());
    
    // TypeScript files
    await ingestProjectFiles(__dirname, ['.ts', '.tsx'], createTypeScriptParser());
    
    // Java files - temporarily disabled until parser is fixed
    // await ingestProjectFiles(__dirname, ['.java'], createJavaParser());

    console.log('MCP Server initialization complete.');
}

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
