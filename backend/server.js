require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import routes
const playersRoutes = require("./routes/playersRoute");
const teamRoutes = require("./routes/teamRoutes");

const app = express();

// Enable CORS (Allow frontend to communicate with backend)
app.use(
    cors({
        origin: ["http://localhost:5173"],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error(err));

// Routes
app.use("/api/v1/players", playersRoutes);
app.use("/api/v1/teams", teamRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
