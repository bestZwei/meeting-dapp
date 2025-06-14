const HDWalletProvider = require('@truffle/hdwallet-provider');

// 私钥配置（生产环境请使用环境变量）
const MNEMONIC = process.env.MNEMONIC || 'your twelve word mnemonic phrase here';
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || 'your-infura-project-id';

module.exports = {
  networks: {
    // 开发网络
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // 匹配任何网络id
      gas: 6721975,
      gasPrice: 20000000000, // 20 gwei
    },
    
    // Ganache
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777",
      gas: 6721975,
      gasPrice: 20000000000,
    },
    
    // Sepolia测试网
    sepolia: {
      provider: () => new HDWalletProvider(
        MNEMONIC,
        `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`
      ),
      network_id: 11155111,
      gas: 4500000,
      gasPrice: 10000000000, // 10 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    
    // Goerli测试网
    goerli: {
      provider: () => new HDWalletProvider(
        MNEMONIC,
        `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`
      ),
      network_id: 5,
      gas: 4500000,
      gasPrice: 10000000000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },
  // 编译器配置
  compilers: {
    solc: {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "london"
      }
    }
  },

  // 插件
  plugins: [
    'truffle-plugin-verify'
  ],

  // API密钥
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  }
};
