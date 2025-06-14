#!/usr/bin/env node

const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const contractABI = require('../contracts/MeetingRegistration.json');

async function deployToSepolia() {
  const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
  const MNEMONIC = process.env.MNEMONIC;
  
  if (!INFURA_PROJECT_ID || !MNEMONIC) {
    console.error('❌ 请设置 INFURA_PROJECT_ID 和 MNEMONIC 环境变量');
    process.exit(1);
  }

  const provider = new HDWalletProvider(
    MNEMONIC,
    `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`
  );

  const web3 = new Web3(provider);
  
  try {
    const accounts = await web3.eth.getAccounts();
    console.log('📝 部署账户:', accounts[0]);
    
    const balance = await web3.eth.getBalance(accounts[0]);
    console.log('💰 账户余额:', web3.utils.fromWei(balance, 'ether'), 'ETH');
    
    if (parseFloat(web3.utils.fromWei(balance, 'ether')) < 0.01) {
      console.error('❌ 账户余额不足，请充值至少 0.01 ETH');
      process.exit(1);
    }

    console.log('🚀 开始部署合约...');
    
    const contract = new web3.eth.Contract(contractABI.abi);
    
    const deployTx = contract.deploy({
      data: contractABI.bytecode
    });
    
    const gasEstimate = await deployTx.estimateGas({ from: accounts[0] });
    console.log('⛽ 预估Gas:', gasEstimate);
    
    const deployedContract = await deployTx.send({
      from: accounts[0],
      gas: Math.floor(gasEstimate * 1.2),
      gasPrice: '20000000000' // 20 gwei
    });
    
    console.log('✅ 合约部署成功!');
    console.log('📍 合约地址:', deployedContract.options.address);
    console.log('🔍 在Etherscan查看:', `https://sepolia.etherscan.io/address/${deployedContract.options.address}`);
    
    // 保存合约地址到环境变量文件
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '../.env.local');
    
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    const contractAddressLine = `NEXT_PUBLIC_CONTRACT_ADDRESS=${deployedContract.options.address}`;
    
    if (envContent.includes('NEXT_PUBLIC_CONTRACT_ADDRESS')) {
      envContent = envContent.replace(/NEXT_PUBLIC_CONTRACT_ADDRESS=.*/, contractAddressLine);
    } else {
      envContent += `\n${contractAddressLine}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('💾 合约地址已保存到 .env.local');
    
  } catch (error) {
    console.error('❌ 部署失败:', error.message);
  } finally {
    provider.engine.stop();
  }
}

deployToSepolia();
