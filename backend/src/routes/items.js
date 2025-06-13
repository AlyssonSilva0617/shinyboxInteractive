const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();
const DATA_PATH = path.join(__dirname, "../../../data/items.json");

// Cache for data to avoid repeated file reads
let dataCache = null;
let lastModified = null;

// Utility to read data asynchronously with caching
async function readData() {
  try {
    const stats = await fs.stat(DATA_PATH);

    // Check if we need to refresh cache
    if (!dataCache || !lastModified || stats.mtime > lastModified) {
      const raw = await fs.readFile(DATA_PATH, "utf8");
      dataCache = JSON.parse(raw);
      lastModified = stats.mtime;
    }
    
    return dataCache;
  } catch (error) {
    console.error("Error reading data:", error);
    throw error;
  }
}

// Utility to write data asynchronously
async function writeData(data) {
  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));

    // Update cache
    dataCache = data;
    lastModified = new Date();
  } catch (error) {
    console.error("Error writing data:", error);
    throw error;
  }
}

// GET /api/items
router.get("/", async (req, res, next) => {
  try {
    const data = await readData();
    const { limit, page = 1, q } = req.query;
    let results = [...data]; // Create a copy to avoid mutating original

    // Search functionality
    if (q) {
      const searchTerm = q.toLowerCase();
      results = results.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm)
      );
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedResults = results.slice(startIndex, endIndex);

    // Return paginated response with metadata
    res.json({
      items: paginatedResults,
      pagination: {
        currentPage: pageNum,
        totalItems: results.length,
        totalPages: Math.ceil(results.length / limitNum),
        itemsPerPage: limitNum,
        hasNextPage: endIndex < results.length,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get("/:id", async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find((i) => i.id === parseInt(req.params.id, 10));
    if (!item) {
      const err = new Error("Item not found");
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post("/", async (req, res, next) => {
  try {
    const { name, category, price } = req.body;

    // Validate payload
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      const err = new Error("Name is required and must be a non-empty string");
      err.status = 400;
      throw err;
    }

    if (
      !category ||
      typeof category !== "string" ||
      category.trim().length === 0
    ) {
      const err = new Error(
        "Category is required and must be a non-empty string"
      );
      err.status = 400;
      throw err;
    }

    if (
      price === undefined ||
      price === null ||
      typeof price !== "number" ||
      price < 0
    ) {
      const err = new Error(
        "Price is required and must be a non-negative number"
      );
      err.status = 400;
      throw err;
    }

    const data = await readData();
    const item = {
      id: Date.now(),
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
    };

    data.push(item);
    await writeData(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;