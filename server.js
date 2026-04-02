const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const recordRoutes = require("./routes/recordRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { notFound, errorMiddleware } = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();
const API_PREFIX = "/api/v1";

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// ========Global Rate Limiter========
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please try again in a few minutes."
    }
  })
);

// ========Health Check Route========
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Finance API is up."
  });
});

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/records`, recordRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);

app.use(notFound);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();
