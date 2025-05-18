import express from 'express';
import process from 'process';
import { URL } from 'url';
import * as oauth from 'oauth4webapi';

import logger from '../backend/logger.js';

const oidcRouter = express.Router();

// environment variables
const issuer = new URL(process.env.OIDC_ISSUER);
const algorithm = 'oidc';
const client_id = process.env.OIDC_CLIENT_ID;
const client_secret = process.env.OIDC_CLIENT_SECRET;
const code_challenge_method = 'S256';
const redirect_uri = process.env.OIDC_CALLBACK_LOGIN;

// authorization server
const as = await oauth
  .discoveryRequest(issuer, { algorithm })
  .then((response) => oauth.processDiscoveryResponse(issuer, response));

// client credentials
const client = { client_id };
const clientAuth = oauth.ClientSecretPost(client_secret);

// Middleware d'authentification
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/oidc/login');
}

oidcRouter.get('/', isAuthenticated, (req, res) => {
  logger.info('OIDC GET /');
  //logger.debug(req, 'cache session local');
  logger.debug(req.session.user, 'user profile oidc');

  res.render('oidc', {
    title: 'Profil OPenID Connect',
    user: req.session.user,
  });
});

oidcRouter.get('/login', async (req, res) => {
  logger.info('OIDC GET /login');

  /**
   * The following MUST be generated for every redirect to the authorization_endpoint. You must store
   * the code_verifier and nonce in the end-user session such that it can be recovered as the user
   * gets redirected from the authorization server back to your application.
   */
  const code_verifier = oauth.generateRandomCodeVerifier();
  const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier);

  // redirect user to as.authorization_endpoint
  const authorizationUrl = new URL(as.authorization_endpoint);
  authorizationUrl.searchParams.set('client_id', client.client_id);
  authorizationUrl.searchParams.set('redirect_uri', redirect_uri);
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set(
    'scope',
    'openid profile email offline_access',
  );
  authorizationUrl.searchParams.set('code_challenge', code_challenge);
  authorizationUrl.searchParams.set(
    'code_challenge_method',
    code_challenge_method,
  );

  // store session configuration
  req.session.oidc = { code_verifier };
  // now redirect the user to authorizationUrl.href
  res.redirect(authorizationUrl.href);
});

oidcRouter.get('/callback', async (req, res) => {
  logger.info('OIDC GET /callback');

  // Authorization Code Grant Request & Response
  const currentUrl = new URL(`${process.env.BASE_URL}${req.url}`);
  const params = oauth.validateAuthResponse(as, client, currentUrl);

  const response = await oauth.authorizationCodeGrantRequest(
    as,
    client,
    clientAuth,
    params,
    redirect_uri,
    req.session.oidc.code_verifier,
  );

  const result = await oauth.processAuthorizationCodeResponse(
    as,
    client,
    response,
    {
      //expectedNonce: nonce,
      requireIdToken: true,
    },
  );

  // token claims
  logger.debug(result, 'Access Token Response');
  const { access_token, refresh_token, expires_in } = result;
  const expires_at = new Date(expires_in);
  const claims = oauth.getValidatedIdTokenClaims(result);
  logger.debug(claims, 'ID Token Claims');
  const { sub } = claims;

  // user info
  const responseUserInfo = await oauth.userInfoRequest(
    as,
    client,
    access_token,
  );
  const resultUserInfo = await oauth.processUserInfoResponse(
    as,
    client,
    sub,
    responseUserInfo,
  );
  logger.debug(resultUserInfo, 'UserInfo Response');
  req.session.user = resultUserInfo;
  req.session.oidc.access_token = access_token;
  req.session.oidc.refresh_token = refresh_token;
  req.session.oidc.expires_at = expires_at;

  res.redirect('/oidc');
});

oidcRouter.get('/logout', isAuthenticated, async (req, res) => {
  logger.info('OIDC GET /logout');

  const responseRevocation = await oauth.revocationRequest(
    as,
    client,
    clientAuth,
    req.session.oidc.access_token,
  );

  const resultRevocation =
    await oauth.processRevocationResponse(responseRevocation);

  if (resultRevocation === undefined) {
    logger.debug('OIDC provider session revocated');
    req.session.destroy((err) => {
      if (err) {
        logger.error(err, 'Erreur de destruction de session:');
        return res.status(500).send('Erreur de logout');
      }

      res.clearCookie('connect.sid'); // ou le nom de ton cookie de session
      res.render('index');
    });
  }
  else {
    logger.debug(resultRevocation, 'error processing revocation');
    res.render('error', {
      error_title: 'error processing revocation',
      error_message: `error processing revocation for ${req.session.user.preferred_username}`,
    });
  }
});

export default oidcRouter;
