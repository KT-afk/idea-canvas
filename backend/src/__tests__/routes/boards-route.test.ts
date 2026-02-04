import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { boardsRouter } from '../../routes/boards-route';
import * as boardsService from '../../services/boards-service';

// Mock the database config to prevent Sequelize initialization
vi.mock('../../config/db', () => ({
  sequelize: {
    transaction: vi.fn((callback) => callback()),
  },
  connectDB: vi.fn(),
}));

// Mock the boards service
vi.mock('../../services/boards-service');

const app = express();
app.use(express.json());
app.use('/api', boardsRouter);

describe('Boards Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/boards', () => {
    it('should return 200 with { data: boards[] }', async () => {
      const mockBoards = [
        { id: '1', name: 'Board 1' },
        { id: '2', name: 'Board 2' },
      ];

      vi.mocked(boardsService.getAllBoards).mockResolvedValue(mockBoards as any);

      const response = await request(app).get('/api/boards');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: mockBoards });
      expect(boardsService.getAllBoards).toHaveBeenCalledOnce();
    });
  });

  describe('GET /api/boards/:id', () => {
    it('should return 200 with { data: board }', async () => {
      const mockBoard = {
        id: '123',
        name: 'Test Board',
      };

      vi.mocked(boardsService.getBoardById).mockResolvedValue(mockBoard as any);

      const response = await request(app).get('/api/boards/123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: mockBoard });
      expect(boardsService.getBoardById).toHaveBeenCalledWith('123');
    });

    it('should return 404 with NOT_FOUND when board does not exist', async () => {
      vi.mocked(boardsService.getBoardById).mockResolvedValue(null);

      const response = await request(app).get('/api/boards/fake-id');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: { code: 'NOT_FOUND', message: 'Board not found' }
      });
    });
  });

  describe('Response format compliance', () => {
    it('should use { data } format for all successful responses', async () => {
      const mockBoards = [{ id: '1', name: 'Board 1' }];
      vi.mocked(boardsService.getAllBoards).mockResolvedValue(mockBoards as any);

      const response = await request(app).get('/api/boards');

      expect(response.body).toHaveProperty('data');
      expect(response.body).not.toHaveProperty('result');
      expect(response.body).not.toHaveProperty('success');
    });

    it('should use { error } format for all error responses', async () => {
      vi.mocked(boardsService.getAllBoards).mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/boards');

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
    });
  });
});
