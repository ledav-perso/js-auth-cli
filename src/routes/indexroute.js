import express from 'express';
import logger from '../backend/logger.js';

const indexRouter = express.Router();

indexRouter.get('/', (req, res) => {
  logger.info('ROOT GET /');
  res.render('index', { title: 'Accueil' });
});

export default indexRouter;
