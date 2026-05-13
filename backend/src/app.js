const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const path = require("path");

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const roomRoutes = require("./routes/rooms");
const userRoutes = require("./routes/users");

const app = express();

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Serve static HTML/CSS/JS from project root
app.use(express.static(path.join(__dirname, "../../")));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use("/api/", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/users", userRoutes);

// Fallback: serve index.html for all non-API, non-static routes
app.get(
  /^\/(?!api\/|uploads\/|css\/|js\/|Assets\/|robots\.txt|favicon\.ico).*/,
  (req, res) => {
    res.sendFile(path.join(__dirname, "../../index.html"));
  },
);

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
