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
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Serve the React frontend production build
const frontendPath = path.join(__dirname, "../../frontend/build");
app.use(express.static(frontendPath));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: "Too many requests from this IP, please try again after 15 minutes"
});

app.use("/api/", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/users", userRoutes);

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error"
  });
});

// Fallback — serve index.html for any unmatched routes (only if it exists)
app.use((req, res) => {
  const indexPath = path.join(frontendPath, "index.html");
  if (require("fs").existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      message: "Frontend build not found. Please run 'npm run build' in the frontend directory or use the development server on port 3000.",
      port_3000: "http://localhost:3000",
      api_info: "API is running on http://localhost:4000/api"
    });
  }
});

module.exports = app;
