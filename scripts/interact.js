const Enrollment = artifacts.require("Enrollment");

/**
 * 合约交互脚本
 * 用于演示和测试合约功能
 */
module.exports = async function(callback) {
  try {
    console.log("🚀 开始合约交互演示...\n");
    
    // 获取账户
    const accounts = await web3.eth.getAccounts();
    const admin = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const trustee = accounts[3];
    
    console.log("👥 账户信息:");
    console.log("管理员:", admin);
    console.log("用户1:", user1);
    console.log("用户2:", user2);
    console.log("受托方:", trustee);
    console.log("");
    
    // 获取部署的合约实例
    const enrollment = await Enrollment.deployed();
    console.log("📍 合约地址:", enrollment.address);
    console.log("");
    
    // 1. 用户注册
    console.log("1️⃣ 用户注册演示:");
    await enrollment.signUp("张三", { from: user1 });
    console.log("✅ 用户1 (张三) 注册成功");
    
    await enrollment.signUp("李四", { from: user2 });
    console.log("✅ 用户2 (李四) 注册成功");
    console.log("");
    
    // 2. 创建会议
    console.log("2️⃣ 创建会议演示:");
    await enrollment.newConference("Web3开发训练营", 3, { from: admin });
    console.log("✅ 管理员创建会议: Web3开发训练营 (最大3人)");
    console.log("");
    
    // 3. 查询可报名会议
    console.log("3️⃣ 查询可报名会议:");
    const availableConfs = await enrollment.queryConfList();
    console.log("📋 可报名会议ID列表:", availableConfs.map(id => id.toString()));
    
    for (let confId of availableConfs) {
      const confInfo = await enrollment.getConferenceInfo(confId);
      console.log(`📊 会议${confId}: ${confInfo.name} (${confInfo.currentParticipants}/${confInfo.maxParticipants})`);
    }
    console.log("");
    
    // 4. 用户报名
    console.log("4️⃣ 用户报名演示:");
    const targetConfId = availableConfs[availableConfs.length - 1]; // 选择最新创建的会议
    
    await enrollment.enroll(targetConfId, { from: user1 });
    console.log(`✅ 用户1 报名会议${targetConfId}成功`);
    
    await enrollment.enroll(targetConfId, { from: user2 });
    console.log(`✅ 用户2 报名会议${targetConfId}成功`);
    console.log("");
    
    // 5. 查询我的会议
    console.log("5️⃣ 查询我的会议:");
    const user1Confs = await enrollment.queryMyConf({ from: user1 });
    console.log("👤 用户1 已报名会议:", user1Confs.map(id => id.toString()));
    
    const user2Confs = await enrollment.queryMyConf({ from: user2 });
    console.log("👤 用户2 已报名会议:", user2Confs.map(id => id.toString()));
    console.log("");
    
    // 6. 委托功能演示
    console.log("6️⃣ 委托功能演示:");
    await enrollment.delegate(trustee, { from: user1 });
    console.log("✅ 用户1 委托受托方代理报名");
    
    // 创建新会议用于委托报名
    await enrollment.newConference("区块链安全研讨会", 5, { from: admin });
    console.log("✅ 创建新会议: 区块链安全研讨会");
    
    const newAvailableConfs = await enrollment.queryConfList();
    const newConfId = newAvailableConfs[newAvailableConfs.length - 1];
    
    await enrollment.enrollFor(user1, newConfId, { from: trustee });
    console.log(`✅ 受托方为用户1代理报名会议${newConfId}成功`);
    console.log("");
    
    // 7. 检查最终状态
    console.log("7️⃣ 最终状态检查:");
    
    // 检查用户1的最终报名状态
    const finalUser1Confs = await enrollment.queryMyConf({ from: user1 });
    console.log("👤 用户1 最终已报名会议:", finalUser1Confs.map(id => id.toString()));
    
    // 检查所有会议状态
    const totalConfs = await enrollment.getConferenceCount();
    console.log(`📊 总会议数量: ${totalConfs}`);
    
    for (let i = 0; i < totalConfs; i++) {
      const confInfo = await enrollment.getConferenceInfo(i);
      const status = confInfo.isFull ? "已满员" : "可报名";
      console.log(`📋 会议${i}: ${confInfo.name} (${confInfo.currentParticipants}/${confInfo.maxParticipants}) - ${status}`);
    }
    
    console.log("\n🎉 合约交互演示完成!");
    
  } catch (error) {
    console.error("❌ 执行失败:", error);
  }
  
  callback();
};
