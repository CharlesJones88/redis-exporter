import {
  ConsoleTransport,
  Levels,
  Logger,
  LokiTransport,
} from "@rabbit-company/logger";

const { APP_NAME = "redis-exporter", LEVEL = "INFO" } = process.env;
const lokiTransport = new LokiTransport({
  url: "http://logging-loki-n52lhr-c40b8a-160-223-185-218.traefik.me",
  labels: {
    app: APP_NAME,
  },
});
const consoleTransport = new ConsoleTransport();

export const logger = new Logger({
  level: Levels[LEVEL as keyof typeof Levels],
  transports: [consoleTransport, lokiTransport],
});
