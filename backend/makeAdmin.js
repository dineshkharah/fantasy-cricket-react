// Makes a user an admin, or takes it back.
// Run it from the backend folder:
//   node makeAdmin.js you@example.com
//   node makeAdmin.js you@example.com remove
// The email or the username both work.

require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const mongoose = require("mongoose");

// same as server.js, some networks cannot resolve the mongodb+srv address on their own
const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const User = require("./models/User");

const run = async () => {
    const identifier = process.argv[2];
    const takeItBack = process.argv[3] === "remove";

    if (!identifier) {
        console.log("Give an email or a username:");
        console.log("  node makeAdmin.js you@example.com");
        console.log("  node makeAdmin.js you@example.com remove");
        return;
    }

    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
        console.log(`no user found for "${identifier}"`);
        return;
    }

    user.role = takeItBack ? "user" : "admin";
    await user.save();
    console.log(`${user.username} (${user.email}) is now: ${user.role}`);

    const admins = await User.find({ role: "admin" }).select("username email");
    console.log("");
    console.log(`admins right now (${admins.length}):`);
    for (const admin of admins) {
        console.log(`  ${admin.username}  ${admin.email}`);
    }
};

run()
    .catch((err) => console.error("failed:", err))
    .finally(() => mongoose.connection.close());
