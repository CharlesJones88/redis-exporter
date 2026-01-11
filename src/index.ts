import { logger } from "./logger";
import { getClient } from "./redis";

process.on("SIGTERM", async () => {
  (await getClient()).close();
  process.exit(0);
});

const server = Bun.serve({
  port: 9121,
  routes: {
    "/metrics": async () => {
      try {
        logger.info("Fetching metrics");
        const redis = await getClient();
        const body = [
          "# HELP redis_queue_length Number of jobs in the queue",
          "# TYPE redis_queue_length gauge",
        ];

        const keys = await redis.keys("*");

        if (keys.length === 0) {
          logger.info("No queues available");
          body.push("redis_queue_length 0");
        }

        for (const key of keys) {
          const type = await redis.type(key);
          logger.info(`Found key: ${key} with type: ${type}`);

          if (type === "list") {
            const count = await redis.llen(key);
            logger.info(`%s has %d items`, key, count);
            body.push(`redis_queue_length{queue="${key}"} ${count}`);
          }
        }

        return new Response(body.join("\n"), {
          status: 200,
          headers: { "Content-Type": "text/plain; version=0.0.4" },
        });
      } catch (error) {
        logger.error(error, "Error occurred getting metrics");
        return new Response("Internal Error", { status: 500 });
      }
    },
  },
  fetch() {
    logger.error("Invalid endpoint called");
    return new Response("Not Found", { status: 404 });
  },
});

logger.info(`Server listening at: %s`, server.url);
