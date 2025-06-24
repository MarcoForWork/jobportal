// proxy.js
const http = require('http');
const httpProxy = require('http-proxy');

// Tạo một proxy server
const proxy = httpProxy.createProxyServer({});

// Cổng mà proxy server sẽ lắng nghe
const proxyPort = 8081; // Cổng bạn muốn frontend gọi đến (giống cổng backend)

// Target backend Spring Boot của bạn
const backendTarget = 'http://localhost:8080'; // URL đầy đủ của backend

const server = http.createServer((req, res) => {
    // Chuyển hướng tất cả các request đến backend của bạn
    // Tùy chọn: Bạn có thể thêm logic để chỉ proxy các request /api/
    // if (req.url.startsWith('/api')) {
    //   proxy.web(req, res, { target: backendTarget + req.url });
    // } else {
    //   // Phục vụ các file tĩnh nếu không phải API (phức tạp hơn)
    //   // Hoặc trả về 404 nếu bạn chỉ muốn nó là một proxy API đơn giản
    //   res.writeHead(404, { 'Content-Type': 'text/plain' });
    //   res.end('Not Found or not proxied');
    // }
    console.log(`Proxying request: ${req.method} ${req.url} to ${backendTarget}`);
    proxy.web(req, res, { target: backendTarget + req.url });
});

server.listen(proxyPort, () => {
    console.log(`Proxy server listening on port ${proxyPort}`);
    console.log(`Forwarding requests to ${backendTarget}`);
    console.log(`Now, you can open your HTML file with Live Server (e.g., on port 5501)`);
    console.log(`and change your API calls in login.js to: http://localhost:${proxyPort}/jobportal/api/auth/login`);
    console.log(`(Make sure your backend is running on ${backendTarget})`);
});

// Xử lý lỗi proxy
proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error occurred.');
});