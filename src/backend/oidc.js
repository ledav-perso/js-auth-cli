import process from 'process';

// 🔐 session store redis based config
function getConfig() {
  return {
    issuerBaseURL: process.env.OIDC_ISSUER,
    baseURL: 'http://localhost:3000',
    clientID: process.env.OIDC_CLIENT_ID,
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    authRequired: false,
    routes: {
      callback: '/oidc/callback',
      postLogoutRedirect: '/oidc/logout',
    },
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
    },
    secret: process.env.OIDC_SECRET,
    idpLogout: true,
  };
}

export default { getConfig };
