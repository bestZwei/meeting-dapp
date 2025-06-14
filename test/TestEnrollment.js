const Enrollment = artifacts.require("Enrollment");

contract("Enrollment", (accounts) => {
    let enrollmentInstance;
    const admin = accounts[0];
    const participant1 = accounts[1];
    const participant2 = accounts[2];
    const trustee = accounts[3];

    beforeEach(async () => {
        enrollmentInstance = await Enrollment.new({ from: admin });
    });

    describe("合约初始化", () => {
        it("应该正确设置管理员", async () => {
            const administrator = await enrollmentInstance.administrator();
            assert.equal(administrator, admin, "管理员应该是合约部署者");
        });

        it("应该初始化空的会议列表", async () => {
            const conferenceCount = await enrollmentInstance.getConferenceCount();
            assert.equal(conferenceCount.toNumber(), 0, "初始会议数量应该为0");
        });
    });

    describe("参与者注册功能", () => {
        it("应该允许用户注册", async () => {
            await enrollmentInstance.signUp("张三", { from: participant1 });
            
            const participantInfo = await enrollmentInstance.getParticipantInfo(participant1);
            assert.equal(participantInfo.name, "张三", "用户名应该正确保存");
            assert.equal(participantInfo.isRegistered, true, "用户应该标记为已注册");
        });

        it("不应该允许重复注册", async () => {
            await enrollmentInstance.signUp("张三", { from: participant1 });
            
            try {
                await enrollmentInstance.signUp("李四", { from: participant1 });
                assert.fail("应该抛出异常");
            } catch (error) {
                assert(error.message.includes("User already registered"), "应该阻止重复注册");
            }
        });

        it("不应该允许空姓名注册", async () => {
            try {
                await enrollmentInstance.signUp("", { from: participant1 });
                assert.fail("应该抛出异常");
            } catch (error) {
                assert(error.message.includes("Name cannot be empty"), "应该阻止空姓名注册");
            }
        });
    });

    describe("会议管理功能", () => {
        it("管理员应该能够创建会议", async () => {
            const tx = await enrollmentInstance.newConference("区块链技术研讨会", 10, { from: admin });
            
            // 检查事件
            assert.equal(tx.logs[0].event, "NewConference", "应该触发NewConference事件");
            assert.equal(tx.logs[0].args.name, "区块链技术研讨会", "会议名称应该正确");
            assert.equal(tx.logs[0].args.maxParticipants.toNumber(), 10, "最大参与人数应该正确");
            
            // 检查会议信息
            const conferenceInfo = await enrollmentInstance.getConferenceInfo(0);
            assert.equal(conferenceInfo.name, "区块链技术研讨会", "会议名称应该正确保存");
            assert.equal(conferenceInfo.maxParticipants.toNumber(), 10, "最大参与人数应该正确保存");
            assert.equal(conferenceInfo.currentParticipants.toNumber(), 0, "当前参与人数应该为0");
            assert.equal(conferenceInfo.isFull, false, "会议应该未满员");
        });

        it("非管理员不应该能够创建会议", async () => {
            try {
                await enrollmentInstance.newConference("测试会议", 5, { from: participant1 });
                assert.fail("应该抛出异常");
            } catch (error) {
                assert(error.message.includes("Only administrator"), "应该阻止非管理员创建会议");
            }
        });
    });

    describe("报名功能", () => {
        beforeEach(async () => {
            // 注册参与者
            await enrollmentInstance.signUp("张三", { from: participant1 });
            await enrollmentInstance.signUp("李四", { from: participant2 });
            // 创建会议
            await enrollmentInstance.newConference("区块链技术研讨会", 2, { from: admin });
        });

        it("已注册用户应该能够报名", async () => {
            const tx = await enrollmentInstance.enroll(0, { from: participant1 });
            
            // 检查事件
            assert.equal(tx.logs[0].event, "EnrollmentSuccess", "应该触发EnrollmentSuccess事件");
            assert.equal(tx.logs[1].event, "MyNewConference", "应该触发MyNewConference事件");
            
            // 检查报名状态
            const isEnrolled = await enrollmentInstance.isEnrolledInConference(participant1, 0);
            assert.equal(isEnrolled, true, "用户应该已报名");
            
            // 检查会议参与人数
            const conferenceInfo = await enrollmentInstance.getConferenceInfo(0);
            assert.equal(conferenceInfo.currentParticipants.toNumber(), 1, "会议参与人数应该增加");
        });

        it("未注册用户不应该能够报名", async () => {
            try {
                await enrollmentInstance.enroll(0, { from: accounts[4] });
                assert.fail("应该抛出异常");
            } catch (error) {
                assert(error.message.includes("registered first"), "应该阻止未注册用户报名");
            }
        });

        it("会议满员后不应该能够继续报名", async () => {
            // 填满会议
            await enrollmentInstance.enroll(0, { from: participant1 });
            await enrollmentInstance.enroll(0, { from: participant2 });
            
            // 注册第三个用户并尝试报名
            await enrollmentInstance.signUp("王五", { from: accounts[4] });
            
            try {
                await enrollmentInstance.enroll(0, { from: accounts[4] });
                assert.fail("应该抛出异常");
            } catch (error) {
                assert(error.message.includes("Conference is full"), "应该阻止满员会议的报名");
            }
        });

        it("会议满员时应该触发ConferenceExpire事件", async () => {
            // 填满会议（最后一个报名）
            await enrollmentInstance.enroll(0, { from: participant1 });
            const tx = await enrollmentInstance.enroll(0, { from: participant2 });
            
            // 检查是否触发了ConferenceExpire事件
            const expireEvent = tx.logs.find(log => log.event === "ConferenceExpire");
            assert(expireEvent, "应该触发ConferenceExpire事件");
            assert.equal(expireEvent.args.conferenceId.toNumber(), 0, "事件参数应该正确");
        });
    });

    describe("委托报名功能", () => {
        beforeEach(async () => {
            // 注册参与者
            await enrollmentInstance.signUp("张三", { from: participant1 });
            await enrollmentInstance.signUp("李四", { from: participant2 });
            // 创建会议
            await enrollmentInstance.newConference("区块链技术研讨会", 10, { from: admin });
            // 设置委托
            await enrollmentInstance.delegate(trustee, { from: participant1 });
        });

        it("受托方应该能够为委托方报名", async () => {
            const tx = await enrollmentInstance.enrollFor(participant1, 0, { from: trustee });
            
            // 检查事件
            const delegateEvent = tx.logs.find(log => log.event === "DelegateEnrollment");
            assert(delegateEvent, "应该触发DelegateEnrollment事件");
            assert.equal(delegateEvent.args.trustee, trustee, "受托方地址应该正确");
            assert.equal(delegateEvent.args.participant, participant1, "委托方地址应该正确");
            
            // 检查报名状态
            const isEnrolled = await enrollmentInstance.isEnrolledInConference(participant1, 0);
            assert.equal(isEnrolled, true, "委托方应该已报名");
        });

        it("没有委托权限的用户不应该能够代理报名", async () => {
            try {
                await enrollmentInstance.enrollFor(participant2, 0, { from: trustee });
                assert.fail("应该抛出异常");
            } catch (error) {
                assert(error.message.includes("No delegation permission"), "应该阻止无权限的委托报名");
            }
        });
    });

    describe("查询功能", () => {
        beforeEach(async () => {
            // 注册参与者
            await enrollmentInstance.signUp("张三", { from: participant1 });
            // 创建多个会议
            await enrollmentInstance.newConference("区块链研讨会", 2, { from: admin });
            await enrollmentInstance.newConference("AI技术峰会", 3, { from: admin });
            await enrollmentInstance.newConference("Web3开发大会", 1, { from: admin });
        });

        it("应该正确返回可报名会议列表", async () => {
            const availableConferences = await enrollmentInstance.queryConfList();
            assert.equal(availableConferences.length, 3, "应该有3个可报名会议");
        });

        it("应该正确返回我的报名会议列表", async () => {
            // 报名两个会议
            await enrollmentInstance.enroll(0, { from: participant1 });
            await enrollmentInstance.enroll(1, { from: participant1 });
            
            const myConferences = await enrollmentInstance.queryMyConf({ from: participant1 });
            assert.equal(myConferences.length, 2, "应该返回2个已报名会议");
            assert.equal(myConferences[0].toNumber(), 0, "第一个会议ID应该正确");
            assert.equal(myConferences[1].toNumber(), 1, "第二个会议ID应该正确");
        });

        it("满员会议不应该出现在可报名列表中", async () => {
            // 填满第一个会议
            await enrollmentInstance.enroll(0, { from: participant1 });
            await enrollmentInstance.signUp("李四", { from: participant2 });
            await enrollmentInstance.enroll(0, { from: participant2 });
            
            const availableConferences = await enrollmentInstance.queryConfList();
            assert.equal(availableConferences.length, 2, "应该有2个可报名会议");
            assert.notEqual(availableConferences[0].toNumber(), 0, "满员会议不应该在列表中");
        });
    });
});
