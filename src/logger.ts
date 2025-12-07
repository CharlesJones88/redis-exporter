import { Levels, Logger } from '@rabbit-company/logger';

const { LEVEL = 'INFO' } = process.env;

export const logger = new Logger({
  level: Levels[LEVEL as keyof typeof Levels],
});
