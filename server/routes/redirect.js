const express = require("express");
const router = express.Router();
const geoip = require("geoip-lite");
const useragent = require("useragent");

const Url = require("../models/Url");
const { cacheGet, cacheSet } = require("../config/redis");
const { redirectLimiter } = require("../middleware/rateLimiter");
const logger = require("../utils/logger");

// GET /:code → redirect
router.get("/:code", redirectLimiter, async (req, res, next) => {
  try {
    const { code } = req.params;

    // Validate code format
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(code)) {
      return res.status(400).json({ success: false, error: "Invalid short code format" });
    }

    // Check cache first
    let urlDoc = await cacheGet(`url:${code}`);

    if (!urlDoc) {
      urlDoc = await Url.findOne({ shortCode: code, isActive: true });
      if (!urlDoc) {
        return res.status(404).json({ success: false, error: "Short URL not found" });
      }
      // Cache basic redirect info (not full doc with clicks)
      await cacheSet(`url:${code}`, { originalUrl: urlDoc.originalUrl, expiresAt: urlDoc.expiresAt }, 3600);
    }

    // Check expiry
    if (urlDoc.expiresAt && new Date() > new Date(urlDoc.expiresAt)) {
      return res.status(410).json({ success: false, error: "This short URL has expired" });
    }

    // Record click asynchronously (don't await — don't slow redirect)
    recordClick(code, req).catch((err) => logger.error("Click recording error:", err));

    logger.info(`Redirect: ${code} → ${urlDoc.originalUrl}`);
    res.redirect(301, urlDoc.originalUrl);
  } catch (err) {
    next(err);
  }
});

async function recordClick(code, req) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
  const geo = geoip.lookup(ip);
  const ua = useragent.parse(req.headers["user-agent"] || "");

  await Url.findOneAndUpdate(
    { shortCode: code },
    {
      $push: {
        clicks: {
          timestamp: new Date(),
          ip: ip.replace(/::ffff:/, ""),
          country: geo?.country || "Unknown",
          city: geo?.city || "Unknown",
          userAgent: ua.toString(),
          referrer: req.headers.referer || "",
        },
      },
      $inc: { totalClicks: 1 },
    }
  );
}

module.exports = router;
