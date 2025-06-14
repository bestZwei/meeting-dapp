# 会议报名DApp实验环境搭建指南

## 1. 安装Node.js和npm
1. 下载并安装Node.js (推荐版本 16.x 或 18.x)
2. 验证安装：
```bash
node --version
npm --version
```

## 2. 安装Truffle框架
```bash
npm install -g truffle
```

## 3. 安装Ganache
- 下载Ganache GUI版本：https://trufflesuite.com/ganache/
- 或者安装命令行版本：
```bash
npm install -g ganache-cli
```

## 4. 项目依赖安装
在项目根目录执行：
```bash
npm init -y
npm install @truffle/hdwallet-provider
npm install web3
```

## 5. 验证环境
```bash
truffle version
```

## 常见问题解决
1. **Node.js版本兼容性问题**：使用nvm管理Node.js版本
2. **权限问题**：Windows下以管理员身份运行PowerShell
3. **网络连接问题**：配置npm淘宝镜像源
