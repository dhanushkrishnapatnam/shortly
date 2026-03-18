require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

const { connectDB } = require("./config/database");
const { connectRedis } = require("./config/redis");
const { apiLimiter } = require("./middleware/rateLimiter");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const urlRoutes = require("./routes/url");
const redirectRoutes = require("./routes/redirect");
const logger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Ensure logs directory exists ─────────────────────────────────────────
fs.mkdirSync("logs", { recursive: true });

// ─── Security Middleware ───────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

// ─── CORS ─────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─── HTTP Logging ─────────────────────────────────────────────────────────
app.use(
  morgan("combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

// ─── Trust Proxy (for Render/Vercel deployments) ─────────────────────────
app.set("trust proxy", 1);

// ─── Routes ───────────────────────────────────────────────────────────────
app.use("/api", apiLimiter, urlRoutes);

// Redirect route MUST be last (catches /:code)
app.use("/", redirectRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────
async function start() {
  await connectDB();
  await connectRedis();

  app.listen(PORT, () => {
    logger.info(`Shortly server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
    logger.info(`Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
  });
}

start().catch((err) => {
  logger.error("Failed to start server:", err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});
