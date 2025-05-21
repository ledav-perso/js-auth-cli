import process from 'process';
import logger from './logger.js';

const declaredGlobals = [
  'OIDC_ISSUER',
  'OIDC_CLIENT_ID',
  'OIDC_CLIENT_SECRET',
  'OIDC_CALLBACK_LOGIN',
  'OIDC_CALLBACK_LOGOUT',
  'SESSION_SECRET',
  'OIDC_SECRET',
  'REDIS_URL',
  'LOG_LEVEL',
  'NODE_ENV',
  'BASE_URL',
  'NODE_TLS_REJECT_UNAUTHORIZED',
];

function get(global) {
  if (declaredGlobals.includes(global)) {
    if (global in process.env) {
      return process.env[global];
    }
    else {
      logger.error(`environment variable ${global} is undefined`);
      return undefined;
    }
  }
  else {
    logger.error(`process.env.${global} claimed but not authorized`);
  }
}

export default { get };
