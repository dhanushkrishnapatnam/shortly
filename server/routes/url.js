const express = require("express");
const router  = express.Router();
const QRCode  = require("qrcode");
const { randomUUID } = require("crypto");

const Url = require("../models/Url");
const { validateUrl, validateAlias } = require("../utils/urlValidator");
const { generateShortCode }          = require("../utils/codeGenerator");
const { createUrlLimiter }           = require("../middleware/rateLimiter");
const { requireToken }               = require("../middleware/tokenAuth");
const { cacheGet, cacheSet, cacheDel } = require("../config/redis");
const logger = require("../utils/logger");

// ── POST /api/shorten ────────────────────────────────────────────────────────
// Public — no token needed to CREATE. Token is returned in response.
router.post("/shorten", createUrlLimiter, async (req, res, next) => {
  try {
    const { url, alias, expiresAt } = req.body;

    const urlCheck = validateUrl(url);
    if (!urlCheck.valid)
      return res.status(400).json({ success: false, error: urlCheck.error });

    const aliasCheck = validateAlias(alias);
    if (!aliasCheck.valid)
      return res.status(400).json({ success: false, error: aliasCheck.error });

    let expiryDate = null;
    if (expiresAt) {
      expiryDate = new Date(expiresAt);
      if (isNaN(expiryDate) || expiryDate <= new Date())
        return res.status(400).json({ success: false, error: "Expiry date must be in the future" });
    }

    // Determine short code
    let shortCode = alias ? alias.trim() : null;
    if (shortCode) {
      const existing = await Url.findOne({ shortCode });
      if (existing)
        return res.status(409).json({ success: false, error: "This alias is already taken" });
    } else {
      let attempts = 0;
      do {
        shortCode = generateShortCode(attempts > 2 ? 8 : 6);
        const exists = await Url.findOne({ shortCode });
        if (!exists) break;
        attempts++;
      } while (attempts < 5);
    }

    // Generate QR code
    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;
    let qrCode = null;
    try {
      qrCode = await QRCode.toDataURL(shortUrl, { width: 300, margin: 2 });
    } catch (err) {
      logger.warn("QR generation failed:", err.message);
    }

    // Generate a secret manage token for this link's owner
    const manageToken = randomUUID();

    const newUrl = await Url.create({
      originalUrl: urlCheck.url,
      shortCode,
      alias: alias ? alias.trim() : null,
      expiresAt: expiryDate,
      qrCode,
      createdBy: req.ip,
      manageToken,
    });

    logger.info(`Shortened: ${shortCode} → ${urlCheck.url}`);

    res.status(201).json({
      success: true,
      data: {
        id:          newUrl._id,
        originalUrl: newUrl.originalUrl,
        shortCode:   newUrl.shortCode,
        shortUrl,
        alias:       newUrl.alias,
        expiresAt:   newUrl.expiresAt,
        qrCode:      newUrl.qrCode,
        createdAt:   newUrl.createdAt,
        manageToken,   // ← returned ONCE, never stored on client server
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/stats/:code ─────────────────────────────────────────────────────
// Requires X-Manage-Token header matching the link's token
router.get("/stats/:code", requireToken, async (req, res, next) => {
  try {
    const { code } = req.params;

    const cached = await cacheGet(`stats:${code}:${req.manageToken}`);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const urlDoc = await Url.findOne({ shortCode: code, manageToken: req.manageToken });
    if (!urlDoc)
      return res.status(404).json({ success: false, error: "Link not found or invalid token." });

    const clicksByDay     = {};
    const clicksByCountry = {};
    for (const click of urlDoc.clicks) {
      const day = new Date(click.timestamp).toISOString().split("T")[0];
      clicksByDay[day]              = (clicksByDay[day] || 0) + 1;
      clicksByCountry[click.country] = (clicksByCountry[click.country] || 0) + 1;
    }

    const recentClicks = urlDoc.clicks
      .slice(-10)
      .reverse()
      .map((c) => ({
        timestamp: c.timestamp,
        country:   c.country,
        city:      c.city,
        referrer:  c.referrer,
      }));

    const stats = {
      id:          urlDoc._id,
      originalUrl: urlDoc.originalUrl,
      shortCode:   urlDoc.shortCode,
      shortUrl:    `${process.env.BASE_URL}/${urlDoc.shortCode}`,
      alias:       urlDoc.alias,
      totalClicks: urlDoc.totalClicks,
      isActive:    urlDoc.isActive,
      isExpired:   urlDoc.isExpired,
      expiresAt:   urlDoc.expiresAt,
      createdAt:   urlDoc.createdAt,
      qrCode:      urlDoc.qrCode,
      clicksByDay,
      clicksByCountry,
      recentClicks,
    };

    await cacheSet(`stats:${code}:${req.manageToken}`, stats, 300);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/urls/batch ─────────────────────────────────────────────────────
// Given an array of { shortCode, manageToken } pairs, returns matching links.
// This is how the dashboard loads "your" links without a login.
router.post("/urls/batch", async (req, res, next) => {
  try {
    const { links } = req.body; // [{ shortCode, manageToken }, ...]

    if (!Array.isArray(links) || links.length === 0)
      return res.json({ success: true, data: [] });

    // Cap at 200 links to prevent abuse
    const safe = links.slice(0, 200);

    // Build OR query: each link must match BOTH shortCode AND manageToken
    const conditions = safe
      .filter((l) => l.shortCode && l.manageToken)
      .map((l) => ({ shortCode: l.shortCode, manageToken: l.manageToken, isActive: true }));

    if (conditions.length === 0)
      return res.json({ success: true, data: [] });

    const urls = await Url.find({ $or: conditions })
      .sort({ createdAt: -1 })
      .select("-clicks -qrCode -__v -manageToken");

    res.json({
      success: true,
      data: urls.map((u) => ({
        id:          u._id,
        originalUrl: u.originalUrl,
        shortCode:   u.shortCode,
        shortUrl:    `${process.env.BASE_URL}/${u.shortCode}`,
        alias:       u.alias,
        totalClicks: u.totalClicks,
        expiresAt:   u.expiresAt,
        isExpired:   u.isExpired,
        createdAt:   u.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/urls/:code ───────────────────────────────────────────────────
// Requires X-Manage-Token
router.delete("/urls/:code", requireToken, async (req, res, next) => {
  try {
    const urlDoc = await Url.findOneAndUpdate(
      { shortCode: req.params.code, manageToken: req.manageToken },
      { isActive: false },
      { new: true }
    );

    if (!urlDoc)
      return res.status(404).json({ success: false, error: "Link not found or invalid token." });

    await cacheDel(`url:${req.params.code}`);
    await cacheDel(`stats:${req.params.code}:${req.manageToken}`);

    logger.info(`Deactivated: ${req.params.code}`);
    res.json({ success: true, message: "URL deactivated" });
  } catch (err) {
    next(err);
  }
});

// ── Health check ─────────────────────────────────────────────────────────────
router.get("/health", (req, res) => {
  res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

module.exports = router;
