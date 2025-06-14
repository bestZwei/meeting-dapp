# 会议报名DApp项目

基于以太坊智能合约的去中心化会议报名系统，包含完整的开发、测试、部署流程。

## 🚀 快速开始

### Windows用户
双击运行 `start.bat` 脚本，选择相应操作。

### 手动启动
```bash
# 1. 安装依赖
npm install

# 2. 编译合约
truffle compile

# 3. 运行测试
truffle test

# 4. 启动Ganache并部署合约
truffle migrate --reset

# 5. 配置前端合约地址并启动
cd src
python -m http.server 8080
```

## 📁 项目结构

```
meeting-dapp/
├── contracts/              # 智能合约
│   └── Enrollment.sol      # 主要合约文件
├── migrations/             # 部署脚本
│   ├── 2_deploy_contracts.js
│   └── 3_setup_demo.js
├── test/                   # 测试文件
│   └── TestEnrollment.js   # 合约测试
├── scripts/                # 工具脚本
│   └── interact.js         # 合约交互演示
├── src/                    # 前端文件
│   ├── index.html          # 主页面
│   └── app.js              # Web3交互逻辑
├── truffle-config.js       # Truffle配置
├── package.json            # 项目配置
├── start.bat               # Windows启动脚本
├── setup-guide.md          # 环境搭建指南
└── 实验指导手册.md          # 详细实验指导
```

## 🔧 主要功能

### 智能合约功能
- ✅ 用户注册系统
- ✅ 会议创建和管理
- ✅ 会议报名功能
- ✅ 委托报名机制
- ✅ 权限控制系统
- ✅ 事件触发机制

### 前端功能
- ✅ MetaMask钱包集成
- ✅ 实时会议列表
- ✅ 用户报名界面
- ✅ 管理员功能面板
- ✅ 委托设置界面
- ✅ 响应式设计

## 📋 实验要求

1. **基础功能** (70分)
   - 合约编译和部署
   - 测试用例通过
   - 前端正常运行
   - 基本功能测试

2. **高级功能** (20分)
   - 委托报名机制
   - 事件监听
   - 错误处理

3. **创新功能** (10分)
   - ETH抵押机制
   - 多重委托

## 🛠️ 技术栈

- **智能合约**: Solidity ^0.8.19
- **开发框架**: Truffle Suite
- **测试网络**: Ganache
- **前端库**: Web3.js
- **钱包**: MetaMask

## 📖 使用指南

详细的实验步骤请查看：[实验指导手册.md](./实验指导手册.md)

## ⚠️ 注意事项

1. 确保Ganache在端口8545运行
2. 部署后需要更新前端合约地址
3. 使用MetaMask连接本地网络
4. 测试时使用Ganache提供的账户

## 🐛 常见问题

查看 [实验指导手册.md](./实验指导手册.md) 中的故障排除部分。

## 📄 许可证

MIT License
