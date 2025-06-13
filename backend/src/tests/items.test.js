const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const itemsRouter = require('../routes/items');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/items', itemsRouter);

// Mock data path for testing
const TEST_DATA_PATH = path.join(__dirname, 'test-items.json');
const originalDataPath = path.join(__dirname, '../../../data/items.json');

// Test data
const testItems = [
  { "id": 1, "name": "Test Laptop", "category": "Electronics", "price": 1000 },
  { "id": 2, "name": "Test Chair", "category": "Furniture", "price": 500 }
];

describe('Items API', () => {
  beforeEach(async () => {
    // Create test data file
    await fs.writeFile(TEST_DATA_PATH, JSON.stringify(testItems, null, 2));
    
    // Mock the DATA_PATH in the items router
    jest.doMock('../routes/items', () => {
      const originalModule = jest.requireActual('../routes/items');
      // This is a simplified approach - in a real app, you'd use dependency injection
      return originalModule;
    });
  });

  afterEach(async () => {
    // Clean up test data file
    try {
      await fs.unlink(TEST_DATA_PATH);
    } catch (error) {
      // File might not exist, ignore error
    }
  });

  describe('GET /api/items', () => {
    test('should return paginated items', async () => {
      const response = await request(app)
        .get('/api/items')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.pagination).toHaveProperty('currentPage');
      expect(response.body.pagination).toHaveProperty('totalItems');
    });

    test('should handle search query', async () => {
      const response = await request(app)
        .get('/api/items?q=laptop')
        .expect(200);

      expect(response.body.items.length).toBeGreaterThan(0);
      expect(response.body.items[0].name.toLowerCase()).toContain('laptop');
    });

    test('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/items?page=1&limit=1')
        .expect(200);

      expect(response.body.items.length).toBeLessThanOrEqual(1);
      expect(response.body.pagination.itemsPerPage).toBe(1);
    });
  });

  describe('GET /api/items/:id', () => {
    test('should return item by id', async () => {
      const response = await request(app)
        .get('/api/items/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('category');
      expect(response.body).toHaveProperty('price');
    });

    test('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .get('/api/items/999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/items', () => {
    test('should create new item with valid data', async () => {
      const newItem = {
        name: 'Test Product',
        category: 'Test Category',
        price: 299
      };

      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newItem.name);
      expect(response.body.category).toBe(newItem.category);
      expect(response.body.price).toBe(newItem.price);
    });

    test('should return 400 for missing name', async () => {
      const invalidItem = {
        category: 'Test Category',
        price: 299
      };

      await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);
    });

    test('should return 400 for invalid price', async () => {
      const invalidItem = {
        name: 'Test Product',
        category: 'Test Category',
        price: -100
      };

      await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);
    });

    test('should return 400 for missing category', async () => {
      const invalidItem = {
        name: 'Test Product',
        price: 299
      };

      await request(app)
        .post('/api/items')
        .send(invalidItem)
        .expect(400);
    });
  });
});