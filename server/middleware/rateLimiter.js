const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests from this IP. Please try again later.",
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

// Strict limiter for URL creation
const createUrlLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    success: false,
    error: "URL creation limit reached. Max 20 URLs per hour per IP.",
  },
  handler: (req, res, next, options) => {
    logger.warn(`Create URL rate limit exceeded: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

// Redirect limiter
const redirectLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 60,
  message: {
    success: false,
    error: "Too many redirect requests. Please slow down.",
  },
});

module.exports = { apiLimiter, createUrlLimiter, redirectLimiter };
