import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import { createClient } from 'redis';
import { auth } from 'express-openid-connect';
import { RedisStore } from "connect-redis";
import path from 'path';
import { fileURLToPath } from 'url';

import oidcRouter from './routes/oidc.js';

const app = express();

// Pug renderer
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));

// Public files (CSS)
app.use(express.static(path.join(__dirname, '../public')));

// Route
app.get('/', (req, res) => {
    res.render('index', { title: 'Accueil' });
    //res.send(req.oidc.isAuthenticated()
    //    ? `<h2>Connecté</h2><a href="/profile">Profil</a><br><a href="/logout">Logout</a>`
    //    : `<h2>Non connecté</h2><a href="/login">Login</a>`);
});

app.use('/oidc', oidcRouter);

// Route GET /profile
app.get('/profile', (req, res) => {
    res.send('Page de profil');
});

// Route POST /logout
app.post('/logout', (req, res) => {
    res.send('Déconnecté avec succès');
});

// 🔌 Redis client
const redisClient = createClient({
    legacyMode: true,
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});
await redisClient.connect();

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 jour
        secure: false, // true si HTTPS
        httpOnly: true,
    }
}));

// 🔐 Auth OIDC config
const config = {
    authRequired: false,
    auth0Logout: false,
    secret: process.env.SESSION_SECRET,
    baseURL: 'http://localhost:3000',
    clientID: process.env.OIDC_CLIENT_ID,
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    issuerBaseURL: process.env.OIDC_ISSUER,
    authorizationParams: {
        response_type: 'code',
        scope: 'openid profile email'
    }
};

app.use(auth(config));

app.get('/profile', (req, res) => {
    if (!req.oidc.isAuthenticated()) return res.redirect('/login');
    res.json(req.oidc.user);
});

app.get('/logout', (req, res) => {
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

// Start server
app.listen(3000, () => {
    console.log('🚀 Serveur Express + Redis sur http://localhost:3000');
});
