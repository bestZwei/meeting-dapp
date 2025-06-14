#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 读取编译后的合约文件
const buildDir = path.join(__dirname, '..', 'build', 'contracts');
const contractsDir = path.join(__dirname, '..', 'contracts');

try {
  const meetingContractPath = path.join(buildDir, 'MeetingRegistration.json');
  const targetPath = path.join(contractsDir, 'MeetingRegistration.json');
  
  if (fs.existsSync(meetingContractPath)) {
    const contractData = JSON.parse(fs.readFileSync(meetingContractPath, 'utf8'));
    
    // 只保留ABI和bytecode
    const contractABI = {
      abi: contractData.abi,
      bytecode: contractData.bytecode,
      deployedBytecode: contractData.deployedBytecode
    };
    
    fs.writeFileSync(targetPath, JSON.stringify(contractABI, null, 2));
    console.log('✅ 合约ABI已更新');
  } else {
    console.log('❌ 合约编译文件不存在，请先运行 truffle compile');
  }
} catch (error) {
  console.error('❌ 更新合约ABI失败:', error.message);
}
