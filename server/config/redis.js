const redis = require("redis");

let client = null;
let isConnected = false;

/**
 * Initialize Redis client
 * Runs on server startup
 */
const initRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    
    client = redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.warn("[Redis] Max reconnection attempts reached");
            return new Error("Redis max retries reached");
          }
          return retries * 100; // Exponential backoff
        },
      },
    });

    client.on("error", (err) => {
      console.error("[Redis] Error:", err.message);
      isConnected = false;
    });

    client.on("connect", () => {
      console.log("[Redis] Connected");
      isConnected = true;
    });

    await client.connect();
    console.log("[Redis] Client initialized");
  } catch (error) {
    console.warn(`[Redis] Failed to initialize: ${error.message}`);
    console.warn("[Redis] Continuing without cache. Install Redis for caching benefits.");
  }
};

/**
 * Check if Redis is available and connected
 */
const isRedisAvailable = () => {
  return isConnected && client;
};

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {string|null} - Cached value or null
 */
const getCache = async (key) => {
  if (!isRedisAvailable()) return null;

  try {
    const value = await client.get(key);
    if (value) {
      console.log(`[Cache HIT] ${key}`);
    }
    return value;
  } catch (error) {
    console.error(`[Cache] Get error for key ${key}:`, error.message);
    return null;
  }
};

/**
 * Set value in cache with TTL
 * @param {string} key - Cache key
 * @param {string} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 7 days)
 */
const setCache = async (key, value, ttl = 7 * 24 * 60 * 60) => {
  if (!isRedisAvailable()) return false;

  try {
    await client.setEx(key, ttl, value);
    console.log(`[Cache SET] ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    console.error(`[Cache] Set error for key ${key}:`, error.message);
    return false;
  }
};

/**
 * Delete cache key
 * @param {string} key - Cache key
 */
const deleteCache = async (key) => {
  if (!isRedisAvailable()) return false;

  try {
    const result = await client.del(key);
    if (result > 0) {
      console.log(`[Cache DELETE] ${key}`);
    }
    return result > 0;
  } catch (error) {
    console.error(`[Cache] Delete error for key ${key}:`, error.message);
    return false;
  }
};

/**
 * Invalidate cache by pattern
 * @param {string} pattern - Pattern to match (e.g., "quiz:*")
 */
const invalidateCachePattern = async (pattern) => {
  if (!isRedisAvailable()) return 0;

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      console.log(`[Cache INVALIDATE] ${pattern} (${keys.length} keys deleted)`);
    }
    return keys.length;
  } catch (error) {
    console.error(`[Cache] Pattern invalidation error for ${pattern}:`, error.message);
    return 0;
  }
};

/**
 * Get cache stats
 */
const getCacheStats = async () => {
  if (!isRedisAvailable()) {
    return { connected: false, message: "Redis not connected" };
  }

  try {
    const info = await client.info();
    const dbSize = await client.dbSize();
    
    return {
      connected: true,
      dbSize,
      info: info.split("\r\n").slice(0, 10).join("\n"), // First 10 lines
    };
  } catch (error) {
    return { connected: false, error: error.message };
  }
};

/**
 * Close Redis connection
 */
const closeRedis = async () => {
  if (client) {
    try {
      await client.quit();
      console.log("[Redis] Connection closed");
    } catch (error) {
      console.error("[Redis] Error closing connection:", error.message);
    }
  }
};

module.exports = {
  initRedis,
  isRedisAvailable,
  getCache,
  setCache,
  deleteCache,
  invalidateCachePattern,
  getCacheStats,
  closeRedis,
};
