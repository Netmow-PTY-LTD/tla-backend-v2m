

import { CacheKeys } from '../config/cacheKeys';
import { redisClient } from '../config/redis.config';



export const deleteCache = async (keys: string | string[]) => {
  try {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    if (keysArray.length === 0) return;

    // Create pipeline
    const pipeline = redisClient.multi(); // use multi() in redis v4
    keysArray.forEach((key) => pipeline.del(key));

    const results = await pipeline.exec(); // execute pipeline
    console.log(`Deleted cache keys: ${keysArray.join(', ')}`);
    console.log('Redis results:', results);
  } catch (err) {
    console.error(`Error deleting cache keys: ${keys}`, err);
  }
};



/* 

USES EXAMPLE:

1. await deleteCache(CacheKeys.USER_INFO(userId));

2. await deleteCache([
  CacheKeys.USER_INFO(userId),
  CacheKeys.USER_ACTIVITY(userId),
  CacheKeys.USER_LOCATION(userId),
]);


*/




export const clearAllCache = async () => {
  try {
    await redisClient.flushAll();
    console.log(`All cache cleared`);
  } catch (err) {
    console.error(`Error clearing all cache`, err);
  }
};




export const deleteKeysByPattern = async (pattern: string) => {
  try {
    let cursor = '0';
    let totalDeleted = 0;
    do {
      const result = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });

      cursor = result.cursor;      // updated cursor
      const keys = result.keys;   // keys array

      if (keys.length > 0) {
        const pipeline = redisClient.multi();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();
        totalDeleted += keys.length;
        console.log(`Deleted keys: ${keys.join(', ')}`);
      }
    } while (cursor !== '0');

    console.log(`Finished deleting ${totalDeleted} keys matching pattern: ${pattern}`);
  } catch (err) {
    console.error(`Error deleting keys for pattern ${pattern}`, err);
  }
};





export const removeLeadListCacheByUser = async (userId: string) => {
  try {
    const pattern = CacheKeys.LEAD_LIST_BY_USER_PATTERN(userId);
    let cursor = '0';

    console.log(`Starting cache cleanup for user: ${userId} (pattern: ${pattern})`);

    do {
      // Scan for matching keys in batches
      const result = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });

      cursor = result.cursor;
      const keys = result.keys;

      if (keys.length > 0) {
        const pipeline = redisClient.multi();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();

        console.log(` Deleted ${keys.length} lead cache keys for user ${userId}`);
      }
    } while (cursor !== '0');

    console.log(` Finished deleting all lead caches for user: ${userId}`);
  } catch (err) {
    console.error(` Error deleting lead cache for user ${userId}:`, err);
  }
};