/**
 * Activity Log Service
 * Epic 8, Story 8.3: Idea Evolution - retrieve activity history for a note
 */

import ActivityLog from '../models/ACTIVITY_LOG';

/**
 * Get all activity log entries for a note, newest first.
 */
export const getActivityLog = async (noteId: string) => {
  return ActivityLog.findAll({
    where: { noteId },
    order: [['CREATEDAT', 'DESC']],
  });
};

/**
 * Log a single activity event for a note.
 */
export const logActivity = async (
  noteId: string,
  eventType: ActivityLog['eventType'],
  payload?: Record<string, unknown>
) => {
  return ActivityLog.create({
    noteId,
    eventType,
    payload: payload ?? null,
  });
};
