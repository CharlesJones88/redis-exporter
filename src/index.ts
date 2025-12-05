import { RedisClient } from "bun";
import { logger } from "./logger";

const redis = new RedisClient(process.env.REDIS_HOST);

Bun.serve({
  port: 9121,
  routes: {
    "/metrics": async (request, server) => {
      const body = [
        "# HELP redis_queue_length Number of jobs in the queue",
        "# TYPE redis_queue_length guage",
      ];

      const keys = await redis.keys("*");

      for (const key of keys) {
        const type = await redis.type(key);

        if (type === "list") {
          const count = await redis.llen(key);
          body.push(`redis_queue_length{queue="${key}"} ${count}`);
        }
      }

      return new Response(body.join("\n"), {
        status: 200,
        headers: { "Content-Type": "text/plain; version=0.0.4" },
      });
    },
  },
  fetch() {
    logger.error("Invalid endpoint called");
    return new Response("Not Found", { status: 404 });
  },
});
