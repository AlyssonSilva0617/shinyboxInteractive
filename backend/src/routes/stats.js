const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { mean } = require("../utils/stats");
const router = express.Router();
const DATA_PATH = path.join(__dirname, "../../../data/items.json");

// Cache for stats
let statsCache = null;
let lastStatsUpdate = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// GET /api/stats
router.get("/", async (req, res, next) => {
  try {
    const now = new Date();

    // Check if we have valid cached stats
    if (
      statsCache &&
      lastStatsUpdate &&
      now - lastStatsUpdate < CACHE_DURATION
    ) {
      return res.json(statsCache);
    }

    // Read file stats to check if data has changed
    const fileStats = await fs.stat(DATA_PATH);

    // If cache exists and file hasn't been modified since last cache update, return cache
    if (statsCache && lastStatsUpdate && fileStats.mtime <= lastStatsUpdate) {
      return res.json(statsCache);
    }

    // Read and calculate new stats
    const raw = await fs.readFile(DATA_PATH, "utf8");
    const items = JSON.parse(raw);

    if (items.length === 0) {
      const emptyStats = { total: 0, averagePrice: 0 };
      statsCache = emptyStats;
      lastStatsUpdate = now;
      return res.json(emptyStats);
    }

    // Use utility function for mean calculation
    const prices = items.map((item) => item.price);
    const stats = {
      total: items.length,
      averagePrice: Math.round(mean(prices) * 100) / 100, // Round to 2 decimal places
      categories: getCategoryStats(items),
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
      },
    };

    // Update cache
    statsCache = stats;
    lastStatsUpdate = now;

    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// Helper function to get category statistics
function getCategoryStats(items) {
  const categoryCount = {};
  const categoryPrices = {};

  items.forEach((item) => {
    if (!categoryCount[item.category]) {
      categoryCount[item.category] = 0;
      categoryPrices[item.category] = [];
    }
    categoryCount[item.category]++;
    categoryPrices[item.category].push(item.price);
  });

  const categoryStats = {};
  Object.keys(categoryCount).forEach((category) => {
    categoryStats[category] = {
      count: categoryCount[category],
      averagePrice: Math.round(mean(categoryPrices[category]) * 100) / 100,
    };
  });

  return categoryStats;
}

module.exports = router;