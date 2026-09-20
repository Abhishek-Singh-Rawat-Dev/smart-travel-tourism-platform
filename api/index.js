const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
mongoose.set('autoIndex', false);

const app = require('../backend/server');

module.exports = (req, res) => {
    // Restore original route URL when rewritten by Vercel
    const originalUrl = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'];
    if (originalUrl) {
        req.url = originalUrl;
    } else if (req.query && req.query.path) {
        req.url = '/api/' + req.query.path;
    }
    return app(req, res);
};
