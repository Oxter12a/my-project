const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Portfolio = require("../models/Portfolio");
const Rating = require("../models/Rating");
const User = require("../models/User");
const cleanPhone = require("../utils/phone");
const CATEGORIES = require("../config/categories");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


// =================================
// HELPERS
// =================================

// Reads the token if there is one (does NOT block guests).
// Used so we can show "your rating" to logged-in users.
function optionalUserId(req) {

    try {

        const header = req.headers.authorization || "";
        const token = header.split(" ")[1];

        if (!token) return null;

        return jwt.verify(token, process.env.JWT_SECRET).id;

    } catch (error) {

        return null;

    }
}


// Adds averageRating, ratingCount and myRating to each portfolio.
async function withRatings(portfolios, userId) {

    const ids = portfolios.map(p => p._id);

    // one simple query, averages are worked out below
    const all = await Rating.find(
        { portfolio: { $in: ids } },
        "portfolio rater stars"
    );

    const statMap = {};

    all.forEach(r => {

        const key = String(r.portfolio);

        if (!statMap[key]) statMap[key] = { total: 0, count: 0 };

        statMap[key].total += r.stars;
        statMap[key].count += 1;
    });

    const mineMap = {};

    if (userId) {

        all.forEach(r => {

            if (String(r.rater) === String(userId)) {
                mineMap[String(r.portfolio)] = r.stars;
            }
        });
    }

    return portfolios.map(p => {

        const s = statMap[String(p._id)];
        const obj = p.toObject();

        obj.averageRating = s ? Math.round((s.total / s.count) * 10) / 10 : 0;
        obj.ratingCount = s ? s.count : 0;
        obj.myRating = mineMap[String(p._id)] || 0;

        return obj;
    });
}


function cleanSkills(skills) {

    const list = Array.isArray(skills)
        ? skills
        : String(skills || "").split(",");

    return list
        .map(s => String(s).trim())
        .filter(Boolean);
}


// =================================
// CREATE / UPDATE MY PORTFOLIO
// =================================

router.post("/", protect, async (req, res) => {

    try {

        const {
            category,
            skills,
            description,
            portfolioLink,
            availability,
            phone
        } = req.body;


        if (!CATEGORIES.includes(category)) {

            return res.status(400).json({
                message: "Please select a valid category"
            });

        }


        // phone is saved on the user so people can contact the student
        if (phone !== undefined && String(phone).trim() !== "") {

            const cleaned = cleanPhone(phone);

            if (!cleaned) {

                return res.status(400).json({
                    message: "Please enter a valid phone number"
                });

            }

            await User.findByIdAndUpdate(req.user.id, { phone: cleaned });
        }


        // upsert: one portfolio per student. Changing the category
        // moves the student from one count to another automatically.
        const portfolio = await Portfolio.findOneAndUpdate(

            { user: req.user.id },

            {
                category,
                skills: cleanSkills(skills),
                description: String(description || "").trim(),
                portfolioLink: String(portfolioLink || "").trim(),
                availability: availability !== false
            },

            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }

        );


        res.json({
            message: "Portfolio saved",
            portfolio
        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Portfolio operation failed"
        });

    }

});


// =================================
// GET MY PORTFOLIO
// =================================

router.get("/mine", protect, async (req, res) => {

    try {

        const portfolio =
            await Portfolio
                .findOne({ user: req.user.id })
                .populate("user", "name email phone department semester");

        res.json(portfolio);

    }

    catch (error) {

        res.status(500).json({
            message: "Unable to get portfolio"
        });

    }

});


// =================================
// SEARCH  (?skill=video)
// =================================

router.get("/search", async (req, res) => {

    try {

        // escape so users cannot break the regex
        const skill =
            String(req.query.skill || "")
                .trim()
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const filter = skill
            ? {
                $or: [
                    { category: { $regex: skill, $options: "i" } },
                    { skills: { $regex: skill, $options: "i" } }
                ]
            }
            : {};

        const portfolios =
            await Portfolio
                .find(filter)
                .sort({ createdAt: -1 })
                .populate("user", "name department semester");

        // ignore any portfolio whose user no longer exists
        const valid = portfolios.filter(p => p.user);

        res.json(await withRatings(valid, optionalUserId(req)));

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Search failed"
        });

    }

});


// =================================
// GET ALL  (?limit=3&sort=top for featured students)
// =================================

router.get("/", async (req, res) => {

    try {

        const portfolios =
            await Portfolio
                .find()
                .sort({ createdAt: -1 })
                .populate("user", "name department semester");

        const valid = portfolios.filter(p => p.user);

        let list = await withRatings(valid, optionalUserId(req));

        if (req.query.sort === "top") {

            list.sort((a, b) =>
                b.averageRating - a.averageRating ||
                b.ratingCount - a.ratingCount
            );

        }

        const limit = parseInt(req.query.limit, 10);

        if (limit > 0) list = list.slice(0, limit);

        res.json(list);

    }

    catch (error) {

        res.status(500).json({
            message: "Unable to fetch portfolios"
        });

    }

});


// =================================
// CONTACT DETAILS  (login required)
// GET /api/portfolio/:id/contact
// =================================

router.get("/:id/contact", protect, async (req, res) => {

    try {

        if (!mongoose.isValidObjectId(req.params.id)) {

            return res.status(400).json({
                message: "Invalid student id"
            });

        }

        const portfolio =
            await Portfolio
                .findById(req.params.id)
                .populate("user", "name email phone");

        if (!portfolio || !portfolio.user) {

            return res.status(404).json({
                message: "Student not found"
            });

        }

        res.json({
            name: portfolio.user.name,
            email: portfolio.user.email,
            phone: portfolio.user.phone || ""
        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Unable to get contact details"
        });

    }

});


// =================================
// RATE A STUDENT  (POST /api/portfolio/:id/rate  { "stars": 4 })
// =================================

router.post("/:id/rate", protect, async (req, res) => {

    try {

        const stars = Number(req.body.stars);

        if (!Number.isInteger(stars) || stars < 1 || stars > 5) {

            return res.status(400).json({
                message: "Rating must be a whole number from 1 to 5"
            });

        }

        if (!mongoose.isValidObjectId(req.params.id)) {

            return res.status(400).json({
                message: "Invalid student id"
            });

        }

        const portfolio = await Portfolio.findById(req.params.id);

        if (!portfolio) {

            return res.status(404).json({
                message: "Student not found"
            });

        }

        if (String(portfolio.user) === String(req.user.id)) {

            return res.status(400).json({
                message: "You cannot rate your own portfolio"
            });

        }


        // first rating creates, later ratings update
        await Rating.findOneAndUpdate(
            { portfolio: portfolio._id, rater: req.user.id },
            { stars },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );


        const ratings = await Rating.find(
            { portfolio: portfolio._id },
            "stars"
        );

        const total = ratings.reduce((sum, r) => sum + r.stars, 0);


        res.json({
            message: "Rating saved",
            myRating: stars,
            averageRating: Math.round((total / ratings.length) * 10) / 10,
            ratingCount: ratings.length
        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Rating failed"
        });

    }

});


module.exports = router;
