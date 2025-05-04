import dotenv from 'dotenv';
import process from 'process';
import express from 'express';
import session from 'express-session';
import { auth } from 'express-openid-connect';
import path from 'path';
import { fileURLToPath } from 'url';

import logger from './backend/logger.js';
import redisStore from './backend/redisstore.js';
import oidc from './backend/oidc.js';

import indexRouter from './routes/indexroute.js';
import oidcRouter from './routes/oidcroute.js';
import samlRouter from './routes/samlroute.js';

dotenv.config();
logger.level = process.env.LOG_LEVEL;
logger.debug('app initializing...');

logger.debug(process.env, 'dotenv extracted variables');

const app = express();

// Pug renderer
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));

// static files (CSS)
app.use(express.static(path.join(__dirname, '../public')));

// session middleware
const store = await redisStore.init();

app.use(
  session({
    store: store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 jour
      secure: false, // true si HTTPS
      httpOnly: true,
    },
  }),
);

// OpenID connect middleware
app.use(auth(oidc.getConfig()));

// Route
app.get('/', indexRouter);
app.use('/oidc', oidcRouter);
app.use('/saml', samlRouter);

// Start server
app.listen(3000, () => {
  logger.info('app initialized : http://localhost:3000');
});
