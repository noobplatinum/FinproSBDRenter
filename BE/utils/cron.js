const cron = require('node-cron');
const db = require('../database/pg.database');

cron.schedule('0 0 * * *', async () => {
    try {
        const result = await db.query(`
        UPDATE transaction
        SET status = 'completed'
        WHERE status = 'confirmed' AND end_date < CURRENT_DATE
    `);
        console.log(`[CRON] ${result.rowCount} transaction(s) updated to completed.`);
    } catch (err) {
        console.error('[CRON] Failed to update transactions:', err);
    }
});
