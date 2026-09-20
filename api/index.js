const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
mongoose.set('autoIndex', false);

const app = require('../backend/server');

const url = require('url');

module.exports = (req, res) => {
    try {
        const parsed = url.parse(req.url || '', true);
        if (parsed.query && parsed.query.path) {
            req.url = '/api/' + parsed.query.path;
        } else if (req.headers['x-matched-path']) {
            req.url = req.headers['x-matched-path'];
        }
    } catch (e) {}
    return app(req, res);
};
