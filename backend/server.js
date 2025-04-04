require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import routes
const authRoutes = require("./routes/authRoutes");
const playersRoutes = require("./routes/playersRoute");
const teamRoutes = require("./routes/teamRoutes");
const matchRoutes = require("./routes/matchRoutes");
const fantasyRoutes = require("./routes/fantasyRoutes");

const app = express();

app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error(err));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/players", playersRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/matches", matchRoutes);
app.use("/api/v1/fantasy", fantasyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
