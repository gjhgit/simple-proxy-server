# 代理服务器使用指南

## 🎉 部署状态

| 项目 | 状态 | 链接 |
|------|------|------|
| GitHub仓库 | ✅ 已部署 | https://github.com/gjhgit/simple-proxy-server |
| Railway服务 | ✅ 运行中 | https://railway.com/project/57b7c85d-1b32-45a2-a177-061c373a2bd7 |

## 🌐 访问地址

你的代理服务器已部署到Railway，域名如下：

```
https://simple-proxy-server-production.up.railway.app
```

> 注意：如果上述域名无法访问，请在Railway Dashboard的 Settings → Domains 中查看实际分配的域名。

## 📖 使用方式

### 1. 健康检查

测试服务是否正常运行：

```bash
curl https://simple-proxy-server-production.up.railway.app/
```

返回示例：
```json
{
  "status": "ok",
  "message": "Proxy server is running",
  "timestamp": "2026-03-26T12:00:00.000Z",
  "usage": {
    "method1": "/?target=https://example.com/api",
    "method2": "/https://example.com/api"
  }
}
```

### 2. 代理请求

#### 方式1：通过查询参数

```bash
curl "https://simple-proxy-server-production.up.railway.app/?target=https://api.github.com/users/github"
```

#### 方式2：通过路径

```bash
curl "https://simple-proxy-server-production.up.railway.app/https://api.github.com/users/github"
```

### 3. POST请求示例

```bash
curl -X POST "https://simple-proxy-server-production.up.railway.app/?target=https://httpbin.org/post" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

### 4. 在网页中使用

```javascript
// 使用Fetch API
fetch('https://simple-proxy-server-production.up.railway.app/?target=https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data));
```

## 🔧 支持的HTTP方法

- ✅ GET
- ✅ POST
- ✅ PUT
- ✅ DELETE
- ✅ PATCH
- ✅ OPTIONS

## ⚠️ 注意事项

1. **目标URL必须以 `http://` 或 `https://` 开头**
2. **请求超时时间为30秒**
3. **支持CORS跨域请求**

## 🐛 故障排查

### 服务无法访问？

1. 检查Railway Dashboard中的服务状态
2. 查看部署日志是否有错误
3. 确认域名是否正确

### 代理请求失败？

1. 确认目标URL格式正确
2. 检查目标服务器是否可访问
3. 查看响应中的错误信息

## 📞 获取帮助

- **GitHub Issues**: https://github.com/gjhgit/simple-proxy-server/issues
- **Railway文档**: https://docs.railway.app

---

**部署时间**: 2026-03-26  
**版本**: 1.0.0
