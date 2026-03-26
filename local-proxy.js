/**
 * 本地代理转发服务
 * 将本机请求转发到Railway代理服务器
 * 使用方式：设置系统代理为 http://127.0.0.1:7890
 */

const http = require('http');
const https = require('https');
const url = require('url');

// 配置
const LOCAL_PORT = 7890;  // 本地代理端口
const REMOTE_PROXY = 'simple-proxy-server-production.up.railway.app';

// 创建本地代理服务器
const server = http.createServer((req, res) => {
  // 处理CONNECT请求（HTTPS代理）
  if (req.method === 'CONNECT') {
    const [host, port] = req.url.split(':');
    console.log(`[CONNECT] ${host}:${port || 443}`);
    
    // 对于CONNECT请求，直接转发到目标
    const targetSocket = require('net').connect(port || 443, host, () => {
      res.writeHead(200, { 'Connection': 'Established' });
      targetSocket.pipe(res);
      req.pipe(targetSocket);
    });
    
    targetSocket.on('error', (err) => {
      console.error('Target connection error:', err.message);
      res.writeHead(502);
      res.end();
    });
    return;
  }

  // 获取目标URL
  let targetUrl = req.url;
  
  // 如果是完整URL，提取目标
  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    // 转发到远程代理
    const encodedUrl = encodeURIComponent(targetUrl);
    const proxyUrl = `https://${REMOTE_PROXY}/?target=${encodedUrl}`;
    
    console.log(`[PROXY] ${req.method} ${targetUrl}`);
    
    const proxyReq = https.request(proxyUrl, {
      method: req.method,
      headers: req.headers
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err.message);
      if (!res.headersSent) {
        res.writeHead(502);
        res.end(JSON.stringify({ error: 'Proxy failed', message: err.message }));
      }
    });
    
    req.pipe(proxyReq);
  } else {
    // 直接请求（如健康检查）
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'local proxy running',
      remote: REMOTE_PROXY,
      usage: 'Set system proxy to http://127.0.0.1:' + LOCAL_PORT
    }));
  }
});

server.listen(LOCAL_PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 本地代理服务已启动');
  console.log('='.repeat(60));
  console.log(`📍 本地代理地址: http://127.0.0.1:${LOCAL_PORT}`);
  console.log(`🌐 远程代理: ${REMOTE_PROXY}`);
  console.log('='.repeat(60));
  console.log('\n使用方式:');
  console.log('  1. 设置系统代理为: http://127.0.0.1:' + LOCAL_PORT);
  console.log('  2. 或在浏览器中配置代理');
  console.log('  3. 或使用命令行: curl -x http://127.0.0.1:' + LOCAL_PORT + ' https://www.google.com');
  console.log('='.repeat(60));
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('\n正在关闭本地代理...');
  server.close(() => {
    console.log('本地代理已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n正在关闭本地代理...');
  server.close(() => {
    console.log('本地代理已关闭');
    process.exit(0);
  });
});
