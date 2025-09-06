'use strict';
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 7000;

// Return session info read from oauth2-proxy headers
app.get('/session', (req, res) => {
  const user = req.header('x-auth-request-user') || null;
  const email = req.header('x-auth-request-email') || null;
  const groups = req.header('x-auth-request-groups') || null;
  const raw = req.header('x-auth-request-headers') || null;
  if (!user) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true, user, email, groups, raw });
});

// Proxy everything else to the internal welcome frontend dev server
app.use('/', createProxyMiddleware({
  target: 'http://welcome-frontend:9000',
  changeOrigin: true,
  ws: true,
}));

app.listen(PORT, () => console.log(`session-proxy listening on ${PORT}`));
