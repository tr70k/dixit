const { createProxyMiddleware } = require('http-proxy-middleware');

// https://stackoverflow.com/a/61698382
module.exports = function(app) {
  const socketProxy= createProxyMiddleware('/api', {
    target: process.env.REACT_APP_SERVER_URL,
    changeOrigin: true,
    ws: true,
  });

  app.use(socketProxy);
};
