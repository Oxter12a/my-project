const express = require("express");

const User =
    require("../models/User");

const Portfolio =
    require("../models/Portfolio");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");


const router = express.Router();


// =================================
// USERS
// =================================

router.get(
    "/users",
    protect,
    adminOnly,
    async (req, res) => {

        try {

            const users =
                await User
                    .find()
                    .select("-password");

            res.json(users);

        }

        catch (error) {

            res.status(500).json({

                message:
                    "Unable to fetch users"

            });

        }

    }
);


// =================================
// PORTFOLIOS
// =================================

router.get(
    "/portfolios",
    protect,
    adminOnly,
    async (req, res) => {

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

    }
);


// =================================
// STATISTICS
// =================================

router.get(
    "/stats",
    protect,
    adminOnly,
    async (req, res) => {

        try {

            const users =
                await User.countDocuments();

            const portfolios =
                await Portfolio.countDocuments();


            const videoEditing =
                await Portfolio.countDocuments({
                    category:
                        "Video Editing"
                });


            const uiux =
                await Portfolio.countDocuments({
                    category:
                        "UI/UX Design"
                });


            const webDevelopment =
                await Portfolio.countDocuments({
                    category:
                        "Web Development"
                });


            const photography =
                await Portfolio.countDocuments({
                    category:
                        "Photography"
                });


            res.json({

                users,

                portfolios,

                categories: {

                    videoEditing,

                    uiux,

                    webDevelopment,

                    photography

                }

            });

        }

        catch (error) {

            res.status(500).json({

                message:
                    "Unable to fetch statistics"

            });

        }

    }
);


module.exports = router;