const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
mongoose.set('autoIndex', false);

const app = require('../backend/server');

module.exports = (req, res) => {
    return app(req, res);
};
