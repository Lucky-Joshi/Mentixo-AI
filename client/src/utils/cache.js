const CACHE_PREFIX = "mentixo_";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

export const setCache = (key, value, ttl = CACHE_TTL) => {
  try {
    const item = {
      value,
      expiry: Date.now() + ttl,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  } catch (error) {
    console.error("Cache set error:", error);
  }
};

export const getCache = (key) => {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;

    const { value, expiry } = JSON.parse(item);
    if (Date.now() > expiry) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return value;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
};

export const deleteCache = (key) => {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch (error) {
    console.error("Cache delete error:", error);
  }
};

export const clearCache = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Cache clear error:", error);
  }
};

export const getCacheStats = () => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
    let totalSize = 0;

    cacheKeys.forEach((key) => {
      const item = localStorage.getItem(key);
      totalSize += item ? item.length : 0;
    });

    return {
      count: cacheKeys.length,
      size: totalSize,
      sizeKB: (totalSize / 1024).toFixed(2),
    };
  } catch (error) {
    console.error("Cache stats error:", error);
    return { count: 0, size: 0, sizeKB: 0 };
  }
};
