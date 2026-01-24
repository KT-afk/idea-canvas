import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { router } from '../../routes/notes-route';
import * as notesService from '../../services/notes-service';

// Mock the notes service
vi.mock('../../services/notes-service');

const app = express();
app.use(express.json());
app.use('/api', router);

describe('Notes Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/notes', () => {
    it('should return 200 with { data: notes[] }', async () => {
      const mockNotes = [
        { id: '1', content: 'Note 1', positionX: 0, positionY: 0 },
        { id: '2', content: 'Note 2', positionX: 100, positionY: 100 },
      ];

      vi.mocked(notesService.getAllNotes).mockResolvedValue(mockNotes as any);

      const response = await request(app).get('/api/notes');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: mockNotes });
      expect(notesService.getAllNotes).toHaveBeenCalledOnce();
    });

    it('should return 500 with error object on failure', async () => {
      vi.mocked(notesService.getAllNotes).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/notes');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch notes' }
      });
    });
  });

  describe('POST /api/notes', () => {
    it('should return 201 with { data: note }', async () => {
      const mockNote = {
        id: '1',
        content: 'New note',
        positionX: 0,
        positionY: 0,
        type: 'note',
        status: 'active',
      };

      vi.mocked(notesService.insertNote).mockResolvedValue(mockNote as any);

      const response = await request(app)
        .post('/api/notes')
        .send({
          content: 'New note',
          positionX: 0,
          positionY: 0,
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ data: mockNote });
      expect(notesService.insertNote).toHaveBeenCalledOnce();
    });

    it('should return 400 with VALIDATION_ERROR when content is missing', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({
          positionX: 0,
          positionY: 0,
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: { code: 'VALIDATION_ERROR', message: 'Content is required' }
      });
      expect(notesService.insertNote).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/notes/:id', () => {
    it('should return 200 with { data: note }', async () => {
      const mockNote = {
        id: '123',
        content: 'Test note',
        positionX: 0,
        positionY: 0,
      };

      vi.mocked(notesService.getNoteById).mockResolvedValue(mockNote as any);

      const response = await request(app).get('/api/notes/123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: mockNote });
      expect(notesService.getNoteById).toHaveBeenCalledWith('123');
    });

    it('should return 404 with NOT_FOUND when note does not exist', async () => {
      vi.mocked(notesService.getNoteById).mockResolvedValue(null);

      const response = await request(app).get('/api/notes/fake-id');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: { code: 'NOT_FOUND', message: 'Note not found' }
      });
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('should return 200 with { data: note }', async () => {
      const mockUpdatedNote = {
        id: '123',
        content: 'Updated note',
        positionX: 50,
        positionY: 50,
      };

      vi.mocked(notesService.updateNote).mockResolvedValue(mockUpdatedNote as any);

      const response = await request(app)
        .put('/api/notes/123')
        .send({
          content: 'Updated note',
          positionX: 50,
          positionY: 50,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: mockUpdatedNote });
    });

    it('should return 404 with NOT_FOUND when note does not exist', async () => {
      vi.mocked(notesService.updateNote).mockRejectedValue(
        new Error('Note not found or no changes made.')
      );

      const response = await request(app)
        .put('/api/notes/fake-id')
        .send({ content: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: { code: 'NOT_FOUND', message: 'Note not found' }
      });
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should return 200 with { data: { deleted: true } }', async () => {
      vi.mocked(notesService.deleteNote).mockResolvedValue(true);

      const response = await request(app).delete('/api/notes/123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: { deleted: true } });
    });

    it('should return 404 with NOT_FOUND when note does not exist', async () => {
      vi.mocked(notesService.deleteNote).mockRejectedValue(
        new Error('Note not found.')
      );

      const response = await request(app).delete('/api/notes/fake-id');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: { code: 'NOT_FOUND', message: 'Note not found' }
      });
    });
  });

  describe('GET /api/notes/board/:boardId', () => {
    it('should return 200 with { data: notes[] }', async () => {
      const mockNotes = [
        { id: '1', content: 'Note 1', boardId: 'board-123' },
        { id: '2', content: 'Note 2', boardId: 'board-123' },
      ];

      vi.mocked(notesService.getAllNotesByBoardId).mockResolvedValue(mockNotes as any);

      const response = await request(app).get('/api/notes/board/board-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: mockNotes });
      expect(notesService.getAllNotesByBoardId).toHaveBeenCalledWith('board-123');
    });
  });
});
