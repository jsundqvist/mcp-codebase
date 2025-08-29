// src/ingestion.js
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { table } from './globals.js';
import { extractCodeContext, generateEmbedding } from './context-extractor.js';

async function getFileHash(content) {
    const hash = crypto.createHash('sha256');
    hash.update(content);
    return hash.digest('hex');
}

async function needsReingestion(filePath, code) {
    try {
        const fileHash = await getFileHash(code);
        
        // Query existing record for this file
        const recordBatchIterator = await table.query()
            .filter(`path = '${filePath.replace(/\\/g, '\\\\')}'`)
            .select(['file_hash'])
            .execute();
        
        let record = null;
        let nextBatch;
        while (!(nextBatch = await recordBatchIterator.next()).done) {
            if (nextBatch.value && typeof nextBatch.value.toArray === 'function') {
                const records = nextBatch.value.toArray();
                if (records.length > 0) {
                    record = records[0];
                    break;
                }
            }
        }

        if (!record) {
            return true; // New file, needs ingestion
        }

        // Check if content has changed
        return record.file_hash !== fileHash;
    } catch (error) {
        console.error(`Error checking if file needs reingestion: ${filePath}`, error);
        return true; // If in doubt, reingest
    }
}

export async function ingestProjectFiles(projectRoot) {
    console.log('Starting incremental ingestion of project files...');

    async function findJsFiles(dir) {
        let jsFiles = [];
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'build' && entry.name !== 'lancedb_data' && !entry.name.startsWith('.')) {
                        jsFiles = jsFiles.concat(await findJsFiles(fullPath));
                    }
                } else if (path.extname(entry.name) === '.js') {
                    jsFiles.push(fullPath);
                }
            }
        } catch (error) {
            console.error(`Error reading directory ${dir}:`, error);
        }
        return jsFiles;
    }

    const filesToIngest = await findJsFiles(projectRoot);
    console.log(`Found ${filesToIngest.length} .js files to ingest.`);

    for (const filePath of filesToIngest) {
        try {
            const code = await fs.readFile(filePath, 'utf-8');
            
            if (!await needsReingestion(filePath, code)) {
                console.log(`Skipping unchanged file: ${filePath}`);
                continue;
            }
            
            console.log(`Ingesting modified file: ${filePath}`);
            const contexts = await extractCodeContext(code, filePath);
            if (contexts.length === 0) {
                console.log(`No contexts extracted from ${filePath}. Skipping.`);
                continue;
            }

            const fileHash = await getFileHash(code);
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
                    vector: vector,
                    file_hash: fileHash
                });
            }

            await table.delete(`path = '${filePath.replace(/\\/g, '\\\\')}'`);
            await table.add(records);
            console.log(`Successfully ingested ${records.length} contexts for ${filePath}`);

        } catch (error) {
            console.error(`Failed to ingest ${filePath} on startup:`, error);
        }
    }
    console.log('Project file ingestion complete.');
}
