const app = require('../backend/server');

module.exports = (req, res) => {
    // When Vercel rewrites /api/(.*) → /api/index.js the original URL
    // is preserved on `req.url`.  Express routes are mounted at /api/*
    // so we just need to make sure req.url keeps the /api prefix intact.
    // Nothing to strip or prepend – the URL already looks like /api/auth/login.
    return app(req, res);
};
