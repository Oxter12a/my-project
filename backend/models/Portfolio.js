const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
    {
        // one portfolio per student -> a student is counted only once
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
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

portfolioSchema.index({ category: 1 });

module.exports = mongoose.model("Portfolio", portfolioSchema);
