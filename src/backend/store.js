import globals from './globals.js';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';

async function initStore(prefix) {
  // 🔌 Redis client
  const redisClient = createClient({
    legacyMode: true,
    url: globals.get('REDIS_URL'),
  });
  await redisClient.connect();

  return new RedisStore({
    client: redisClient,
    prefix,
    ttl: 10 * 60,
    disableTouch: true,
  });
}

export default { initStore };
