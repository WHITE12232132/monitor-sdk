const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const ROOT = path.resolve(__dirname, '..')
const MIME = {
    '.html': 'text/html',
    '.js': 'application/javascript',
};

const server = http.createServer((req, res) => {
    // 1. 接收上报
    if (req.method === 'POST' && req.url === '/report') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const now = new Date().toLocaleTimeString();
            console.log(`\n📨 [${now}] 收到上报：`);
            console.log(JSON.stringify(JSON.parse(body), null, 2));
            res.writeHead(200);
            res.end('ok');
        });
        return;
    }
    let filePath = req.url === '/' ? '/test/index.html' : req.url;
    const fullPath = path.join(ROOT, filePath);
    const ext = path.extname(fullPath);
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
        res.end(data);

    })
});

server.listen(PORT, () => {
    console.log(`服务器启动：http://localhost:${PORT}`);
});
