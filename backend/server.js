const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();                       // must run before connectDB()

const connectDB = require("./config/db");
connectDB();

const app = express();


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

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/portfolio", require("./routes/portfolioRoutes"));

app.use("/api/categories", require("./routes/categoryRoutes"));

app.use("/api/admin", require("./routes/adminRoutes"));

// unknown /api/... address -> JSON instead of an HTML page
app.use("/api", (req, res) => {
    res.status(404).json({ message: "API route not found" });
});


// ===============================
// FRONTEND
// ===============================

app.use(
    express.static(
        path.join(__dirname, "../Frontend")
    )
);

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "../Frontend/index.html")
    );

});


// ===============================
// SERVER
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Campus Connect running at http://localhost:${PORT}`
    );

});
