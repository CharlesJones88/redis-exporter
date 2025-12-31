import { Levels, Logger, NDJsonTransport } from '@rabbit-company/logger';

const { LEVEL = 'INFO' } = process.env;

export const logger = new Logger({
  level: Levels[LEVEL as keyof typeof Levels],
  transports: [new NDJsonTransport()]
});
