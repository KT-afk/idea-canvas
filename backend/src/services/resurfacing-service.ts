/**
 * Resurfacing Service
 * Epic 7: "Remember this?" system — finds forgotten ideas to resurface to the user.
 *
 * Algorithm:
 *   1. Find active ideas not viewed (or resurfaced) within the threshold window.
 *   2. Prioritise the one that was least recently resurfaced (or never resurfaced).
 *   3. Update its resurfacing tracking fields and log the event.
 *
 * Frequency mapping (from USER_PREFERENCES.resurfaceFrequency):
 *   "low"    → resurface ideas not seen in 14 days
 *   "normal" → resurface ideas not seen in 7 days  (default)
 *   "high"   → resurface ideas not seen in 3 days
 */

import { Op } from 'sequelize';
import Notes from '../models/NOTES';
import ActivityLog from '../models/ACTIVITY_LOG';

const FREQUENCY_DAYS: Record<string, number> = {
  low: 14,
  normal: 7,
  high: 3,
};

/**
 * Returns one "forgotten" idea to resurface, or null if none qualifies.
 *
 * @param resurfaceFrequency  The user's preferred frequency setting.
 */
export const getForgottenIdea = async (resurfaceFrequency = 'normal') => {
  const thresholdDays = FREQUENCY_DAYS[resurfaceFrequency] ?? FREQUENCY_DAYS.normal;
  const thresholdDate = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000);

  // Find active ideas where lastViewedAt is older than threshold (or never set)
  const candidate = await Notes.findOne({
    where: {
      type: 'idea',
      status: 'active',
      [Op.or]: [
        { lastViewedAt: { [Op.lt]: thresholdDate } },
        { lastViewedAt: null },
      ],
    },
    order: [
      // Prefer ideas that have never been resurfaced, then least recently
      ['LASTRESURFACEDAT', 'ASC'],
    ],
  });

  if (!candidate) return null;

  // Mark as resurfaced and update tracking fields
  await candidate.update({
    lastResurfacedAt: new Date(),
    resurfaceCount: (candidate.resurfaceCount ?? 0) + 1,
  });

  // Log the resurfacing event
  await ActivityLog.create({
    noteId: candidate.id,
    eventType: 'resurfaced',
    payload: { resurfaceCount: candidate.resurfaceCount },
  });

  return candidate;
};

/**
 * Called when a user actively engages with a resurfaced idea
 * (e.g. clicks "View" on the toast). Records that they acted on it.
 */
export const markResurfaceActedOn = async (noteId: string) => {
  const note = await Notes.findByPk(noteId);
  if (!note) throw new Error('Note not found');
  await note.update({
    actedOnResurface: true,
    lastViewedAt: new Date(),
  });
  return note;
};

/**
 * Update lastViewedAt — call this whenever a card is panned-to or opened.
 */
export const touchLastViewedAt = async (noteId: string) => {
  await Notes.update({ lastViewedAt: new Date() }, { where: { id: noteId } });
};
