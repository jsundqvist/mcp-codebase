// src/ingestion.js
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { table } from './globals.js';
import { extractComments, extractContextFromCapture } from './context-extractor.js';

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

async function findFilesByExtensions(dir, extensions) {
    let matchingFiles = [];
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                // Skip common excluded directories
                if (entry.name !== 'node_modules' && 
                    entry.name !== '.git' && 
                    entry.name !== 'build' && 
                    entry.name !== 'lancedb_data' && 
                    !entry.name.startsWith('.')) {
                    matchingFiles = matchingFiles.concat(await findFilesByExtensions(fullPath, extensions));
                }
            } else if (extensions.includes(path.extname(entry.name))) {
                matchingFiles.push(fullPath);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
    }
    return matchingFiles;
}

export async function ingestProjectFiles(projectRoot, extensions, parser) {
    console.log(`Starting incremental ingestion for extensions: ${extensions.join(', ')}...`);
    
    const filesToIngest = await findFilesByExtensions(projectRoot, extensions);
    console.log(`Found ${filesToIngest.length} files matching ${extensions.join(', ')} to ingest.`);

    for (const filePath of filesToIngest) {
        try {
            const code = await fs.readFile(filePath, 'utf-8');
            
            if (!await needsReingestion(filePath, code)) {
                console.log(`Skipping unchanged file: ${filePath}`);
                continue;
            }
            
            console.log(`Ingesting modified file: ${filePath}`);
            
            // Use the provided parser to extract contexts
            const query = parser.query;
            const tree = parser.parser.parse(code);
            const comments = extractComments(query, tree);
            const captures = query.captures(tree.rootNode);
            
            if (captures.length === 0) {
                console.log(`No contexts found in ${filePath}. Skipping.`);
                continue;
            }

            const fileHash = await getFileHash(code);
            const records = [];
            
            for (const capture of captures) {
                const contexts = await extractContextFromCapture(capture, code, filePath, parser, comments);
                
                for (const ctx of contexts) {
                    const id = crypto.randomBytes(16).toString('hex');
                    records.push({
                        id,
                        text: ctx.text,
                        path: filePath,
                        start_line: ctx.start_line,
                        end_line: ctx.end_line,
                        type: ctx.type,
                        vector: ctx.vector,
                        file_hash: fileHash
                    });
                }
            }
            
            if (records.length > 0) {
                await table.delete(`path = '${filePath.replace(/\\/g, '\\\\')}'`);
                await table.add(records);
                console.log(`Successfully ingested ${records.length} contexts for ${filePath}`);
            } else {
                console.log(`No valid contexts extracted from ${filePath}. Skipping.`);
            }

        } catch (error) {
            console.error(`Failed to ingest ${filePath}:`, error);
        }
    }
    console.log(`Ingestion complete for extensions: ${extensions.join(', ')}.`);
}
