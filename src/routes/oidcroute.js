import express from 'express';
import process from 'process';
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

oidcRouter.get('/logout', requiresAuth(), (req, res) => {
  logger.info('OIDC GET /logout');
  const idToken = req.oidc.idToken;
  const redirectUri = 'http://localhost:3000/';
  const issuer = process.env.OIDC_ISSUER;

  let logoutUrl = `${issuer}/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`;
  if (idToken) {
    logoutUrl += `&id_token_hint=${encodeURIComponent(idToken)}`;
  }

  req.session.destroy(() => {
    res.redirect(logoutUrl);
  });
});

export default oidcRouter;
