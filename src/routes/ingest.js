// src/routes/ingest.js
import express from 'express';
import { table } from '../globals.js';
import { extractCodeContext, generateEmbedding } from '../utils.js';

const router = express.Router();

router.post('/ingest-context', async (req, res) => {
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

        await table.delete(`path = '${filePath}'`);
        await table.add(records);
        
        console.log(`Successfully ingested ${records.length} contexts for ${filePath}`);
        res.json({ message: `Context ingested for ${filePath}`, count: records.length });

    } catch (error) {
        console.error(`Error ingesting context for ${filePath}:`, error);
        res.status(500).json({ error: 'Failed to ingest context', details: error.message });
    }
});

export default router;
