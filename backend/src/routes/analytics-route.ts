/**
 * Analytics Route
 * Epic 8, Story 8.5: Idea Lifecycle Analytics Dashboard
 *
 * GET /api/analytics — returns aggregated metrics on idea lifecycle
 *
 * Metrics returned:
 * - Total notes/ideas/plans counts (by type)
 * - Active vs archived vs graduated breakdown
 * - Ideas graduated to plans (graduation events in activity log)
 * - Connection usage (total connections)
 * - Resurfacing stats (total resurface events, acted-on rate)
 * - Average idea lifespan (created → graduated, when available)
 */

import express from 'express';
import { Op, fn, col, literal } from 'sequelize';
import Notes from '../models/NOTES';
import ActivityLog from '../models/ACTIVITY_LOG';
import Connections from '../models/CONNECTIONS';

export const analyticsRouter = express.Router();

analyticsRouter.get('/analytics', async (_req, res) => {
  try {
    // --- Notes breakdown by type and status ---
    const noteRows = (await Notes.findAll({
      attributes: [
        'type',
        'status',
        [fn('COUNT', col('id')), 'count'],
      ],
      group: ['type', 'status'],
      raw: true,
    })) as unknown as Array<{ type: string; status: string; count: string }>;

    // Build a quick lookup
    const countMap: Record<string, Record<string, number>> = {};
    for (const row of noteRows) {
      if (!countMap[row.type]) countMap[row.type] = {};
      countMap[row.type][row.status] = parseInt(row.count, 10);
    }

    const getCount = (type: string, status: string) =>
      countMap[type]?.[status] ?? 0;

    const totalNotes = Object.values(countMap).reduce(
      (sum, statuses) => sum + Object.values(statuses).reduce((s, n) => s + n, 0),
      0
    );

    const totalIdeas =
      getCount('idea', 'active') + getCount('idea', 'archived') + getCount('idea', 'graduated');

    const totalPlans =
      getCount('plan', 'active') + getCount('plan', 'archived') + getCount('plan', 'graduated');

    const activeIdeas = getCount('idea', 'active');
    const archivedIdeas = getCount('idea', 'archived');
    const graduatedIdeas = getCount('idea', 'graduated');
    const activePlans = getCount('plan', 'active');

    const totalArchivedAll =
      getCount('note', 'archived') + getCount('idea', 'archived') + getCount('plan', 'archived');

    // --- Activity log stats ---
    // Count graduation events
    const graduationEvents = await ActivityLog.count({
      where: { eventType: 'graduated' },
    });

    // Count resurfacing events
    const resurfaceEvents = await ActivityLog.count({
      where: { eventType: 'resurfaced' },
    });

    // Count ideas that were acted-on after resurfacing
    const actedOnCount = await Notes.count({
      where: {
        actedOnResurface: true,
        type: 'idea',
      },
    });

    // --- Connection stats ---
    const totalConnections = await Connections.count();

    // Notes that have at least one connection (approximation via distinct source/target count)
    // We count unique source card IDs in connections
    const connectedNotes = await Connections.count({
      distinct: true,
      col: 'SOURCECARDID',
    });

    // --- Resurfacing acted-on rate ---
    const resurfaceActedOnRate =
      resurfaceEvents > 0
        ? Math.round((actedOnCount / resurfaceEvents) * 100)
        : 0;

    res.status(200).json({
      data: {
        // Overview
        totalItems: totalNotes,
        totalNotes: getCount('note', 'active') + getCount('note', 'archived') + getCount('note', 'graduated'),
        totalIdeas,
        totalPlans,

        // Idea lifecycle stages
        activeIdeas,
        archivedIdeas,
        graduatedIdeas,
        activePlans,
        totalArchivedAll,

        // Graduation
        graduationEvents, // Activity log graduation count (may differ from graduatedIdeas if type was changed back)

        // Connections
        totalConnections,
        connectedNotes, // Unique notes acting as connection source

        // Resurfacing
        resurfaceEvents,
        resurfaceActedOnRate, // % 0-100
        actedOnCount,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch analytics' },
    });
  }
});
