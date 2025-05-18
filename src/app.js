import 'dotenv/config';
import process from 'process';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

import logger from './backend/logger.js';
import store from './backend/store.js';

import indexRouter from './routes/indexroute.js';
import oidcRouter from './routes/oidcroute.js';
import samlRouter from './routes/samlroute.js';

// initialisation des LOG
logger.level = process.env.LOG_LEVEL;
logger.debug('app initializing...');
//logger.debug(process.env, 'dotenv extracted variables');

// initialisation express
const app = express();

// Pug renderer
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));

// static files (CSS)
app.use(express.static(path.join(__dirname, '../public')));

// session store middleware
app.use(
  session({
    store: await store.initStore('oidc'),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true en production avec HTTPS
      httpOnly: true,
      maxAge: 10 * 60 * 1000, // 10 mn
    },
  }),
);

// public Route
app.get('/', indexRouter);
// private routes with OpenID connect authentification
app.use('/oidc', oidcRouter);
// private routes with SAML authentification
app.use('/saml', samlRouter);

// Start server
app.listen(3000, () => {
  logger.info(`app initialized : ${process.env.BASE_URL}`);
});
