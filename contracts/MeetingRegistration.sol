// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MeetingRegistration is Ownable, ReentrancyGuard {
    
    struct Meeting {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 maxParticipants;
        uint256 registrationFee;
        address organizer;
        bool isActive;
        uint256 currentParticipants;
    }
    
    struct Registration {
        address participant;
        uint256 meetingId;
        uint256 registrationTime;
        bool isDelegated;
        address delegatedBy;
    }
    
    // 状态变量
    uint256 private nextMeetingId = 1;
    mapping(uint256 => Meeting) public meetings;
    mapping(uint256 => mapping(address => bool)) public isRegistered;
    mapping(uint256 => address[]) public meetingParticipants;
    mapping(address => uint256[]) public userMeetings;
    
    // 委托映射
    mapping(address => mapping(address => bool)) public delegatePermissions;
    
    // 事件
    event MeetingCreated(
        uint256 indexed meetingId,
        string title,
        address indexed organizer,
        uint256 startTime,
        uint256 maxParticipants
    );
    
    event RegistrationSuccessful(
        uint256 indexed meetingId,
        address indexed participant,
        bool isDelegated,
        address delegatedBy
    );
    
    event RegistrationCancelled(
        uint256 indexed meetingId,
        address indexed participant
    );
    
    event DelegatePermissionGranted(
        address indexed delegator,
        address indexed delegate
    );
    
    event DelegatePermissionRevoked(
        address indexed delegator,
        address indexed delegate
    );
    
    event MeetingCancelled(uint256 indexed meetingId);
    
    // 修饰符
    modifier meetingExists(uint256 _meetingId) {
        require(_meetingId > 0 && _meetingId < nextMeetingId, "Meeting does not exist");
        _;
    }
    
    modifier meetingActive(uint256 _meetingId) {
        require(meetings[_meetingId].isActive, "Meeting is not active");
        _;
    }
    
    modifier notRegistered(uint256 _meetingId, address _participant) {
        require(!isRegistered[_meetingId][_participant], "Already registered");
        _;
    }
    
    modifier registrationOpen(uint256 _meetingId) {
        require(block.timestamp < meetings[_meetingId].startTime, "Registration closed");
        _;
    }
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * 创建会议
     */
    function createMeeting(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxParticipants,
        uint256 _registrationFee
    ) external returns (uint256) {
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        require(_maxParticipants > 0, "Max participants must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        uint256 meetingId = nextMeetingId++;
        
        meetings[meetingId] = Meeting({
            id: meetingId,
            title: _title,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            maxParticipants: _maxParticipants,
            registrationFee: _registrationFee,
            organizer: msg.sender,
            isActive: true,
            currentParticipants: 0
        });
        
        emit MeetingCreated(meetingId, _title, msg.sender, _startTime, _maxParticipants);
        
        return meetingId;
    }
    
    /**
     * 报名会议
     */
    function registerForMeeting(uint256 _meetingId) 
        external 
        payable 
        meetingExists(_meetingId)
        meetingActive(_meetingId)
        notRegistered(_meetingId, msg.sender)
        registrationOpen(_meetingId)
        nonReentrant
    {
        Meeting storage meeting = meetings[_meetingId];
        
        require(meeting.currentParticipants < meeting.maxParticipants, "Meeting is full");
        require(msg.value >= meeting.registrationFee, "Insufficient registration fee");
        
        // 更新状态
        isRegistered[_meetingId][msg.sender] = true;
        meetingParticipants[_meetingId].push(msg.sender);
        userMeetings[msg.sender].push(_meetingId);
        meeting.currentParticipants++;
        
        // 退还多余的费用
        if (msg.value > meeting.registrationFee) {
            payable(msg.sender).transfer(msg.value - meeting.registrationFee);
        }
        
        emit RegistrationSuccessful(_meetingId, msg.sender, false, address(0));
    }
    
    /**
     * 委托报名
     */
    function delegateRegister(uint256 _meetingId, address _participant)
        external
        payable
        meetingExists(_meetingId)
        meetingActive(_meetingId)
        notRegistered(_meetingId, _participant)
        registrationOpen(_meetingId)
        nonReentrant
    {
        require(delegatePermissions[_participant][msg.sender], "No delegation permission");
        
        Meeting storage meeting = meetings[_meetingId];
        
        require(meeting.currentParticipants < meeting.maxParticipants, "Meeting is full");
        require(msg.value >= meeting.registrationFee, "Insufficient registration fee");
        
        // 更新状态
        isRegistered[_meetingId][_participant] = true;
        meetingParticipants[_meetingId].push(_participant);
        userMeetings[_participant].push(_meetingId);
        meeting.currentParticipants++;
        
        // 退还多余的费用
        if (msg.value > meeting.registrationFee) {
            payable(msg.sender).transfer(msg.value - meeting.registrationFee);
        }
        
        emit RegistrationSuccessful(_meetingId, _participant, true, msg.sender);
    }
    
    /**
     * 授权委托权限
     */
    function grantDelegatePermission(address _delegate) external {
        require(_delegate != msg.sender, "Cannot delegate to yourself");
        require(_delegate != address(0), "Invalid delegate address");
        
        delegatePermissions[msg.sender][_delegate] = true;
        
        emit DelegatePermissionGranted(msg.sender, _delegate);
    }
    
    /**
     * 撤销委托权限
     */
    function revokeDelegatePermission(address _delegate) external {
        require(delegatePermissions[msg.sender][_delegate], "No permission to revoke");
        
        delegatePermissions[msg.sender][_delegate] = false;
        
        emit DelegatePermissionRevoked(msg.sender, _delegate);
    }
    
    /**
     * 取消报名
     */
    function cancelRegistration(uint256 _meetingId)
        external
        meetingExists(_meetingId)
        nonReentrant
    {
        require(isRegistered[_meetingId][msg.sender], "Not registered");
        require(block.timestamp < meetings[_meetingId].startTime, "Cannot cancel after meeting start");
        
        // 更新状态
        isRegistered[_meetingId][msg.sender] = false;
        meetings[_meetingId].currentParticipants--;
        
        // 从参与者列表中移除
        address[] storage participants = meetingParticipants[_meetingId];
        for (uint i = 0; i < participants.length; i++) {
            if (participants[i] == msg.sender) {
                participants[i] = participants[participants.length - 1];
                participants.pop();
                break;
            }
        }
        
        // 退款
        uint256 refundAmount = meetings[_meetingId].registrationFee;
        if (refundAmount > 0) {
            payable(msg.sender).transfer(refundAmount);
        }
        
        emit RegistrationCancelled(_meetingId, msg.sender);
    }
    
    /**
     * 取消会议（仅组织者）
     */
    function cancelMeeting(uint256 _meetingId)
        external
        meetingExists(_meetingId)
        nonReentrant
    {
        Meeting storage meeting = meetings[_meetingId];
        require(msg.sender == meeting.organizer, "Only organizer can cancel");
        require(meeting.isActive, "Meeting already cancelled");
        
        meeting.isActive = false;
        
        // 退款给所有参与者
        address[] memory participants = meetingParticipants[_meetingId];
        for (uint i = 0; i < participants.length; i++) {
            if (meeting.registrationFee > 0) {
                payable(participants[i]).transfer(meeting.registrationFee);
            }
        }
        
        emit MeetingCancelled(_meetingId);
    }
    
    // 查询函数
    function getMeeting(uint256 _meetingId) 
        external 
        view 
        meetingExists(_meetingId) 
        returns (Meeting memory) 
    {
        return meetings[_meetingId];
    }
    
    function getMeetingParticipants(uint256 _meetingId) 
        external 
        view 
        meetingExists(_meetingId) 
        returns (address[] memory) 
    {
        return meetingParticipants[_meetingId];
    }
    
    function getUserMeetings(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userMeetings[_user];
    }
    
    function isUserRegistered(uint256 _meetingId, address _user) 
        external 
        view 
        returns (bool) 
    {
        return isRegistered[_meetingId][_user];
    }
    
    function hasDelegatePermission(address _delegator, address _delegate) 
        external 
        view 
        returns (bool) 
    {
        return delegatePermissions[_delegator][_delegate];
    }
    
    function getTotalMeetings() external view returns (uint256) {
        return nextMeetingId - 1;
    }
    
    // 提取合约余额（仅所有者）
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    // 接收以太币
    receive() external payable {}
}
