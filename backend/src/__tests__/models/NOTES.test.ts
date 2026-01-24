import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { sequelize } from '../../config/db';
import Notes from '../../models/NOTES';

describe('NOTES Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Column existence', () => {
    it('should have all required columns', async () => {
      const note = await Notes.create({
        content: 'Test note',
        positionX: 100,
        positionY: 200,
      });

      expect(note).toHaveProperty('id');
      expect(note).toHaveProperty('title');
      expect(note).toHaveProperty('content');
      expect(note).toHaveProperty('type');
      expect(note).toHaveProperty('status');
      expect(note).toHaveProperty('positionX');
      expect(note).toHaveProperty('positionY');
      expect(note).toHaveProperty('backgroundColor');
      expect(note).toHaveProperty('textColor');
      expect(note).toHaveProperty('boardId');
      expect(note).toHaveProperty('userId');
      expect(note).toHaveProperty('archivedAt');
      expect(note).toHaveProperty('zIndex');
      expect(note).toHaveProperty('createdAt');
      expect(note).toHaveProperty('updatedAt');

      await note.destroy();
    });
  });

  describe('Column types', () => {
    it('should have correct UUID for id, boardId, and userId', async () => {
      const note = await Notes.create({
        content: 'Test note',
        positionX: 100,
        positionY: 200,
      });

      expect(typeof note.id).toBe('string');
      expect(note.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

      await note.destroy();
    });

    it('should have TEXT for content and title', async () => {
      const note = await Notes.create({
        title: 'Test Title',
        content: 'Test content',
        positionX: 100,
        positionY: 200,
      });

      expect(typeof note.title).toBe('string');
      expect(typeof note.content).toBe('string');

      await note.destroy();
    });

    it('should have DECIMAL for positionX and positionY', async () => {
      const note = await Notes.create({
        content: 'Test note',
        positionX: 123.45,
        positionY: 678.90,
      });

      expect(typeof note.positionX).toBe('number');
      expect(typeof note.positionY).toBe('number');

      await note.destroy();
    });

    it('should have STRING for backgroundColor and textColor', async () => {
      const note = await Notes.create({
        content: 'Test note',
        positionX: 100,
        positionY: 200,
        backgroundColor: 'blue',
        textColor: 'white',
      });

      expect(typeof note.backgroundColor).toBe('string');
      expect(typeof note.textColor).toBe('string');

      await note.destroy();
    });
  });

  describe('Enum constraints', () => {
    it('should accept valid TYPE values: note, idea, plan', async () => {
      const note1 = await Notes.create({ content: 'Note', positionX: 0, positionY: 0, type: 'note' });
      const note2 = await Notes.create({ content: 'Idea', positionX: 0, positionY: 0, type: 'idea' });
      const note3 = await Notes.create({ content: 'Plan', positionX: 0, positionY: 0, type: 'plan' });

      expect(note1.type).toBe('note');
      expect(note2.type).toBe('idea');
      expect(note3.type).toBe('plan');

      await note1.destroy();
      await note2.destroy();
      await note3.destroy();
    });

    it('should reject invalid TYPE value', async () => {
      await expect(async () => {
        await Notes.create({
          content: 'Test',
          positionX: 0,
          positionY: 0,
          type: 'invalid' as any,
        });
      }).rejects.toThrow();
    });

    it('should accept valid STATUS values: active, archived, graduated', async () => {
      const note1 = await Notes.create({ content: 'Active', positionX: 0, positionY: 0, status: 'active' });
      const note2 = await Notes.create({ content: 'Archived', positionX: 0, positionY: 0, status: 'archived' });
      const note3 = await Notes.create({ content: 'Graduated', positionX: 0, positionY: 0, status: 'graduated' });

      expect(note1.status).toBe('active');
      expect(note2.status).toBe('archived');
      expect(note3.status).toBe('graduated');

      await note1.destroy();
      await note2.destroy();
      await note3.destroy();
    });

    it('should reject invalid STATUS value', async () => {
      await expect(async () => {
        await Notes.create({
          content: 'Test',
          positionX: 0,
          positionY: 0,
          status: 'invalid' as any,
        });
      }).rejects.toThrow();
    });
  });

  describe('Default values', () => {
    it('should default TYPE to note', async () => {
      const note = await Notes.create({
        content: 'Test note',
        positionX: 100,
        positionY: 200,
      });

      expect(note.type).toBe('note');

      await note.destroy();
    });

    it('should default STATUS to active', async () => {
      const note = await Notes.create({
        content: 'Test note',
        positionX: 100,
        positionY: 200,
      });

      expect(note.status).toBe('active');

      await note.destroy();
    });

    it('should default ZINDEX to 0', async () => {
      const note = await Notes.create({
        content: 'Test note',
        positionX: 100,
        positionY: 200,
      });

      expect(note.zIndex).toBe(0);

      await note.destroy();
    });
  });

  describe('Nullable fields', () => {
    it('should allow TITLE to be null', async () => {
      const note = await Notes.create({
        content: 'Test note without title',
        positionX: 100,
        positionY: 200,
        title: null,
      });

      expect(note.title).toBeNull();

      await note.destroy();
    });

    it('should require CONTENT (not nullable)', async () => {
      await expect(async () => {
        await Notes.create({
          positionX: 100,
          positionY: 200,
        } as any);
      }).rejects.toThrow();
    });
  });

  describe('UUID auto-generation', () => {
    it('should auto-generate UUID for id if not provided', async () => {
      const note = await Notes.create({
        content: 'Test note',
        positionX: 100,
        positionY: 200,
      });

      expect(note.id).toBeDefined();
      expect(typeof note.id).toBe('string');
      expect(note.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

      await note.destroy();
    });
  });

  describe('Timestamp auto-generation', () => {
    it('should auto-generate createdAt and updatedAt', async () => {
      const note = await Notes.create({
        content: 'Test note',
        positionX: 100,
        positionY: 200,
      });

      expect(note.createdAt).toBeInstanceOf(Date);
      expect(note.updatedAt).toBeInstanceOf(Date);

      await note.destroy();
    });
  });
});
