const MeetingRegistration = artifacts.require("MeetingRegistration");

module.exports = function (deployer) {
  deployer.deploy(MeetingRegistration);
};
