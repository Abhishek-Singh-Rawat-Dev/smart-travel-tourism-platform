// Root Server Launcher & Serverless Entrypoint
// Modular architecture: delegates to backend/server.js
const app = require('./backend/server');

module.exports = app;
