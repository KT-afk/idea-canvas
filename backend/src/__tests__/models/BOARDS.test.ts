import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { sequelize } from '../../config/db';
import Boards from '../../models/BOARDS';
import Notes from '../../models/NOTES';

describe('BOARDS Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Column existence', () => {
    it('should have all required columns: id, name, userId, createdAt, updatedAt', async () => {
      const board = await Boards.create({
        name: 'Test Board',
      });

      expect(board).toHaveProperty('id');
      expect(board).toHaveProperty('name');
      expect(board).toHaveProperty('userId');
      expect(board).toHaveProperty('createdAt');
      expect(board).toHaveProperty('updatedAt');

      await board.destroy();
    });
  });

  describe('UUID auto-generation', () => {
    it('should auto-generate UUID for id', async () => {
      const board = await Boards.create({
        name: 'Test Board',
      });

      expect(board.id).toBeDefined();
      expect(typeof board.id).toBe('string');
      expect(board.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

      await board.destroy();
    });

    it('should auto-generate timestamps', async () => {
      const board = await Boards.create({
        name: 'Test Board',
      });

      expect(board.createdAt).toBeInstanceOf(Date);
      expect(board.updatedAt).toBeInstanceOf(Date);

      await board.destroy();
    });
  });

  describe('Relationships', () => {
    it('should have notes relationship that includes array of notes', async () => {
      const board = await Boards.create({
        name: 'Test Board',
      });

      const note1 = await Notes.create({
        content: 'Note 1',
        positionX: 0,
        positionY: 0,
        boardId: board.id,
      });

      const note2 = await Notes.create({
        content: 'Note 2',
        positionX: 100,
        positionY: 100,
        boardId: board.id,
      });

      const boardWithNotes = await Boards.findByPk(board.id, {
        include: [Notes],
      });

      expect(boardWithNotes?.notes).toBeDefined();
      expect(Array.isArray(boardWithNotes?.notes)).toBe(true);
      expect(boardWithNotes?.notes.length).toBe(2);
      expect(boardWithNotes?.notes[0].content).toBe('Note 1');
      expect(boardWithNotes?.notes[1].content).toBe('Note 2');

      await note1.destroy();
      await note2.destroy();
      await board.destroy();
    });
  });
});
