# 会议报名 DApp 部署到 Vercel 指导

## 概述

本指导将帮助您将会议报名 DApp 部署到 Vercel 平台，实现前端的在线访问。部署包括两个主要步骤：智能合约部署到以太坊测试网，以及前端应用部署到 Vercel。

## 前置条件

在开始部署之前，请确保您已经：
- ✅ 拥有一个 GitHub 账户
- ✅ 安装了 Node.js 16+ 和 npm
- ✅ 安装了 MetaMask 钱包
- ✅ 获得了测试网 ETH（用于部署合约）
- ✅ 注册了 Infura 账户（用于连接以太坊网络）

## 第一步：准备工作

### 1.1 创建必要的账户

#### Infura 账户
1. 访问 [Infura.io](https://infura.io/)
2. 注册并创建新项目
3. 获取项目 ID（Project ID）

#### Etherscan 账户（可选）
1. 访问 [Etherscan.io](https://etherscan.io/)
2. 注册并创建 API Key（用于合约验证）

### 1.2 获取测试网 ETH

#### Sepolia 测试网 ETH
1. 访问 [Sepolia Faucet](https://sepoliafaucet.com/)
2. 输入您的钱包地址
3. 获取测试 ETH（通常需要 0.1-0.5 ETH 用于部署）

## 第二步：项目配置

### 2.1 环境变量配置

创建 `.env.local` 文件：

```bash
# 复制模板文件
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入以下信息：

```bash
# Infura 项目ID
INFURA_PROJECT_ID=your-infura-project-id

# 钱包助记词（12个单词）
MNEMONIC=your twelve word mnemonic phrase here

# Etherscan API Key（可选，用于合约验证）
ETHERSCAN_API_KEY=your-etherscan-api-key

# 网络ID（Sepolia测试网）
NEXT_PUBLIC_NETWORK_ID=11155111
```

⚠️ **安全提示**: 
- 永远不要将包含真实资金的助记词用于测试
- 不要将 `.env.local` 文件提交到 Git 仓库
- 建议为测试创建新的钱包地址

### 2.2 安装依赖

```bash
# 安装项目依赖
npm install

# 全局安装 Vercel CLI（可选）
npm install -g vercel
```

## 第三步：智能合约部署

### 3.1 编译合约

```bash
# 编译智能合约
npm run compile
```

成功编译后，您应该看到类似输出：
```
✅ Compiling your contracts...
✅ Compilation successful
```

### 3.2 更新合约 ABI

```bash
# 将编译后的合约ABI复制到前端目录
node scripts/update-abi.js
```

### 3.3 部署合约到测试网

#### 方法1：使用 Truffle（推荐）

```bash
# 部署到 Sepolia 测试网
npm run migrate -- --network sepolia
```

#### 方法2：使用自定义脚本

```bash
# 使用自定义部署脚本
node scripts/deploy-sepolia.js
```

成功部署后，您将看到：
```
✅ 合约部署成功!
📍 合约地址: 0x1234567890123456789012345678901234567890
🔍 在Etherscan查看: https://sepolia.etherscan.io/address/0x1234567890123456789012345678901234567890
💾 合约地址已保存到 .env.local
```

### 3.4 验证合约（可选但推荐）

如果您有 Etherscan API Key，可以验证合约：

```bash
# 使用 Truffle 验证合约
truffle run verify MeetingRegistration --network sepolia
```

## 第四步：前端部署到 Vercel

### 4.1 准备 Vercel 部署

#### 检查配置文件

确保 `next.config.js` 包含正确的导出配置：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

#### 本地测试构建

```bash
# 构建应用
npm run build

# 本地测试（可选）
npm run start
```

### 4.2 部署到 Vercel

#### 方法1：通过 Vercel CLI

```bash
# 登录 Vercel
vercel login

# 部署项目
vercel

# 生产环境部署
vercel --prod
```

#### 方法2：通过 GitHub 集成（推荐）

1. **将项目推送到 GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **连接 Vercel 和 GitHub**
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "New Project"
   - 选择您的 GitHub 仓库
   - 选择 "meeting-dapp" 项目

3. **配置环境变量**
   在 Vercel 项目设置中添加环境变量：
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`: 您的合约地址
   - `NEXT_PUBLIC_NETWORK_ID`: 11155111

4. **部署**
   - 点击 "Deploy" 按钮
   - 等待部署完成

### 4.3 配置自定义域名（可选）

如果您有自定义域名：

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加您的域名
3. 按照指示配置 DNS 记录

## 第五步：测试部署

### 5.1 访问应用

部署完成后，您将获得一个 Vercel URL，例如：
`https://meeting-dapp-xyz.vercel.app`

### 5.2 功能测试

1. **连接钱包测试**
   - 确保 MetaMask 连接到 Sepolia 测试网
   - 点击"连接 MetaMask"按钮
   - 确认连接成功

2. **创建会议测试**
   - 填写会议信息
   - 提交表单
   - 确认交易在 MetaMask 中

3. **报名功能测试**
   - 使用另一个账户报名会议
   - 确认支付和交易

### 5.3 网络配置

确保 MetaMask 配置了正确的 Sepolia 网络：

```
网络名称: Sepolia Test Network
RPC URL: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
链ID: 11155111
货币符号: ETH
区块浏览器: https://sepolia.etherscan.io
```

## 第六步：持续集成

### 6.1 自动部署

配置 GitHub Actions 实现自动部署：

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build project
        run: npm run build
        
      - name: Deploy to Vercel
        uses: vercel/action@v24
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 6.2 环境变量管理

在 Vercel 中设置环境变量：

1. 访问项目设置
2. 点击 "Environment Variables"
3. 添加必要的变量：
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_NETWORK_ID`

## 第七步：监控和维护

### 7.1 监控合约

1. **Etherscan 监控**
   - 添加合约地址到 Etherscan 观察列表
   - 监控交易和事件

2. **应用监控**
   - 使用 Vercel Analytics
   - 监控应用性能和错误

### 7.2 更新和维护

1. **合约更新**
   - 如需更新合约，需要重新部署
   - 更新前端的合约地址

2. **前端更新**
   - 推送代码到 GitHub
   - Vercel 自动部署新版本

## 故障排除

### 常见问题

#### 1. 合约部署失败
- **原因**: Gas 费用不足或网络拥堵
- **解决**: 增加 Gas 限制，或等待网络不忙时重试

#### 2. Vercel 构建失败
- **原因**: 依赖问题或配置错误
- **解决**: 检查 `package.json` 和 `next.config.js`

#### 3. 前端无法连接合约
- **原因**: 合约地址错误或网络不匹配
- **解决**: 检查环境变量和网络配置

#### 4. MetaMask 连接失败
- **原因**: 网络配置错误
- **解决**: 确保 MetaMask 连接到正确的测试网

### 调试步骤

1. **检查浏览器控制台**
   - 查看错误信息
   - 确认网络请求状态

2. **验证合约状态**
   - 在 Etherscan 上检查合约
   - 确认交易状态

3. **测试网络连接**
   - 确认 Infura 连接正常
   - 测试 RPC 端点

## 安全建议

### 生产环境安全

1. **密钥管理**
   - 使用硬件钱包部署生产合约
   - 永远不要在代码中硬编码私钥

2. **合约安全**
   - 进行完整的安全审计
   - 使用多重签名钱包

3. **前端安全**
   - 验证所有用户输入
   - 实施适当的错误处理

### 用户安全教育

1. **钱包安全**
   - 教育用户保护私钥
   - 警告钓鱼网站

2. **交易确认**
   - 引导用户仔细确认交易
   - 提供清晰的费用说明

## 总结

通过本指导，您应该能够成功将会议报名 DApp 部署到 Vercel。部署完成后，您的应用将可以通过互联网访问，用户可以通过 Web3 钱包与智能合约交互。

### 部署检查清单

- [ ] 获得 Infura Project ID
- [ ] 配置环境变量
- [ ] 编译智能合约
- [ ] 部署合约到测试网
- [ ] 更新前端合约地址
- [ ] 测试本地构建
- [ ] 部署到 Vercel
- [ ] 测试在线功能
- [ ] 配置监控

如有问题，请参考项目的 README.md 文件或提交 Issue。
