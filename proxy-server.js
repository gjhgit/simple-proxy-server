/**
 * 简单代理服务器
 * 功能：转发HTTP/HTTPS请求到目标服务器，并返回响应
 */

const http = require('http');
const https = require('https');
const url = require('url');

// 配置
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'];

// 创建代理服务器
const server = http.createServer((req, res) => {
  // 设置CORS头
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 解析目标URL
  // 支持两种方式：
  // 1. 通过查询参数：?target=https://example.com/api
  // 2. 通过路径：/https://example.com/api
  let targetUrl = req.url;
  
  // 尝试从查询参数获取目标URL
  const parsedUrl = url.parse(req.url, true);
  if (parsedUrl.query.target) {
    targetUrl = parsedUrl.query.target;
  } else {
    // 从路径中提取目标URL（去掉开头的/）
    targetUrl = req.url.substring(1);
    // 如果路径包含查询参数，需要重新组合
    if (parsedUrl.search) {
      const queryIndex = targetUrl.indexOf('?');
      if (queryIndex > 0) {
        targetUrl = targetUrl.substring(0, queryIndex);
      }
    }
  }

  // 验证目标URL
  if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Invalid target URL', 
      message: '目标URL必须以 http:// 或 https:// 开头',
      usage: {
        method1: '/?target=https://example.com/api',
        method2: '/https://example.com/api'
      }
    }));
    return;
  }

  console.log(`[${new Date().toISOString()}] ${req.method} ${targetUrl}`);

  // 解析目标URL
  const target = url.parse(targetUrl);
  const isHttps = target.protocol === 'https:';
  const httpModule = isHttps ? https : http;

  // 准备请求选项
  const options = {
    hostname: target.hostname,
    port: target.port || (isHttps ? 443 : 80),
    path: target.path,
    method: req.method,
    headers: {
      ...req.headers,
      host: target.hostname,
      // 移除不需要的头部
      'connection': 'close'
    }
  };

  // 删除可能导致问题的头部
  delete options.headers['proxy-connection'];
  delete options.headers['proxy-authorization'];

  // 创建到目标服务器的请求
  const proxyReq = httpModule.request(options, (proxyRes) => {
    // 设置响应状态码和头部
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    
    // 转发响应数据
    proxyRes.pipe(res);
  });

  // 处理错误
  proxyReq.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] 代理请求错误:`, error.message);
    
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Bad Gateway', 
        message: '无法连接到目标服务器',
        details: error.message 
      }));
    }
  });

  // 处理超时
  proxyReq.on('timeout', () => {
    console.error(`[${new Date().toISOString()}] 代理请求超时`);
    proxyReq.destroy();
    
    if (!res.headersSent) {
      res.writeHead(504, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Gateway Timeout', 
        message: '请求目标服务器超时' 
      }));
    }
  });

  // 设置超时时间（30秒）
  proxyReq.setTimeout(30000);

  // 转发请求数据
  req.pipe(proxyReq);
});

// 启动服务器
server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 代理服务器已启动');
  console.log('='.repeat(60));
  console.log(`📍 监听端口: ${PORT}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log('\n使用方式:');
  console.log(`  方式1: http://localhost:${PORT}/?target=https://api.example.com/data`);
  console.log(`  方式2: http://localhost:${PORT}/https://api.example.com/data`);
  console.log('='.repeat(60));
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('\n正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});
