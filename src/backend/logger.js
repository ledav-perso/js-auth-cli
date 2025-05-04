import pino from 'pino';
import process from 'process';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['OIDC_CLIENT_SECRET', 'SESSION_SECRET'],
});

export default logger;
