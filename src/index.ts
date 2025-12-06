import { RedisClient } from "bun";
import { logger } from "./logger";

const redis = new RedisClient(process.env.REDIS_URL);

process.on("SIGTERM", () => {
  redis.close();
  process.exit(0);
});

await redis.connect();

const server = Bun.serve({
  port: 9121,
  routes: {
    "/metrics": async (request, server) => {
      try {
        logger.info("Fetching metrics");
        const body = [
          "# HELP redis_queue_length Number of jobs in the queue",
          "# TYPE redis_queue_length gauge",
        ];

        const keys = await redis.keys("*");

        for (const key of keys) {
          const type = await redis.type(key);

          if (type === "list") {
            const count = await redis.llen(key);
            logger.info(`${key} has ${count} items`);
            body.push(`redis_queue_length{queue="${key}"} ${count}`);
          }
        }

        return new Response(body.join("\n"), {
          status: 200,
          headers: { "Content-Type": "text/plain; version=0.0.4" },
        });
      } catch (error) {
        logger.error("Error occurred getting metrics", { error });
        return new Response("Internal Error", { status: 500 });
      }
    },
  },
  fetch() {
    logger.error("Invalid endpoint called");
    return new Response("Not Found", { status: 404 });
  },
});

logger.info(`Server listening at: ${server.url}`);
