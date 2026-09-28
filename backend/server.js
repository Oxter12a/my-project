const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();


// ===============================
// DATABASE
// ===============================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection failed:");
        console.log(error.message);
    });


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// ===============================
// API ROUTES
// ===============================

app.use(
    "/api/auth",
    require("./routes/authRoutes")
);

app.use(
    "/api/portfolio",
    require("./routes/portfolioRoutes")
);

app.use(
    "/api/admin",
    require("./routes/adminRoutes")
);


// ===============================
// FRONTEND
// ===============================

app.use(
    express.static(
        path.join(__dirname, "../Frontend")
    )
);


// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../Frontend/index.html"
        )
    );

});


// ===============================
// SERVER
// ===============================

const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Campus Connect running at http://localhost:${PORT}`
    );

});