# 会议报名 DApp 项目

## 项目概述

本项目是一个基于以太坊区块链的去中心化会议报名系统（DApp），实现了完整的会议创建、报名、委托报名等功能。该项目使用 Solidity 编写智能合约，React + Next.js 构建前端界面，Web3.js 实现区块链交互。

## 功能特性

### 智能合约功能
- ✅ **会议创建**: 用户可以创建会议，设置标题、描述、时间、人数限制和报名费
- ✅ **会议报名**: 用户可以报名参加会议，支付相应的报名费
- ✅ **委托报名**: 用户可以授权他人代为报名会议
- ✅ **报名取消**: 在会议开始前可以取消报名并获得退款
- ✅ **会议取消**: 会议组织者可以取消会议，自动退款给所有参与者
- ✅ **事件日志**: 完整的事件记录，便于前端监听和历史查询
- ✅ **安全防护**: 使用 OpenZeppelin 合约，防重入攻击和权限控制

### 前端界面功能
- ✅ **钱包连接**: 支持 MetaMask 等 Web3 钱包连接
- ✅ **会议列表**: 展示所有可用会议和用户参与的会议
- ✅ **会议创建**: 直观的会议创建表单
- ✅ **实时状态**: 实时显示会议状态、参与人数等信息
- ✅ **响应式设计**: 支持移动端和桌面端访问
- ✅ **错误处理**: 完善的错误提示和处理机制

## 技术栈

### 区块链层
- **Solidity 0.8.19**: 智能合约开发语言
- **OpenZeppelin**: 安全的智能合约库
- **Truffle**: 智能合约开发框架
- **Web3.js**: 以太坊 JavaScript API

### 前端层
- **React 18**: 用户界面库
- **Next.js 14**: React 全栈框架
- **Bootstrap 5**: UI 组件库
- **React Bootstrap**: Bootstrap 的 React 组件

### 部署和工具
- **Vercel**: 前端部署平台
- **Infura**: 以太坊节点服务
- **MetaMask**: Web3 钱包

## 项目结构

```
meeting-dapp/
├── contracts/                 # 智能合约
│   ├── MeetingRegistration.sol    # 主合约
│   ├── Migrations.sol             # 迁移合约
│   └── MeetingRegistration.json   # 合约ABI
├── migrations/                # Truffle迁移脚本
│   ├── 1_initial_migration.js
│   └── 2_deploy_contracts.js
├── test/                      # 合约测试
│   └── MeetingRegistration.test.js
├── scripts/                   # 部署脚本
│   ├── update-abi.js
│   └── deploy-sepolia.js
├── pages/                     # Next.js页面
│   ├── _app.js
│   └── index.js
├── components/                # React组件
│   ├── Layout.js
│   ├── WalletConnection.js
│   ├── CreateMeetingForm.js
│   └── MeetingList.js
├── context/                   # React上下文
│   └── Web3Context.js
├── styles/                    # 样式文件
│   └── globals.css
├── truffle-config.js          # Truffle配置
├── next.config.js             # Next.js配置
└── package.json               # 项目依赖
```

## 安装和使用

### 环境要求
- Node.js 16+
- npm 或 yarn
- MetaMask 浏览器扩展

### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd meeting-dapp
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env.local
# 编辑 .env.local 填入相关配置
```

4. **编译智能合约**
```bash
npm run compile
```

5. **更新合约ABI**
```bash
node scripts/update-abi.js
```

6. **启动开发服务器**
```bash
npm run dev
```

7. **访问应用**
打开 http://localhost:3000

### 测试

运行智能合约测试：
```bash
npm run test
```

### 部署

#### 部署智能合约到测试网

1. **配置环境变量**
```bash
# .env.local
INFURA_PROJECT_ID=your-infura-project-id
MNEMONIC=your-twelve-word-mnemonic
ETHERSCAN_API_KEY=your-etherscan-api-key
```

2. **部署到 Sepolia 测试网**
```bash
# 使用 Truffle
npm run migrate -- --network sepolia

