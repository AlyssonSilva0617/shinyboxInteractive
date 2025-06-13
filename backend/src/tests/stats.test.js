const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const statsRouter = require('../routes/stats');

// Create test app
const app = express();
app.use('/api/stats', statsRouter);

describe('Stats API', () => {
  describe('GET /api/stats', () => {
    test('should return statistics', async () => {
      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('averagePrice');
      expect(response.body).toHaveProperty('categories');
      expect(response.body).toHaveProperty('priceRange');
      expect(typeof response.body.total).toBe('number');
      expect(typeof response.body.averagePrice).toBe('number');
    });

    test('should return cached results on subsequent calls', async () => {
      const response1 = await request(app)
        .get('/api/stats')
        .expect(200);

      const response2 = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response1.body).toEqual(response2.body);
    });
  });
});