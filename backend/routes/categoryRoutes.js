const express = require("express");
const router = express.Router();

const Portfolio = require("../models/Portfolio");
const CATEGORIES = require("../config/categories");

// GET /api/categories/counts
// Counts REAL registered students per category, straight from the database.
// Returns [{ _id: "Video Editing", count: 3 }, ...] (all categories, 0 if empty)
router.get("/counts", async (req, res) => {

    try {

        const grouped = await Portfolio.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const map = {};
        grouped.forEach(g => { map[g._id] = g.count; });

        res.json(
            CATEGORIES.map(name => ({
                _id: name,
                count: map[name] || 0
            }))
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to get category counts"
        });
    }
});

module.exports = router;
