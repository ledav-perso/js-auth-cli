# js-auth-cli
Node.JS OpenID &amp; SAML client for express framework

## References 

- https://github.com/panva/oauth4webapi/tree/main/docs
- https://auth0.com/docs/authenticate/login/oidc-conformant-authentication/oidc-adoption-auth-code-flow


Session Express (backend REDIS): cache de 10 mn
Access token provider (Keycloak) : cache de 5 mn

à expiration du cache Express : on redemande un access token
à expiration de l'access token : on utilise le refresh token


construire la stack de test :

dans le répertoire dev : 

$ docker compose up -d

pour arrêter :

$ docker compose down

(ne supprime pas la configuration Keycloak mais supprime le cache REDIS)
