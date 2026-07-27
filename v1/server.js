const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};
const server = http.createServer((req, res) => {
  const file = req.url === '/' ? '/index.html' : req.url;
  const p = path.join(__dirname, file);
  fs.readFile(p, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + file);
    } else {
      const ext = path.extname(p);
      res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
      res.end(data);
    }
  });
});
server.listen(8000, '0.0.0.0', () => {
  console.log('Server running on http://localhost:8000');
});
setInterval(() => {}, 1000000);
