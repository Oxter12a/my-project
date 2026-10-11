// Removes test / fake students from the database.
//
//   node scripts/cleanup.js            -> DRY RUN: only shows what would be deleted
//   node scripts/cleanup.js --confirm  -> actually deletes
//
// Admin accounts are always kept.

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const mongoose = require("mongoose");

const User = require("../models/User");
const Portfolio = require("../models/Portfolio");
const Rating = require("../models/Rating");

const confirm = process.argv.includes("--confirm");

(async () => {

    await mongoose.connect(process.env.MONGO_URI);

    const students = await User.find({ role: { $ne: "admin" } });

    console.log(`\nStudents found (admins are kept): ${students.length}`);
    students.forEach(u => console.log(`  - ${u.name} <${u.email}>`));

    if (!confirm) {

        console.log("\nDRY RUN - nothing was deleted.");
        console.log("Run again with --confirm to delete the students above.\n");

    } else {

        const ids = students.map(u => u._id);

        const portfolios = await Portfolio.find({ user: { $in: ids } }, "_id");
        const pids = portfolios.map(p => p._id);

        const r1 = await Rating.deleteMany({
            $or: [{ portfolio: { $in: pids } }, { rater: { $in: ids } }]
        });
        const r2 = await Portfolio.deleteMany({ user: { $in: ids } });
        const r3 = await User.deleteMany({ _id: { $in: ids } });

        // portfolios whose user no longer exists at all
        const allUsers = await User.find({}, "_id");
        const r4 = await Portfolio.deleteMany({
            user: { $nin: allUsers.map(u => u._id) }
        });

        console.log(
            `\nDeleted: ${r3.deletedCount} users, ` +
            `${r2.deletedCount + r4.deletedCount} portfolios, ` +
            `${r1.deletedCount} ratings.\n`
        );
    }

    await mongoose.disconnect();

})().catch(err => {
    console.error(err.message);
    process.exit(1);
});
