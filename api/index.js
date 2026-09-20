const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

const app = require('../backend/server');

module.exports = (req, res) => {
    return app(req, res);
};
