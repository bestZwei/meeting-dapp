// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title 会议报名智能合约
 * @dev 实现会议发起、参与者注册、报名、委托报名等功能
 */
contract Enrollment {
    
    // 管理员地址
    address public administrator;
    
    // 参与者结构体
    struct Participant {
        string name;                    // 参与者姓名
        bool isRegistered;             // 是否已注册
        uint[] enrolledConferences;    // 已报名的会议ID列表
    }
    
    // 会议信息结构体
    struct Conference {
        string name;                   // 会议名称
        uint maxParticipants;          // 最大参与人数
        uint currentParticipants;      // 当前参与人数
        bool isFull;                   // 是否已满员
        address[] participants;        // 参与者地址列表
        mapping(address => bool) isEnrolled; // 某地址是否已报名
    }
    
    // 状态变量
    mapping(address => Participant) public participants;  // 参与者映射
    Conference[] public conferences;                       // 会议列表
    mapping(address => Participant[]) public trustees;    // 受托方映射
    
    // 事件定义
    event NewConference(uint indexed conferenceId, string name, uint maxParticipants);
    event ConferenceExpire(uint indexed conferenceId, string name);
    event MyNewConference(address indexed participant, uint indexed conferenceId);
    event ParticipantRegistered(address indexed participant, string name);
    event EnrollmentSuccess(address indexed participant, uint indexed conferenceId);
    event DelegateEnrollment(address indexed trustee, address indexed participant, uint indexed conferenceId);
    
    // 修饰符：仅管理员
    modifier onlyAdministrator() {
        require(msg.sender == administrator, "Only administrator can call this function");
        _;
    }
    
    // 修饰符：仅已注册用户
    modifier onlyRegistered() {
        require(participants[msg.sender].isRegistered, "User must be registered first");
        _;
    }
    
    // 修饰符：会议存在
    modifier conferenceExists(uint _conferenceId) {
        require(_conferenceId < conferences.length, "Conference does not exist");
        _;
    }
    
    /**
     * @dev 构造函数，设置合约部署者为管理员
     */
    constructor() {
        administrator = msg.sender;
    }
    
    /**
     * @dev 参与者注册
     * @param _name 参与者姓名
     */
    function signUp(string memory _name) public {
        require(!participants[msg.sender].isRegistered, "User already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        participants[msg.sender] = Participant({
            name: _name,
            isRegistered: true,
            enrolledConferences: new uint[](0)
        });
        
        emit ParticipantRegistered(msg.sender, _name);
    }
    
    /**
     * @dev 将报名权限委托给其他以太坊地址
     * @param _trustee 受托方地址
     */
    function delegate(address _trustee) public onlyRegistered {
        require(_trustee != address(0), "Invalid trustee address");
        require(_trustee != msg.sender, "Cannot delegate to yourself");
        
        trustees[_trustee].push(participants[msg.sender]);
    }
    
    /**
     * @dev 为自己报名
     * @param _conferenceId 会议ID
     */
    function enroll(uint _conferenceId) public onlyRegistered conferenceExists(_conferenceId) {
        _enrollInternal(msg.sender, _conferenceId);
    }
    
    /**
     * @dev 为委托者报名
     * @param _participant 委托者地址
     * @param _conferenceId 会议ID
     */
    function enrollFor(address _participant, uint _conferenceId) public conferenceExists(_conferenceId) {
        require(_participant != address(0), "Invalid participant address");
        require(participants[_participant].isRegistered, "Participant must be registered");
        
        // 检查是否有委托权限
        bool hasDelegation = false;
        for (uint i = 0; i < trustees[msg.sender].length; i++) {
            if (keccak256(bytes(trustees[msg.sender][i].name)) == keccak256(bytes(participants[_participant].name))) {
                hasDelegation = true;
                break;
            }
        }
        require(hasDelegation, "No delegation permission for this participant");
        
        _enrollInternal(_participant, _conferenceId);
        emit DelegateEnrollment(msg.sender, _participant, _conferenceId);
    }
    
    /**
     * @dev 内部报名函数
     * @param _participant 参与者地址
     * @param _conferenceId 会议ID
     */
    function _enrollInternal(address _participant, uint _conferenceId) internal {
        Conference storage conf = conferences[_conferenceId];
        
        require(!conf.isFull, "Conference is full");
        require(!conf.isEnrolled[_participant], "Already enrolled in this conference");
        
        // 添加参与者到会议
        conf.participants.push(_participant);
        conf.isEnrolled[_participant] = true;
        conf.currentParticipants++;
        
        // 添加会议到参与者的已报名列表
        participants[_participant].enrolledConferences.push(_conferenceId);
        
        // 检查是否已满员
        if (conf.currentParticipants >= conf.maxParticipants) {
            conf.isFull = true;
            emit ConferenceExpire(_conferenceId, conf.name);
        }
        
        emit EnrollmentSuccess(_participant, _conferenceId);
        emit MyNewConference(_participant, _conferenceId);
    }
    
    /**
     * @dev 发起新会议（仅管理员）
     * @param _name 会议名称
     * @param _maxParticipants 最大参与人数
     */
    function newConference(string memory _name, uint _maxParticipants) public onlyAdministrator {
        require(bytes(_name).length > 0, "Conference name cannot be empty");
        require(_maxParticipants > 0, "Max participants must be greater than 0");
        
        conferences.push();
        uint conferenceId = conferences.length - 1;
        
        Conference storage newConf = conferences[conferenceId];
        newConf.name = _name;
        newConf.maxParticipants = _maxParticipants;
        newConf.currentParticipants = 0;
        newConf.isFull = false;
        
        emit NewConference(conferenceId, _name, _maxParticipants);
    }
    
    /**
     * @dev 销毁合约（仅管理员）
     */
    function destruct() public onlyAdministrator {
        selfdestruct(payable(administrator));
    }
    
    /**
     * @dev 查询可报名会议列表
     * @return availableConferences 可报名的会议ID列表
     */
    function queryConfList() public view returns (uint[] memory) {
        uint count = 0;
        for (uint i = 0; i < conferences.length; i++) {
            if (!conferences[i].isFull) {
                count++;
            }
        }
        
        uint[] memory availableConferences = new uint[](count);
        uint index = 0;
        for (uint i = 0; i < conferences.length; i++) {
            if (!conferences[i].isFull) {
                availableConferences[index] = i;
                index++;
            }
        }
        
        return availableConferences;
    }
    
    /**
     * @dev 查询我报名的会议列表
     * @return myConferences 已报名的会议ID列表
     */
    function queryMyConf() public view onlyRegistered returns (uint[] memory) {
        return participants[msg.sender].enrolledConferences;
    }
    
    /**
     * @dev 获取会议详细信息
     * @param _conferenceId 会议ID
     * @return name 会议名称
     * @return maxParticipants 最大参与人数
     * @return currentParticipants 当前参与人数
     * @return isFull 是否已满员
     */
    function getConferenceInfo(uint _conferenceId) public view conferenceExists(_conferenceId) 
        returns (string memory name, uint maxParticipants, uint currentParticipants, bool isFull) {
        Conference storage conf = conferences[_conferenceId];
        return (conf.name, conf.maxParticipants, conf.currentParticipants, conf.isFull);
    }
    
    /**
     * @dev 获取参与者信息
     * @param _participant 参与者地址
     * @return name 参与者姓名
     * @return isRegistered 是否已注册
     */
    function getParticipantInfo(address _participant) public view 
        returns (string memory name, bool isRegistered) {
        Participant storage p = participants[_participant];
        return (p.name, p.isRegistered);
    }
    
    /**
     * @dev 获取会议总数
     * @return 会议总数
     */
    function getConferenceCount() public view returns (uint) {
        return conferences.length;
    }
    
    /**
     * @dev 检查某用户是否已报名某会议
     * @param _participant 参与者地址
     * @param _conferenceId 会议ID
     * @return 是否已报名
     */
    function isEnrolledInConference(address _participant, uint _conferenceId) 
        public view conferenceExists(_conferenceId) returns (bool) {
        return conferences[_conferenceId].isEnrolled[_participant];
    }
}
