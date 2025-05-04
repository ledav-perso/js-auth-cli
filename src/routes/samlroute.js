import express from 'express';
import logger from '../backend/logger.js';

const samlRouter = express.Router();

samlRouter.get('/', (req, res) => {
  logger.info('SAML GET /');
  res.render('saml', { title: 'Accueil' });
});

export default samlRouter;
