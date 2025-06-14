# 会议报名 DApp 部署到 Vercel 完整指导

## 概述

本指导将帮助您将会议报名DApp项目完整部署到线上环境，包括智能合约部署到以太坊测试网和前端应用部署到Vercel平台。

## 前置准备

### 必需工具和账户
- ✅ GitHub账户
- ✅ Vercel账户 (可用GitHub登录)
- ✅ MetaMask钱包
- ✅ Infura账户 (用于连接以太坊网络)
- ✅ Node.js 16+ 环境
- ✅ Git 工具

### 获取测试ETH
1. 访问 [Sepolia Faucet](https://sepoliafaucet.com/)
2. 输入您的钱包地址获取测试ETH (需要0.1-0.5 ETH用于部署)

## 第一步：项目准备

### 1.1 克隆项目
```bash
# 如果还没有本地项目
git clone <your-repository-url>
cd meeting-dapp

# 安装依赖
npm install
```

### 1.2 创建环境变量文件
```bash
# 创建环境变量文件
cp .env.example .env.local
```

编辑 `.env.local` 文件：
```bash
# Infura项目ID (从infura.io获取)
INFURA_PROJECT_ID=your-infura-project-id-here

# 钱包助记词 (仅用于测试，切勿使用包含真实资金的钱包)
MNEMONIC=your twelve word mnemonic phrase here

# Etherscan API密钥 (用于合约验证，可选)
ETHERSCAN_API_KEY=your-etherscan-api-key

# 网络ID (Sepolia测试网)
NEXT_PUBLIC_NETWORK_ID=11155111

# 合约地址 (部署后会自动填入)
NEXT_PUBLIC_CONTRACT_ADDRESS=
```

⚠️ **安全提醒**: 
- 只使用测试钱包的助记词
- 不要将 `.env.local` 提交到Git仓库
- 生产环境使用环境变量管理

## 第二步：智能合约部署

### 2.1 编译合约
```bash
# 编译智能合约
truffle compile

# 更新前端ABI文件
node scripts/update-abi.js
```

### 2.2 部署到Sepolia测试网

#### 方法1: 使用Truffle (推荐)
```bash
# 部署到Sepolia测试网
truffle migrate --network sepolia
```

#### 方法2: 使用自定义脚本
```bash
# 使用部署脚本
node scripts/deploy-sepolia.js
```

成功输出示例：
```
✅ 合约部署成功!
📍 合约地址: 0x1234567890123456789012345678901234567890
🔍 在Etherscan查看: https://sepolia.etherscan.io/address/0x1234567890123456789012345678901234567890
💾 合约地址已保存到 .env.local
```

### 2.3 验证合约 (可选但推荐)
```bash
# 使用Truffle验证合约
truffle run verify MeetingRegistration --network sepolia
```

## 第三步：本地测试

### 3.1 本地运行测试
```bash
# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 测试功能：

1. **连接钱包测试**
   - 确保MetaMask连接到Sepolia测试网
   - 点击"连接MetaMask"按钮
   
2. **创建会议测试**
   - 填写会议信息并提交
   - 在MetaMask中确认交易

3. **报名功能测试**
   - 切换到其他账户进行报名测试

### 3.2 构建测试
```bash
# 构建生产版本
npm run build

# 本地预览构建结果
npm run start
```

## 第四步：准备GitHub仓库

### 4.1 初始化Git仓库 (如果还没有)
```bash
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://github.com/your-username/meeting-dapp.git
```

### 4.2 推送代码到GitHub
```bash
# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: Meeting DApp with smart contract"

# 推送到GitHub
git push -u origin main
```

⚠️ **注意**: 确保 `.env.local` 在 `.gitignore` 中，不要提交敏感信息。

## 第五步：Vercel部署

### 5.1 方法1: 通过Vercel网站 (推荐)

1. **访问Vercel**
   - 打开 [vercel.com](https://vercel.com)
   - 使用GitHub账户登录

2. **导入项目**
   - 点击 "New Project"
   - 选择您的GitHub仓库 `meeting-dapp`
   - 点击 "Import"

3. **配置项目**
   - **Project Name**: meeting-dapp (或您喜欢的名称)
   - **Framework Preset**: Next.js (应该自动检测)
   - **Root Directory**: ./ (保持默认)

4. **配置环境变量**
   点击 "Environment Variables" 添加以下变量：
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS = 0x你的合约地址
   NEXT_PUBLIC_NETWORK_ID = 11155111
   ```

5. **部署**
   - 点击 "Deploy" 按钮
   - 等待部署完成 (通常需要1-3分钟)

### 5.2 方法2: 通过Vercel CLI

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署项目
vercel

# 部署到生产环境
vercel --prod
```

### 5.3 配置自定义域名 (可选)

如果您有自定义域名：

1. 在Vercel项目设置中点击 "Domains"
2. 添加您的域名
3. 按照指示配置DNS记录

## 第六步：测试部署

### 6.1 访问部署的应用

部署完成后，您将获得类似以下的URL：
```
https://meeting-dapp-xyz.vercel.app
```

### 6.2 功能完整测试

1. **网络配置测试**
   - 确保MetaMask连接到Sepolia测试网
   - 网络配置信息：
     ```
     网络名称: Sepolia Test Network
     RPC URL: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
     链ID: 11155111
     货币符号: ETH
     区块浏览器: https://sepolia.etherscan.io
     ```

2. **钱包连接测试**
   - 点击"连接MetaMask"
   - 确认连接成功并显示账户地址

3. **创建会议测试**
   - 填写完整的会议信息
   - 确认交易并等待区块确认

4. **报名功能测试**
   - 使用不同账户进行报名
   - 测试付费和免费会议

5. **委托功能测试**
   - 授权委托权限
   - 测试委托报名功能

## 第七步：持续集成设置

### 7.1 自动部署配置

Vercel会自动配置GitHub集成：
- **自动部署**: 推送到main分支自动部署
- **预览部署**: Pull Request自动创建预览
- **回滚**: 可以回滚到任何历史版本

### 7.2 高级配置 (可选)

创建 `vercel.json` 配置文件：
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_CONTRACT_ADDRESS": "@contract-address",
    "NEXT_PUBLIC_NETWORK_ID": "11155111"
  }
}
```

## 第八步：监控和维护

### 8.1 应用监控

1. **Vercel Analytics**
   - 在项目设置中启用Analytics
   - 监控访问量和性能

2. **区块链监控**
   - 在Etherscan上添加合约到观察列表
   - 监控合约交互和事件

### 8.2 日常维护

1. **代码更新**
   ```bash
   # 更新代码
   git add .
   git commit -m "Update: 功能改进"
   git push origin main
   # Vercel自动部署新版本
   ```

2. **环境变量更新**
   - 在Vercel项目设置中更新环境变量
   - 重新部署以应用更改

## 故障排除

### 常见问题及解决方案

#### 1. 合约部署失败
**问题**: `Error: insufficient funds`
**解决**: 
- 检查账户ETH余额
- 降低Gas价格或增加余额

#### 2. Vercel构建失败
**问题**: `Module not found` 错误
**解决**: 
```bash
# 检查依赖
npm install
# 确保package.json正确
```

#### 3. 前端无法连接合约
**问题**: 合约调用失败
**解决**: 
- 检查环境变量 `NEXT_PUBLIC_CONTRACT_ADDRESS`
- 确认合约地址正确
- 验证网络配置

#### 4. MetaMask连接问题
**问题**: 无法连接钱包
**解决**: 
- 检查网络配置是否正确
- 重新连接MetaMask
- 清除浏览器缓存

### 调试技巧

1. **查看浏览器控制台**
   ```javascript
   // 在浏览器控制台检查
   console.log(window.ethereum);
   console.log(window.web3);
   ```

2. **检查网络状态**
   - 访问 [Sepolia Etherscan](https://sepolia.etherscan.io)
   - 确认交易状态

3. **Vercel日志**
   - 在Vercel项目面板查看构建和运行日志
   - 检查错误信息

## 成本估算

### 开发成本
- **域名**: $10-15/年 (可选)
- **Vercel**: 免费版本足够个人项目
- **Infura**: 免费版本足够测试使用
- **测试ETH**: 免费从水龙头获取

### 运行成本
- **合约部署**: ~0.01-0.05 ETH (测试网免费)
- **交易Gas费**: 根据网络拥堵情况变化
- **Vercel托管**: 免费版本包含足够配额

## 安全检查清单

部署前确保完成以下安全检查：

- [ ] 测试合约已通过所有测试用例
- [ ] 私钥和助记词安全存储
- [ ] 环境变量正确配置
- [ ] `.env.local` 未提交到Git
- [ ] 合约在Etherscan上已验证
- [ ] 前端错误处理完善
- [ ] 用户输入验证完整
- [ ] HTTPS强制启用

## 部署完成检查

部署完成后的最终检查：

- [ ] 应用可以正常访问
- [ ] MetaMask连接正常
- [ ] 创建会议功能正常
- [ ] 报名功能正常
- [ ] 委托功能正常
- [ ] 退款功能正常
- [ ] 移动端适配正常
- [ ] 错误处理正常

## 总结

恭喜！您已经成功完成了会议报名DApp的完整部署。现在您的应用已经：

1. ✅ 智能合约部署到Sepolia测试网
2. ✅ 前端应用部署到Vercel
3. ✅ 支持完整的Web3功能
4. ✅ 具备生产环境的稳定性

您可以将部署的URL分享给其他人体验您的DApp！

## 下一步改进

考虑以下改进方向：
- 添加会议评价系统
- 集成ENS域名支持
- 添加多语言支持
- 开发移动端App
- 集成Layer 2解决方案

---

**部署指导更新时间**: 2025年6月14日  
**适用版本**: Next.js 14, Vercel  
**测试网络**: Sepolia Testnet
