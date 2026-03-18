const logger = require("../utils/logger");

let client = null;
let isConnected = false;

async function connectRedis() {
  if (!process.env.REDIS_URL) {
    logger.info("Redis URL not set — caching disabled");
    return;
  }

  try {
    const { createClient } = require("redis");
    client = createClient({ url: process.env.REDIS_URL });

    client.on("error", (err) => {
      logger.warn("Redis error:", err.message);
      isConnected = false;
    });

    client.on("connect", () => {
      logger.info("Redis connected");
      isConnected = true;
    });

    await client.connect();
  } catch (err) {
    logger.warn("Redis connection failed — continuing without cache:", err.message);
    client = null;
  }
}

async function cacheGet(key) {
  if (!client || !isConnected) return null;
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds = 3600) {
  if (!client || !isConnected) return;
  try {
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // silent fail
  }
}

async function cacheDel(key) {
  if (!client || !isConnected) return;
  try {
    await client.del(key);
  } catch {
    // silent fail
  }
}

module.exports = { connectRedis, cacheGet, cacheSet, cacheDel };
