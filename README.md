# 简单代理服务器

一个轻量级的HTTP/HTTPS代理服务器，可部署在公网服务器上，实现请求转发和响应返回。

## 功能特性

- ✅ 支持HTTP和HTTPS目标地址
- ✅ 支持所有HTTP方法（GET, POST, PUT, DELETE, PATCH等）
- ✅ 自动处理CORS跨域问题
- ✅ 支持请求体和响应体转发
- ✅ 请求超时保护（30秒）
- ✅ 错误处理和日志记录

## 快速开始

### 本地运行

```bash
# 1. 克隆或下载项目

# 2. 安装依赖
npm install

# 3. 启动服务器
npm start
```

服务器将在 `http://localhost:3000` 启动

### 使用方式

#### 方式1：通过查询参数
```
http://localhost:3000/?target=https://api.example.com/data
```

#### 方式2：通过路径
```
http://localhost:3000/https://api.example.com/data
```

### 示例

```bash
# GET请求
curl "http://localhost:3000/?target=https://httpbin.org/get"

# POST请求
curl -X POST "http://localhost:3000/?target=https://httpbin.org/post" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'

# 带查询参数
curl "http://localhost:3000/?target=https://api.github.com/users/github"
```

## 部署指南

### 方式1：Docker部署

```bash
# 构建并运行
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

### 方式2：Railway部署

1. 将代码推送到GitHub仓库
2. 在 [Railway](https://railway.app) 创建新项目
3. 连接GitHub仓库并部署
4. Railway会自动使用 `railway.json` 配置

### 方式3：Render部署

1. 将代码推送到GitHub仓库
2. 在 [Render](https://render.com) 创建新的Web Service
3. 连接GitHub仓库
4. Render会自动使用 `render.yaml` 配置

### 方式4：VPS服务器部署

```bash
# 1. 上传文件到服务器
scp -r . user@your-server:/opt/proxy-server

# 2. SSH登录服务器
ssh user@your-server

# 3. 进入目录并安装依赖
cd /opt/proxy-server
npm install

# 4. 使用PM2守护进程运行
npm install -g pm2
pm2 start proxy-server.js --name proxy-server
pm2 save
pm2 startup

# 5. 配置Nginx反向代理（可选）
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 服务器监听端口 | `3000` |
| `ALLOWED_ORIGINS` | 允许的跨域来源，逗号分隔 | `*` |

## Nginx配置示例

```nginx
server {
    listen 80;
    server_name proxy.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 安全建议

1. **限制来源**：设置 `ALLOWED_ORIGINS` 只允许特定域名访问
2. **使用HTTPS**：生产环境务必使用HTTPS
3. **访问控制**：配合Nginx或防火墙限制访问
4. **速率限制**：建议添加请求频率限制

## 许可证

MIT
