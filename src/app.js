require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const OpenIDConnectStrategy = require('passport-openidconnect').Strategy;

const app = express();

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// Passport setup
passport.use('oidc', new OpenIDConnectStrategy({
    issuer: process.env.OIDC_ISSUER,
    authorizationURL: `${process.env.OIDC_ISSUER}/protocol/openid-connect/auth`,
    tokenURL: `${process.env.OIDC_ISSUER}/protocol/openid-connect/token`,
    userInfoURL: `${process.env.OIDC_ISSUER}/protocol/openid-connect/userinfo`,
    clientID: process.env.OIDC_CLIENT_ID,
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    callbackURL: process.env.OIDC_CALLBACK_URL,
    scope: 'openid profile email'
}, function (issuer, sub, profile, accessToken, refreshToken, done) {
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => res.send('Accueil'));

app.get('/login', passport.authenticate('oidc'));

app.get('/login/callback',
    passport.authenticate('oidc', { failureRedirect: '/' }),
    (req, res) => res.redirect('/profile')
);

app.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/login');
    res.json(req.user);
});

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

// Démarrer le serveur
app.listen(3000, () => {
    console.log('Serveur lancé sur http://localhost:3000');
});
