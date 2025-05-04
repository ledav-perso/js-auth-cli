import process from 'process';

// 🔐 Auth OIDC config
function getConfig() {
  return {
    issuerBaseURL: process.env.OIDC_ISSUER,
    baseURL: 'http://localhost:3000',
    clientID: process.env.OIDC_CLIENT_ID,
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    secret: process.env.SESSION_SECRET,
    authRequired: false,
    routes: {
      callback: '/oidc/callback',
    },
    authorizationParams: {
      response_type: 'code id_token',
      scope: 'openid profile email',
    },
    idpLogout: true,
    //backchannelLogout: true,
  };
}

export default { getConfig };