# 或使用自定义脚本
node scripts/deploy-sepolia.js
```

3. **更新前端配置**
部署成功后，将合约地址填入 `.env.local` 的 `NEXT_PUBLIC_CONTRACT_ADDRESS`

#### 部署前端到 Vercel

1. **构建项目**
```bash
npm run build
```

2. **部署到 Vercel**
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

或直接连接 GitHub 仓库到 Vercel 进行自动部署。

## 使用指南

### 连接钱包
1. 确保已安装 MetaMask
2. 访问 DApp 首页
3. 点击"连接 MetaMask"按钮
4. 在 MetaMask 中确认连接

### 创建会议
1. 连接钱包后，点击"创建会议"标签
2. 填写会议信息：
   - 会议标题（必填）
   - 会议描述（可选）
   - 开始和结束时间
   - 最大参与人数
   - 报名费用（可选，单位：ETH）
3. 点击"创建会议"并在钱包中确认交易

### 报名会议
1. 在"所有会议"中浏览可用会议
2. 选择想要参加的会议，点击"立即报名"
3. 在钱包中确认交易和费用支付
4. 等待交易确认完成

### 委托报名
1. 首先需要被委托人授权您代为报名的权限
2. 在会议卡片中点击"委托报名"
3. 输入被委托人的以太坊地址
4. 确认交易并支付报名费

### 取消报名
1. 在"我的会议"中查看已报名的会议
2. 在会议开始前，可以点击"取消报名"
3. 确认交易后将自动退还报名费

## 智能合约详解

### 主要结构

#### Meeting 结构体
```solidity
struct Meeting {
    uint256 id;              // 会议ID
    string title;            // 会议标题
    string description;      // 会议描述
    uint256 startTime;       // 开始时间戳
    uint256 endTime;         // 结束时间戳
    uint256 maxParticipants; // 最大参与人数
    uint256 registrationFee; // 报名费（wei）
    address organizer;       // 组织者地址
    bool isActive;          // 是否激活
    uint256 currentParticipants; // 当前参与人数
}
```

#### 主要函数

**createMeeting**: 创建新会议
```solidity
function createMeeting(
    string memory _title,
    string memory _description,
    uint256 _startTime,
    uint256 _endTime,
    uint256 _maxParticipants,
    uint256 _registrationFee
) external returns (uint256)
```

**registerForMeeting**: 报名参加会议
```solidity
function registerForMeeting(uint256 _meetingId) external payable
```

**delegateRegister**: 委托报名
```solidity
function delegateRegister(uint256 _meetingId, address _participant) external payable
```

**grantDelegatePermission**: 授权委托权限
```solidity
function grantDelegatePermission(address _delegate) external
```

### 安全特性

1. **重入攻击防护**: 使用 OpenZeppelin 的 ReentrancyGuard
2. **权限控制**: 使用 Ownable 模式
3. **输入验证**: 全面的参数验证
4. **状态检查**: 完整的状态验证逻辑
5. **时间控制**: 基于时间戳的会议状态管理

### 事件日志

```solidity
event MeetingCreated(uint256 indexed meetingId, string title, address indexed organizer, uint256 startTime, uint256 maxParticipants);
event RegistrationSuccessful(uint256 indexed meetingId, address indexed participant, bool isDelegated, address delegatedBy);
event RegistrationCancelled(uint256 indexed meetingId, address indexed participant);
event DelegatePermissionGranted(address indexed delegator, address indexed delegate);
event DelegatePermissionRevoked(address indexed delegator, address indexed delegate);
event MeetingCancelled(uint256 indexed meetingId);
```

## 测试覆盖

项目包含完整的合约测试，覆盖以下场景：

- ✅ 会议创建（正常和异常情况）
- ✅ 会议报名（正常和异常情况）
- ✅ 委托权限管理
- ✅ 委托报名功能
- ✅ 报名取消和退款
- ✅ 会议取消和批量退款
- ✅ 权限验证
- ✅ 边界条件测试

## 性能和Gas优化

1. **存储优化**: 合理的数据结构设计
2. **Gas估算**: 前端自动估算Gas用量
3. **批量操作**: 支持批量退款等操作
4. **事件优化**: 使用索引事件减少查询成本

## 安全注意事项

1. **私钥安全**: 永远不要在代码中硬编码私钥
2. **环境变量**: 生产环境使用环境变量管理敏感信息
3. **网络验证**: 确保连接到正确的以太坊网络
4. **交易确认**: 等待足够的区块确认
5. **合约验证**: 在 Etherscan 上验证合约代码

## 常见问题

### Q: MetaMask 连接失败
A: 检查浏览器是否安装了 MetaMask，确保网络设置正确。

### Q: 交易失败
A: 检查账户余额是否足够支付 Gas 费用和报名费。

### Q: 合约调用失败
A: 确认合约地址正确，网络连接正常。

### Q: 页面显示异常
A: 检查浏览器控制台错误信息，确保已连接钱包。

## 后续扩展

### 可能的功能扩展
- 📝 会议评价和反馈系统
- 🎫 NFT门票系统
- 💰 ERC-20代币支付
- 📊 会议数据分析面板
- 🔔 事件通知系统
- 🌐 多语言支持
- 📱 移动端App

### 技术优化
- ⚡ Layer 2 解决方案集成
- 🔄 更好的状态管理
- 📦 代码分割和懒加载
- 🎯 SEO优化
- 📈 性能监控

## 许可证

MIT License

## 相关文档

- 📖 [用户使用指南](./USER_GUIDE.md) - 如何使用DApp的详细说明
- 🚀 [Vercel部署指导](./VERCEL_DEPLOYMENT_GUIDE.md) - 完整的部署到Vercel的步骤
- 📋 [项目实验报告](./PROJECT_REPORT.md) - 详细的技术实现报告
- 🔧 [开发者文档](./README.md) - 本文档

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题，请通过以下方式联系：
- GitHub Issues
- Email: your-email@example.com
