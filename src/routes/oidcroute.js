import express from 'express';
import idc from 'express-openid-connect';
import util from 'util';

import logger from '../backend/logger.js';

const oidcRouter = express.Router();
const { requiresAuth } = idc;

oidcRouter.get('/', requiresAuth(), (req, res) => {
  logger.info('OIDC GET /');

  if (req.oidc.isAuthenticated()) {
    const user = {
      preferred_username: req.oidc.user.preferred_username,
      given_name: req.oidc.user.given_name,
      family_name: req.oidc.user.family_name,
      email: req.oidc.user.email,
      email_verified: req.oidc.user.email_verified,
    };

    logger.debug(req.oidc.user, 'user profile oidc');
    res.render('oidc', { user });
  }
  else {
    res.render('error', {
      error_tile: 'coucou',
      error_message: 'message coucou',
    });
  }
});

oidcRouter.get('/userinfo', requiresAuth(), async (req, res) => {
  logger.info('OIDC GET /userinfo');
  const userInfo = await req.oidc.fetchUserInfo();
  res.send(`Userinfo : ${util.inspect(userInfo)}`);
});

oidcRouter.get('/logout', (req, res) => {
  logger.info('OIDC GET /logout');

  const redirectUri = encodeURIComponent('http://localhost:3000');
  req.session.destroy((err) => {
    if (err) {
      logger.error(err, 'Erreur de suppression de session');
      return res.status(500).send('Erreur lors de la déconnexion');
    }
    res.redirect(
      `http://localhost:8080/realms/testsso/protocol/openid-connect/logout?redirect_uri=${redirectUri}`,
    );
  });
});

export default oidcRouter;
