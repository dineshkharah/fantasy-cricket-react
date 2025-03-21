const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    playerID: { type: String, required: true, unique: false },
    name: { type: String, required: true },
    team: { type: String, required: true },
    role: { type: String, required: true },
    price: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, required: true },
});

const teamSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    teamName: { type: String, required: true },
    players: { type: [playerSchema], required: true },
}, { timestamps: true });

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;
