/**
 * Next Time Notes Service
 * Epic 8, Story 8.1: CRUD operations for "Next Time" follow-up notes on Ideas
 */

import { Op } from 'sequelize';
import NextTimeNotes from '../models/NEXT_TIME_NOTES';
import ActivityLog from '../models/ACTIVITY_LOG';

export const getNextTimeNotes = async (parentNoteId: string) => {
  return NextTimeNotes.findAll({
    where: { parentNoteId },
    order: [['CREATEDAT', 'ASC']],
  });
};

export const createNextTimeNote = async (parentNoteId: string, content: string) => {
  const note = await NextTimeNotes.create({ parentNoteId, content });

  // Log activity
  await ActivityLog.create({
    noteId: parentNoteId,
    eventType: 'next_time_added',
    payload: { content: content.slice(0, 100) },
  });

  return note;
};

export const completeNextTimeNote = async (id: string) => {
  const note = await NextTimeNotes.findByPk(id);
  if (!note) throw new Error('Next time note not found');

  await note.update({ completedAt: new Date() });

  // Log activity
  await ActivityLog.create({
    noteId: note.parentNoteId,
    eventType: 'next_time_completed',
    payload: { content: note.content.slice(0, 100) },
  });

  return note;
};

export const deleteNextTimeNote = async (id: string) => {
  const note = await NextTimeNotes.findByPk(id);
  if (!note) throw new Error('Next time note not found');
  await note.destroy();
  return true;
};
