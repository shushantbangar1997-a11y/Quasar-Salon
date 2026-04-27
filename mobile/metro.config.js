const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const http = require('http');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@screens': path.resolve(__dirname, 'src/screens'),
  '@services': path.resolve(__dirname, 'src/services'),
  '@utils': path.resolve(__dirname, 'src/utils'),
  '@types': path.resolve(__dirname, 'src/types'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
};

const BACKEND_PORT = parseInt(process.env.BACKEND_PORT || '8080', 10);
const BACKEND_HOST = process.env.BACKEND_HOST || '127.0.0.1';

config.server = config.server || {};
const previousEnhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (metroMiddleware, metroServer) => {
  const wrapped = previousEnhanceMiddleware
    ? previousEnhanceMiddleware(metroMiddleware, metroServer)
    : metroMiddleware;

  return (req, res, next) => {
    if (!req.url || !req.url.startsWith('/api/')) {
      return wrapped(req, res, next);
    }

    const targetPath = req.url.slice(4) || '/';
    const headers = { ...req.headers };
    headers.host = `${BACKEND_HOST}:${BACKEND_PORT}`;

    const proxyReq = http.request(
      {
        host: BACKEND_HOST,
        port: BACKEND_PORT,
        method: req.method,
        path: targetPath,
        headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );

    proxyReq.on('error', (err) => {
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
      }
      res.end(JSON.stringify({ error: `Backend proxy error: ${err.message}` }));
    });

    req.pipe(proxyReq);
  };
};

module.exports = config;
