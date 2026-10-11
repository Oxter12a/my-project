const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
    {
        portfolio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Portfolio",
            required: true
        },

        rater: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        stars: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        }
    },
    {
        timestamps: true
    }
);

// one rating per person per student (rating again just updates it)
ratingSchema.index({ portfolio: 1, rater: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);
