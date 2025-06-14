const MeetingRegistration = artifacts.require("MeetingRegistration");

contract("MeetingRegistration", (accounts) => {
  let meetingContract;
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];

  beforeEach(async () => {
    meetingContract = await MeetingRegistration.new({ from: owner });
  });

  describe("Meeting Creation", () => {
    it("should create a meeting successfully", async () => {
      const title = "Blockchain Conference";
      const description = "Annual blockchain technology conference";
      const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const endTime = startTime + 7200; // 2 hours duration
      const maxParticipants = 100;
      const registrationFee = web3.utils.toWei("0.1", "ether");

      const result = await meetingContract.createMeeting(
        title,
        description,
        startTime,
        endTime,
        maxParticipants,
        registrationFee,
        { from: user1 }
      );

      const meetingId = result.logs[0].args.meetingId;
      const meeting = await meetingContract.getMeeting(meetingId);

      assert.equal(meeting.title, title);
      assert.equal(meeting.organizer, user1);
      assert.equal(meeting.maxParticipants.toString(), maxParticipants.toString());
      assert.equal(meeting.isActive, true);
    });

    it("should fail when creating meeting with past start time", async () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      try {
        await meetingContract.createMeeting(
          "Past Meeting",
          "This should fail",
          pastTime,
          pastTime + 3600,
          50,
          0,
          { from: user1 }
        );
        assert.fail("Expected revert not received");
      } catch (error) {
        assert(error.message.includes("Start time must be in the future"));
      }
    });
  });

  describe("Meeting Registration", () => {
    let meetingId;
    const registrationFee = web3.utils.toWei("0.1", "ether");

    beforeEach(async () => {
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const result = await meetingContract.createMeeting(
        "Test Meeting",
        "Test Description",
        startTime,
        startTime + 3600,
        100,
        registrationFee,
        { from: user1 }
      );
      meetingId = result.logs[0].args.meetingId;
    });

    it("should register for meeting successfully", async () => {
      const result = await meetingContract.registerForMeeting(meetingId, {
        from: user2,
        value: registrationFee
      });

      const isRegistered = await meetingContract.isUserRegistered(meetingId, user2);
      assert.equal(isRegistered, true);

      const meeting = await meetingContract.getMeeting(meetingId);
      assert.equal(meeting.currentParticipants.toString(), "1");
    });

    it("should fail registration with insufficient fee", async () => {
      const insufficientFee = web3.utils.toWei("0.05", "ether");
      
      try {
        await meetingContract.registerForMeeting(meetingId, {
          from: user2,
          value: insufficientFee
        });
        assert.fail("Expected revert not received");
      } catch (error) {
        assert(error.message.includes("Insufficient registration fee"));
      }
    });

    it("should prevent double registration", async () => {
      await meetingContract.registerForMeeting(meetingId, {
        from: user2,
        value: registrationFee
      });

      try {
        await meetingContract.registerForMeeting(meetingId, {
          from: user2,
          value: registrationFee
        });
        assert.fail("Expected revert not received");
      } catch (error) {
        assert(error.message.includes("Already registered"));
      }
    });
  });

  describe("Delegate Registration", () => {
    let meetingId;
    const registrationFee = web3.utils.toWei("0.1", "ether");

    beforeEach(async () => {
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const result = await meetingContract.createMeeting(
        "Test Meeting",
        "Test Description",
        startTime,
        startTime + 3600,
        100,
        registrationFee,
        { from: user1 }
      );
      meetingId = result.logs[0].args.meetingId;
    });

    it("should grant and use delegate permission successfully", async () => {
      // Grant permission
      await meetingContract.grantDelegatePermission(user3, { from: user2 });
      
      const hasPermission = await meetingContract.hasDelegatePermission(user2, user3);
      assert.equal(hasPermission, true);

      // Delegate register
      await meetingContract.delegateRegister(meetingId, user2, {
        from: user3,
        value: registrationFee
      });

      const isRegistered = await meetingContract.isUserRegistered(meetingId, user2);
      assert.equal(isRegistered, true);
    });

    it("should fail delegate registration without permission", async () => {
      try {
        await meetingContract.delegateRegister(meetingId, user2, {
          from: user3,
          value: registrationFee
        });
        assert.fail("Expected revert not received");
      } catch (error) {
        assert(error.message.includes("No delegation permission"));
      }
    });

    it("should revoke delegate permission successfully", async () => {
      await meetingContract.grantDelegatePermission(user3, { from: user2 });
      await meetingContract.revokeDelegatePermission(user3, { from: user2 });
      
      const hasPermission = await meetingContract.hasDelegatePermission(user2, user3);
      assert.equal(hasPermission, false);
    });
  });

  describe("Meeting Cancellation", () => {
    let meetingId;
    const registrationFee = web3.utils.toWei("0.1", "ether");

    beforeEach(async () => {
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const result = await meetingContract.createMeeting(
        "Test Meeting",
        "Test Description",
        startTime,
        startTime + 3600,
        100,
        registrationFee,
        { from: user1 }
      );
      meetingId = result.logs[0].args.meetingId;
      
      // Register some users
      await meetingContract.registerForMeeting(meetingId, {
        from: user2,
        value: registrationFee
      });
    });

    it("should allow organizer to cancel meeting", async () => {
      const balanceBefore = await web3.eth.getBalance(user2);
      
      await meetingContract.cancelMeeting(meetingId, { from: user1 });
      
      const meeting = await meetingContract.getMeeting(meetingId);
      assert.equal(meeting.isActive, false);
      
      const balanceAfter = await web3.eth.getBalance(user2);
      assert(web3.utils.toBN(balanceAfter).gt(web3.utils.toBN(balanceBefore)));
    });

    it("should prevent non-organizer from cancelling meeting", async () => {
      try {
        await meetingContract.cancelMeeting(meetingId, { from: user2 });
        assert.fail("Expected revert not received");
      } catch (error) {
        assert(error.message.includes("Only organizer can cancel"));
      }
    });
  });

  describe("Registration Cancellation", () => {
    let meetingId;
    const registrationFee = web3.utils.toWei("0.1", "ether");

    beforeEach(async () => {
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const result = await meetingContract.createMeeting(
        "Test Meeting",
        "Test Description",
        startTime,
        startTime + 3600,
        100,
        registrationFee,
        { from: user1 }
      );
      meetingId = result.logs[0].args.meetingId;
      
      await meetingContract.registerForMeeting(meetingId, {
        from: user2,
        value: registrationFee
      });
    });

    it("should cancel registration and refund", async () => {
      const balanceBefore = await web3.eth.getBalance(user2);
      
      await meetingContract.cancelRegistration(meetingId, { from: user2 });
      
      const isRegistered = await meetingContract.isUserRegistered(meetingId, user2);
      assert.equal(isRegistered, false);
      
      const meeting = await meetingContract.getMeeting(meetingId);
      assert.equal(meeting.currentParticipants.toString(), "0");
      
      const balanceAfter = await web3.eth.getBalance(user2);
      assert(web3.utils.toBN(balanceAfter).gt(web3.utils.toBN(balanceBefore)));
    });
  });
});
