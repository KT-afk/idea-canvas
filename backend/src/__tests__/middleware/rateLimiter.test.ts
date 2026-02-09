import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { apiLimiter } from '../../middleware/rateLimiter';

describe('Rate Limiter Middleware', () => {
  const app = express();
  app.use(express.json());

  // Health check endpoint (should NOT be rate limited)
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Apply rate limiter only to /api routes
  app.use('/api', apiLimiter);

  app.get('/api/test', (_req, res) => {
    res.json({ data: 'success' });
  });

  describe('Under limit', () => {
    it('should allow 100 requests within the window', async () => {
      // Note: This test may be slow as it makes 100 requests
      // For faster tests, consider reducing the limit in test environment
      const requests = [];
      for (let i = 0; i < 100; i++) {
        requests.push(request(app).get('/api/test'));
      }

      const responses = await Promise.all(requests);

      // All 100 requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    }, 30000); // 30 second timeout for this test
  });

  describe('Over limit', () => {
    it('should return 429 with RATE_LIMITED error on 101st request', async () => {
      // Make 101 requests
      const requests = [];
      for (let i = 0; i < 101; i++) {
        requests.push(request(app).get('/api/test'));
      }

      const responses = await Promise.all(requests);

      // At least one request should be rate limited
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);

      // Check that rate limited response has correct format
      if (rateLimited.length > 0) {
        expect(rateLimited[0].body).toHaveProperty('error');
        expect(rateLimited[0].body.error).toHaveProperty('code', 'RATE_LIMITED');
        expect(rateLimited[0].body.error).toHaveProperty('message');
      }
    }, 30000); // 30 second timeout for this test
  });

  describe('Health check bypass', () => {
    it.skip('should NOT rate limit /health endpoint', async () => {
      // Make 150 requests to /health (more than the 100 limit)
      const requests = [];
      for (let i = 0; i < 150; i++) {
        requests.push(request(app).get('/health'));
      }

      const responses = await Promise.all(requests);

      // All health check requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
      });
    }, 30000); // 30 second timeout for this test
  });
});
