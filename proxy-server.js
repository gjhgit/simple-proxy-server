/**
 * 简单代理服务器 - 支持相对链接
 * 功能：转发HTTP/HTTPS请求到目标服务器，并返回响应
 */

const http = require('http');
const https = require('https');
const url = require('url');

// 配置
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'];

// 会话存储，用于跟踪用户访问的原始目标
const sessions = new Map();

// 生成会话ID
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 从请求中获取或创建会话
function getSession(req, res) {
  // 从Cookie中获取会话ID
  const cookieHeader = req.headers.cookie || '';
  const sessionMatch = cookieHeader.match(/proxy_session=([^;]+)/);
  let sessionId = sessionMatch ? sessionMatch[1] : null;
  
  if (!sessionId || !sessions.has(sessionId)) {
    sessionId = generateSessionId();
    sessions.set(sessionId, {
      baseUrl: null,
      baseHost: null,
      createdAt: Date.now()
    });
    // 设置Cookie
    res.setHeader('Set-Cookie', `proxy_session=${sessionId}; Path=/; HttpOnly; SameSite=None; Secure`);
  }
  
  return { id: sessionId, data: sessions.get(sessionId) };
}

// 清理过期会话（1小时后过期）
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.createdAt > 3600000) {
      sessions.delete(id);
    }
  }
}, 600000); // 每10分钟清理一次

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

  // 健康检查端点
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Proxy server is running',
      timestamp: new Date().toISOString(),
      usage: {
        method1: '/?target=https://example.com/api',
        method2: '/https://example.com/api'
      }
    }));
    return;
  }

  // 获取会话
  const session = getSession(req, res);

  // 解析目标URL
  // 支持两种方式：
  // 1. 通过查询参数：?target=https://example.com/api
  // 2. 通过路径：/https://example.com/api
  // 3. 通过Referer自动补全（相对链接）
  let targetUrl = req.url;
  let isRelative = false;
  
  // 尝试从查询参数获取目标URL
  const parsedUrl = url.parse(req.url, true);
  if (parsedUrl.query.target) {
    targetUrl = parsedUrl.query.target;
    // 更新会话的基础URL
    try {
      const parsedTarget = url.parse(targetUrl);
      session.data.baseUrl = `${parsedTarget.protocol}//${parsedTarget.host}`;
      session.data.baseHost = parsedTarget.host;
    } catch (e) {
      console.error('解析目标URL失败:', e);
    }
  } else if (req.url.startsWith('/http://') || req.url.startsWith('/https://')) {
    // 从路径中提取目标URL（去掉开头的/）
    targetUrl = req.url.substring(1);
    // 更新会话的基础URL
    try {
      const parsedTarget = url.parse(targetUrl);
      session.data.baseUrl = `${parsedTarget.protocol}//${parsedTarget.host}`;
      session.data.baseHost = parsedTarget.host;
    } catch (e) {
      console.error('解析目标URL失败:', e);
    }
  } else {
    // 尝试从Referer获取基础URL
    const referer = req.headers.referer;
    if (referer) {
      try {
        const parsedReferer = url.parse(referer, true);
        if (parsedReferer.query.target) {
          const refererTarget = parsedReferer.query.target;
          const parsedRefererTarget = url.parse(refererTarget);
          session.data.baseUrl = `${parsedRefererTarget.protocol}//${parsedRefererTarget.host}`;
          session.data.baseHost = parsedRefererTarget.host;
          
          // 组合相对URL
          targetUrl = session.data.baseUrl + req.url;
          isRelative = true;
          console.log(`[${new Date().toISOString()}] 相对链接: ${req.url} -> ${targetUrl}`);
        }
      } catch (e) {
        console.error('解析Referer失败:', e);
      }
    }
    
    // 如果还是没有目标URL，检查会话中是否有基础URL
    if (!targetUrl.startsWith('http') && session.data.baseUrl) {
      targetUrl = session.data.baseUrl + req.url;
      isRelative = true;
      console.log(`[${new Date().toISOString()}] 会话相对链接: ${req.url} -> ${targetUrl}`);
    }
  }

  // 验证目标URL
  if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Invalid target URL', 
      message: '目标URL必须以 http:// 或 https:// 开头',
      received: targetUrl,
      url: req.url,
      session: session.data,
      usage: {
        method1: '/?target=https://example.com/api',
        method2: '/https://example.com/api'
      }
    }));
    return;
  }

  console.log(`[${new Date().toISOString()}] ${req.method} ${targetUrl}${isRelative ? ' (relative)' : ''}`);

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
  delete options.headers['cookie']; // 删除原始cookie，避免冲突

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
  console.log('🚀 代理服务器已启动 (支持相对链接)');
  console.log('='.repeat(60));
  console.log(`📍 监听端口: ${PORT}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log('\n使用方式:');
  console.log(`  方式1: http://localhost:${PORT}/?target=https://api.example.com/data`);
  console.log(`  方式2: http://localhost:${PORT}/https://api.example.com/data`);
  console.log(`  方式3: 相对链接自动补全 (基于Referer)`);
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
