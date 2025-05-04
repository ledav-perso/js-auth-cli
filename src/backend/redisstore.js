import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import { createClient } from 'redis';
import { auth } from 'express-openid-connect';
import { RedisStore } from "connect-redis";

async function init() {
    // 🔌 Redis client
    const redisClient = createClient({
        legacyMode: true,
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    await redisClient.connect();

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

    return new RedisStore({ client: redisClient });
}

export default { init };