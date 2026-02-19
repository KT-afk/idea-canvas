/**
 * Activity Log Routes
 * Epic 8, Story 8.3: Idea Evolution — timeline of events for a note
 *
 * GET /api/notes/:noteId/activity   — list activity log entries (newest first)
 */

import express from 'express';
import { getActivityLog } from '../services/activity-log-service';

export const activityLogRouter = express.Router();

activityLogRouter.get('/notes/:noteId/activity', async (req, res) => {
  try {
    const { noteId } = req.params;
    const entries = await getActivityLog(noteId);
    res.status(200).json({ data: entries });
  } catch (error) {
    console.error('❌ Error fetching activity log:', error);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch activity log' } });
  }
});
