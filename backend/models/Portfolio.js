const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        category: {
            type: String,
            required: true
        },

        skills: {
            type: [String],
            default: []
        },

        description: {
            type: String,
            default: ""
        },

        portfolioLink: {
            type: String,
            default: ""
        },

        availability: {
            type: Boolean,
            default: true
        }
    },

    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "Portfolio",
        portfolioSchema
    );