# 使用官方Node.js运行时镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json
COPY package.json ./

# 安装依赖（如果有）
RUN npm install --production

# 复制应用代码
COPY proxy-server.js ./

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# 启动命令
CMD ["node", "proxy-server.js"]
