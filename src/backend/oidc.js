import globals from './globals.js';
import { URL } from 'url';
import * as oauth from 'oauth4webapi';

import logger from './logger.js';

const issuer = globals.get('process.env.OIDC_ISSUER');
const algorithm = 'oidc';
const client_id = globals.get('OIDC_CLIENT_ID');
const client_secret = globals.get('OIDC_CLIENT_SECRET');
const code_challenge_method = 'S256';
const redirect_uri = globals.get('OIDC_CALLBACK_LOGIN');

async function getAuthURL(store) {
  logger.info('OIDC / getAuthURL');

  const conf = {};

  conf.as = await oauth
    .discoveryRequest(issuer, { algorithm })
    .then((response) => oauth.processDiscoveryResponse(issuer, response));

  const client = oauth.Client({ client_id });
  conf.clientAuth = oauth.ClientSecretPost(client_secret);

  /**
   * The following MUST be generated for every redirect to the authorization_endpoint. You must store
   * the code_verifier and nonce in the end-user session such that it can be recovered as the user
   * gets redirected from the authorization server back to your application.
   */
  const code_verifier = oauth.generateRandomCodeVerifier();
  const code_challenge = await oauth.calculatePKCECodeChallenge(code_verifier);

  // redirect user to as.authorization_endpoint
  const authorizationUrl = new URL(conf.as.authorization_endpoint);
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
  store.set('conf', conf);
  // now redirect the user to authorizationUrl.href
  return authorizationUrl.href;
}

async function getSession(conf, currentUrl) {
  logger.info('OIDC / getSession');

  // one eternity later, the user lands back on the redirect_uri
  // Authorization Code Grant Request & Response
  const params = oauth.validateAuthResponse(conf.as, conf.client, currentUrl);

  const responseCodeGrant = await oauth.authorizationCodeGrantRequest(
    conf.as,
    conf.client,
    conf.clientAuth,
    params,
    redirect_uri,
    conf.code_verifier,
  );

  const resultCode = await oauth.processAuthorizationCodeResponse(
    conf.as,
    conf.client,
    responseCodeGrant,
    {
      requireIdToken: true,
    },
  );

  logger.debug(resultCode, 'Access Token Response');
  const { access_token } = result;
  const claims = oauth.getValidatedIdTokenClaims(resultCode);
  logger.debug(claims, 'ID Token Claims');
  const { sub } = claims;

  // UserInfo Request
  const response = await oauth.userInfoRequest(
    conf.as,
    conf.client,
    access_token,
  );

  const result = await oauth.processUserInfoResponse(
    conf.as,
    conf.client,
    sub,
    response,
  );
  logger.debug(result, 'UserInfo Response');
}

export default { getAuthURL, getSession };
