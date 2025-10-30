

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
