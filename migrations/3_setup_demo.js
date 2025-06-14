const Enrollment = artifacts.require("Enrollment");

module.exports = async function(deployer, network, accounts) {
  console.log("开始部署Enrollment合约...");
  console.log("部署账户:", accounts[0]);
  console.log("网络:", network);
  
  try {
    // 部署合约
    await deployer.deploy(Enrollment);
    const enrollmentInstance = await Enrollment.deployed();
    
    console.log("✅ Enrollment合约部署成功!");
    console.log("📍 合约地址:", enrollmentInstance.address);
    console.log("👤 管理员地址:", accounts[0]);
    
    // 验证部署
    const administrator = await enrollmentInstance.administrator();
    console.log("🔍 验证管理员地址:", administrator);
    
    // 创建一些示例会议（仅在开发环境）
    if (network === 'development') {
      console.log("🎯 创建示例会议...");
      
      await enrollmentInstance.newConference("区块链技术研讨会", 10, { from: accounts[0] });
      await enrollmentInstance.newConference("智能合约开发大会", 20, { from: accounts[0] });
      await enrollmentInstance.newConference("DeFi生态峰会", 15, { from: accounts[0] });
      
      console.log("✅ 示例会议创建完成!");
      
      // 获取会议数量验证
      const conferenceCount = await enrollmentInstance.getConferenceCount();
      console.log("📊 总会议数量:", conferenceCount.toString());
    }
    
    console.log("\n🎉 部署完成! 请将以下信息复制到前端配置:");
    console.log("合约地址:", enrollmentInstance.address);
    console.log("网络ID:", await web3.eth.net.getId());
    
  } catch (error) {
    console.error("❌ 部署失败:", error);
    throw error;
  }
};
