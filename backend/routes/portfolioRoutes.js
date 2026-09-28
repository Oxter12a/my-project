const express = require("express");

const Portfolio =
    require("../models/Portfolio");

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();


// =================================
// CREATE PORTFOLIO
// =================================

router.post("/", protect, async (req, res) => {

    try {

        const {
            category,
            skills,
            description,
            portfolioLink,
            availability
        } = req.body;


        if (!category) {

            return res.status(400).json({

                message:
                    "Please select a category"

            });

        }


        const existingPortfolio =
            await Portfolio.findOne({
                user: req.user.id
            });


        if (existingPortfolio) {

            const updated =
                await Portfolio.findOneAndUpdate(

                    {
                        user: req.user.id
                    },

                    {
                        category,
                        skills,
                        description,
                        portfolioLink,
                        availability
                    },

                    {
                        new: true
                    }

                );


            return res.json({

                message:
                    "Portfolio updated",

                portfolio: updated

            });

        }


        const portfolio =
            await Portfolio.create({

                user: req.user.id,

                category,

                skills,

                description,

                portfolioLink,

                availability

            });


        res.status(201).json({

            message:
                "Portfolio created",

            portfolio

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message:
                "Portfolio operation failed"

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
                .findOne({
                    user: req.user.id
                })
                .populate(
                    "user",
                    "name email department semester"
                );


        res.json(portfolio);

    }

    catch (error) {

        res.status(500).json({

            message:
                "Unable to get portfolio"

        });

    }

});


// =================================
// GET ALL PORTFOLIOS
// =================================

router.get("/", async (req, res) => {

    try {

        const portfolios =
            await Portfolio
                .find()
                .populate(
                    "user",
                    "name email department semester"
                );


        res.json(portfolios);

    }

    catch (error) {

        res.status(500).json({

            message:
                "Unable to fetch portfolios"

        });

    }

});


// =================================
// SEARCH
// =================================

router.get("/search", async (req, res) => {

    try {

        const skill =
            req.query.skill || "";


        const portfolios =
            await Portfolio
                .find({

                    $or: [

                        {
                            category: {
                                $regex:
                                    skill,
                                $options: "i"
                            }
                        },

                        {
                            skills: {
                                $regex:
                                    skill,
                                $options: "i"
                            }
                        }

                    ]

                })
                .populate(
                    "user",
                    "name email department semester"
                );


        res.json(portfolios);

    }

    catch (error) {

        res.status(500).json({

            message:
                "Search failed"

        });

    }

});


module.exports = router;