const app = require('../backend/server');

module.exports = (req, res) => {
    // Normalise request URL so Express routes mounted at /api match seamlessly
    if (!req.url.startsWith('/api')) {
        req.url = '/api' + req.url;
    }
    return app(req, res);
};
