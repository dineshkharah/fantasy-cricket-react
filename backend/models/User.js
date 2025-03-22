const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // New field
    branch: { type: String, required: true },
    year: { type: String, required: true },
    division: { type: String, required: true },
});

module.exports = mongoose.model("User", UserSchema);
