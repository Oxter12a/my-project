const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();


// =================================
// REGISTER
// =================================

router.post("/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            department,
            semester
        } = req.body;


        if (!name || !email || !password) {

            return res.status(400).json({
                message:
                    "Name, email and password are required"
            });

        }


        const existingUser =
            await User.findOne({ email });


        if (existingUser) {

            return res.status(400).json({
                message:
                    "Email is already registered"
            });

        }


        const hashedPassword =
            await bcrypt.hash(password, 10);


        const user =
            await User.create({

                name,

                email,

                password: hashedPassword,

                department,

                semester

            });


        res.status(201).json({

            message:
                "Registration successful"

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message:
                "Registration failed"

        });

    }

});


// =================================
// LOGIN
// =================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


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