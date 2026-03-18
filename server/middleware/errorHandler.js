const logger = require("../utils/logger");

// 404 handler
function notFound(req, res, next) {
  const error = new Error(`Not Found — ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

// Global error handler
function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  logger.error(`${statusCode} ${err.message}${err.stack ? "\n" + err.stack : ""}`);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, error: messages.join(", ") });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({
      success: false,
      error: field === "shortCode" ? "Short code already exists" : "Alias already taken",
    });
  }

  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal Server Error",
    ...(isProduction ? {} : { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
