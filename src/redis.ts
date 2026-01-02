import { RedisClient } from "bun";

const { REDIS_URL = "" } = Bun.env;
let redis: RedisClient | undefined;

export async function getClient() {
  if (redis == undefined || !redis.connected) {
    redis = new RedisClient(REDIS_URL);
    await redis.connect();
  }
  return redis;
}
