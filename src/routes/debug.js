// src/routes/debug.js
import express from 'express';
import { table } from '../globals.js';

const router = express.Router();

router.get('/debug/list-context', async (req, res) => {
    try {
        if (!table) {
            return res.status(500).json({ error: 'LanceDB table not initialized.' });
        }
        console.log('Fetching all records from LanceDB...');
        const recordBatchIterator = await table.query().limit(1000).execute();
        let allRecords = [];
        for await (const batch of recordBatchIterator) {
            allRecords.push(...batch.toArray());
        }
        
        console.log(`Found ${allRecords.length} records.`);
        res.json({ count: allRecords.length, records: allRecords });
    } catch (error) {
        console.error('Error listing all context:', error);
        res.status(500).json({ error: 'Failed to list context', details: error.message });
    }
});

export default router;
