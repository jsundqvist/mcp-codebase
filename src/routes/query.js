// src/routes/query.js
import express from 'express';
import { table } from '../globals.js';
import { generateEmbedding } from '../utils.js';

const router = express.Router();

router.post('/query-context', async (req, res) => {
    const { query, currentFilePath } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'query is required.' });
    }

    try {
        console.log(`Querying context for: "${query}"`);
        const queryVector = await generateEmbedding(query);

        const queryBuilder = table.search(queryVector).distanceType('cosine').limit(10);
        const recordBatchIterator = await queryBuilder.execute();

        let results = [];
        let nextResult;
        while (!(nextResult = await recordBatchIterator.next()).done) {
            if (nextResult.value && typeof nextResult.value.toArray === 'function') {
                results.push(...nextResult.value.toArray());
            }
        }

        if (currentFilePath) {
            results.sort((a, b) => {
                const aIsCurrentFile = a.path === currentFilePath;
                const bIsCurrentFile = b.path === currentFilePath;
                if (aIsCurrentFile && !bIsCurrentFile) return -1;
                if (!aIsCurrentFile && bIsCurrentFile) return 1;
                return a._distance - b._distance; // Lower distance is better
            });
        }

        console.log(`Found ${results.length} relevant contexts.`);
        res.json({ results: results.map(r => ({
            text: r.text,
            path: r.path,
            start_line: r.start_line,
            end_line: r.end_line,
            type: r.type,
            score: 1 - r._distance // Cosine distance is 1-cosine_similarity
        }))});

    } catch (error) {
        console.error(`Error querying context for "${query}":`, error);
        res.status(500).json({ error: 'Failed to query context', details: error.message });
    }
});

export default router;
