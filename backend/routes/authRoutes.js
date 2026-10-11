const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Portfolio = require("../models/Portfolio");
const CATEGORIES = require("../config/categories");
const cleanPhone = require("../utils/phone");

const router = express.Router();


// =================================
// REGISTER
// =================================

router.post("/register", async (req, res) => {

    let user = null;

    try {

        const name = String(req.body.name || "").trim();
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");
        const category = String(req.body.category || "").trim();
        const department = String(req.body.department || "").trim();
        const semester = String(req.body.semester || "").trim();
        const phone = cleanPhone(req.body.phone);


        if (!name || !email || !password) {

            return res.status(400).json({
                message: "Name, email and password are required"
            });

        }

        if (password.length < 6) {

            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });

        }

        if (!phone) {

            return res.status(400).json({
                message: "Please enter a valid phone number"
            });

        }

        if (!CATEGORIES.includes(category)) {

            return res.status(400).json({
                message: "Please select a valid skill category"
            });

        }


        const existingUser = await User.findOne({ email });

        if (existingUser) {

            return res.status(409).json({
                message: "Email is already registered"
            });

        }


        const hashedPassword = await bcrypt.hash(password, 10);

        user = await User.create({
            name,
            email,
            password: hashedPassword,
            department,
            semester,
            phone
        });


        // Creating the portfolio is what adds the student to the
        // category count (1 student = 1 portfolio = counted once).
        await Portfolio.create({
            user: user._id,
            category
        });


        res.status(201).json({
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                category
            }
        });

    }

    catch (error) {

        console.log(error);

        // do not leave a half-created student behind
        if (user) {
            await User.deleteOne({ _id: user._id }).catch(() => {});
        }

        if (error.code === 11000) {

            return res.status(409).json({
                message: "Email is already registered"
            });

        }

        res.status(500).json({
            message: "Registration failed"
        });

    }

});


// =================================
// LOGIN
// =================================

router.post("/login", async (req, res) => {

    try {

        const email =
            String(req.body.email || "").trim().toLowerCase();

        const password =
            String(req.body.password || "");


        const user =
            await User.findOne({ email });


        if (!user) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });

        }


        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });

        }


        const token =
            jwt.sign(

                {
                    id: user._id,
                    role: user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }

            );


        res.json({

            message:
                "Login successful",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                department:
                    user.department,

                semester:
                    user.semester,

                role:
                    user.role

            }

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message:
                "Login failed"

        });

    }

});


module.exports = router;