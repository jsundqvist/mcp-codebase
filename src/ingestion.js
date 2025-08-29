// src/ingestion.js
import fs from 'fs/promises';
import path from 'path';
import { table } from './globals.js';
import { extractCodeContext, generateEmbedding } from './context-extractor.js';

export async function ingestProjectFiles(projectRoot) {
    console.log('Starting ingestion of project files...');

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
            console.log(`Ingesting on startup: ${filePath}`);
            const code = await fs.readFile(filePath, 'utf-8');
            
            const contexts = await extractCodeContext(code, filePath);
            if (contexts.length === 0) {
                console.log(`No contexts extracted from ${filePath}. Skipping.`);
                continue;
            }

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

            await table.delete(`path = '${filePath.replace(/\\/g, '\\\\')}'`);
            await table.add(records);
            console.log(`Successfully ingested ${records.length} contexts for ${filePath}`);

        } catch (error) {
            console.error(`Failed to ingest ${filePath} on startup:`, error);
        }
    }
    console.log('Project file ingestion complete.');
}
