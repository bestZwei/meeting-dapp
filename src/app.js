// Web3和合约实例
let web3;
let contract;
let accounts;
let currentAccount;
let isAdmin = false;

// 合约ABI (需要在部署后从build/contracts/Enrollment.json中获取)
const contractABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "uint256", "name": "conferenceId", "type": "uint256"},
            {"indexed": false, "internalType": "string", "name": "name", "type": "string"}
        ],
        "name": "ConferenceExpire",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "trustee", "type": "address"},
            {"indexed": true, "internalType": "address", "name": "participant", "type": "address"},
            {"indexed": true, "internalType": "uint256", "name": "conferenceId", "type": "uint256"}
        ],
        "name": "DelegateEnrollment",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "participant", "type": "address"},
            {"indexed": true, "internalType": "uint256", "name": "conferenceId", "type": "uint256"}
        ],
        "name": "EnrollmentSuccess",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "participant", "type": "address"},
            {"indexed": true, "internalType": "uint256", "name": "conferenceId", "type": "uint256"}
        ],
        "name": "MyNewConference",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "uint256", "name": "conferenceId", "type": "uint256"},
            {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
            {"indexed": false, "internalType": "uint256", "name": "maxParticipants", "type": "uint256"}
        ],
        "name": "NewConference",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "participant", "type": "address"},
            {"indexed": false, "internalType": "string", "name": "name", "type": "string"}
        ],
        "name": "ParticipantRegistered",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "administrator",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "_trustee", "type": "address"}],
        "name": "delegate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "destruct",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_conferenceId", "type": "uint256"}],
        "name": "enroll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "_participant", "type": "address"},
            {"internalType": "uint256", "name": "_conferenceId", "type": "uint256"}
        ],
        "name": "enrollFor",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_conferenceId", "type": "uint256"}],
        "name": "getConferenceInfo",
        "outputs": [
            {"internalType": "string", "name": "name", "type": "string"},
            {"internalType": "uint256", "name": "maxParticipants", "type": "uint256"},
            {"internalType": "uint256", "name": "currentParticipants", "type": "uint256"},
            {"internalType": "bool", "name": "isFull", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getConferenceCount",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "_participant", "type": "address"}],
        "name": "getParticipantInfo",
        "outputs": [
            {"internalType": "string", "name": "name", "type": "string"},
            {"internalType": "bool", "name": "isRegistered", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "_participant", "type": "address"},
            {"internalType": "uint256", "name": "_conferenceId", "type": "uint256"}
        ],
        "name": "isEnrolledInConference",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_name", "type": "string"},
            {"internalType": "uint256", "name": "_maxParticipants", "type": "uint256"}
        ],
        "name": "newConference",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "queryConfList",
        "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "queryMyConf",
        "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "_name", "type": "string"}],
        "name": "signUp",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// 合约地址 (需要在部署后填入)
const contractAddress = "0x1910B06B3eE4ef40bC0affC8e502A1e41BB12241"; // 请在部署合约后填入实际地址

// 页面加载完成后初始化
window.addEventListener('load', async () => {
    await initializeApp();
    setupEventListeners();
    setupContractEventListeners();
});

// 初始化应用
async function initializeApp() {
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask已安装');
        web3 = new Web3(window.ethereum);
        
        // 监听账户变化
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());
        
    } else {
        showStatus('请安装MetaMask钱包！', 'error');
        return;
    }
    
    // 如果合约地址已配置，初始化合约
    if (contractAddress) {
        contract = new web3.eth.Contract(contractABI, contractAddress);
    } else {
        showStatus('请先部署合约并配置合约地址！', 'warning');
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 连接钱包
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    
    // 用户注册
    document.getElementById('signUpBtn').addEventListener('click', signUp);
    
    // 创建会议
    document.getElementById('createConferenceBtn').addEventListener('click', createConference);
    
    // 设置委托
    document.getElementById('delegateBtn').addEventListener('click', setDelegate);
    
    // 委托报名
    document.getElementById('enrollForBtn').addEventListener('click', enrollForParticipant);
    
    // 刷新会议列表
    document.getElementById('refreshConferencesBtn').addEventListener('click', loadAvailableConferences);
    
    // 刷新我的会议
    document.getElementById('refreshMyConferencesBtn').addEventListener('click', loadMyConferences);
}

// 设置合约事件监听器
function setupContractEventListeners() {
    if (!contract) return;
    
    // 监听新会议创建事件
    contract.events.NewConference()
        .on('data', (event) => {
            console.log('新会议创建:', event.returnValues);
            showStatus(`新会议"${event.returnValues.name}"已创建！`, 'success');
            loadAvailableConferences();
            updateDelegateConferenceOptions();
        });
    
    // 监听会议满员事件
    contract.events.ConferenceExpire()
        .on('data', (event) => {
            console.log('会议已满员:', event.returnValues);
            showStatus(`会议"${event.returnValues.name}"已满员！`, 'warning');
            loadAvailableConferences();
        });
    
    // 监听报名成功事件
    contract.events.EnrollmentSuccess()
        .on('data', (event) => {
            console.log('报名成功:', event.returnValues);
            if (event.returnValues.participant.toLowerCase() === currentAccount.toLowerCase()) {
                showStatus('报名成功！', 'success');
                loadMyConferences();
            }
        });
    
    // 监听用户注册事件
    contract.events.ParticipantRegistered()
        .on('data', (event) => {
            console.log('用户注册:', event.returnValues);
            if (event.returnValues.participant.toLowerCase() === currentAccount.toLowerCase()) {
                showStatus(`用户 ${event.returnValues.name} 注册成功！`, 'success');
            }
        });
}

// 连接钱包
async function connectWallet() {
    try {
        document.getElementById('connectionStatus').classList.remove('hidden');
        
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        currentAccount = accounts[0];
        
        await updateAccountInfo();
        await checkAdminStatus();
        
        document.getElementById('accountInfo').classList.remove('hidden');
        document.getElementById('connectionStatus').classList.add('hidden');
        
        showStatus('钱包连接成功！', 'success');
        
        // 加载数据
        await loadAvailableConferences();
        await loadMyConferences();
        await updateDelegateConferenceOptions();
        
    } catch (error) {
        console.error('连接钱包失败:', error);
        showStatus('连接钱包失败: ' + error.message, 'error');
        document.getElementById('connectionStatus').classList.add('hidden');
    }
}

// 处理账户变化
async function handleAccountsChanged(newAccounts) {
    if (newAccounts.length === 0) {
        // 用户断开连接
        currentAccount = null;
        document.getElementById('accountInfo').classList.add('hidden');
        showStatus('钱包已断开连接', 'warning');
    } else {
        currentAccount = newAccounts[0];
        await updateAccountInfo();
        await checkAdminStatus();
        await loadMyConferences();
    }
}

// 更新账户信息
async function updateAccountInfo() {
    if (!currentAccount) return;
    
    const balance = await web3.eth.getBalance(currentAccount);
    const balanceInEth = web3.utils.fromWei(balance, 'ether');
    
    document.getElementById('currentAccount').textContent = 
        currentAccount.slice(0, 6) + '...' + currentAccount.slice(-4);
    document.getElementById('accountBalance').textContent = 
        parseFloat(balanceInEth).toFixed(4);
}

// 检查管理员状态
async function checkAdminStatus() {
    if (!contract || !currentAccount) return;
    
    try {
        const admin = await contract.methods.administrator().call();
        isAdmin = admin.toLowerCase() === currentAccount.toLowerCase();
        
        const adminPanel = document.getElementById('adminPanel');
        if (isAdmin) {
            adminPanel.style.display = 'block';
            showStatus('您是管理员，可以创建会议！', 'success');
        } else {
            adminPanel.style.display = 'none';
        }
    } catch (error) {
        console.error('检查管理员状态失败:', error);
    }
}

// 用户注册
async function signUp() {
    if (!contract || !currentAccount) {
        showStatus('请先连接钱包！', 'error');
        return;
    }
    
    const userName = document.getElementById('userName').value.trim();
    if (!userName) {
        showStatus('请输入用户姓名！', 'error');
        return;
    }
    
    try {
        showStatus('正在注册...', 'warning');
        
        await contract.methods.signUp(userName).send({ from: currentAccount });
        
        document.getElementById('userName').value = '';
        
    } catch (error) {
        console.error('注册失败:', error);
        showStatus('注册失败: ' + error.message, 'error');
    }
}

// 创建会议
async function createConference() {
    if (!contract || !currentAccount || !isAdmin) {
        showStatus('只有管理员可以创建会议！', 'error');
        return;
    }
    
    const conferenceName = document.getElementById('conferenceName').value.trim();
    const maxParticipants = document.getElementById('maxParticipants').value;
    
    if (!conferenceName || !maxParticipants) {
        showStatus('请填写完整的会议信息！', 'error');
        return;
    }
    
    if (parseInt(maxParticipants) <= 0) {
        showStatus('最大参与人数必须大于0！', 'error');
        return;
    }
    
    try {
        showStatus('正在创建会议...', 'warning');
        
        await contract.methods.newConference(conferenceName, parseInt(maxParticipants))
            .send({ from: currentAccount });
        
        document.getElementById('conferenceName').value = '';
        document.getElementById('maxParticipants').value = '';
        
    } catch (error) {
        console.error('创建会议失败:', error);
        showStatus('创建会议失败: ' + error.message, 'error');
    }
}

// 设置委托
async function setDelegate() {
    if (!contract || !currentAccount) {
        showStatus('请先连接钱包！', 'error');
        return;
    }
    
    const trusteeAddress = document.getElementById('trusteeAddress').value.trim();
    if (!trusteeAddress) {
        showStatus('请输入受托方地址！', 'error');
        return;
    }
    
    if (!web3.utils.isAddress(trusteeAddress)) {
        showStatus('请输入有效的以太坊地址！', 'error');
        return;
    }
    
    try {
        showStatus('正在设置委托...', 'warning');
        
        await contract.methods.delegate(trusteeAddress).send({ from: currentAccount });
        
        showStatus('委托设置成功！', 'success');
        document.getElementById('trusteeAddress').value = '';
        
    } catch (error) {
        console.error('设置委托失败:', error);
        showStatus('设置委托失败: ' + error.message, 'error');
    }
}

// 委托报名
async function enrollForParticipant() {
    if (!contract || !currentAccount) {
        showStatus('请先连接钱包！', 'error');
        return;
    }
    
    const participantAddress = document.getElementById('participantAddress').value.trim();
    const conferenceId = document.getElementById('delegateConferenceId').value;
    
    if (!participantAddress || !conferenceId) {
        showStatus('请填写完整的委托报名信息！', 'error');
        return;
    }
    
    if (!web3.utils.isAddress(participantAddress)) {
        showStatus('请输入有效的委托方地址！', 'error');
        return;
    }
    
    try {
        showStatus('正在代理报名...', 'warning');
        
        await contract.methods.enrollFor(participantAddress, parseInt(conferenceId))
            .send({ from: currentAccount });
        
        showStatus('代理报名成功！', 'success');
        document.getElementById('participantAddress').value = '';
        document.getElementById('delegateConferenceId').value = '';
        
    } catch (error) {
        console.error('代理报名失败:', error);
        showStatus('代理报名失败: ' + error.message, 'error');
    }
}

// 报名会议
async function enrollConference(conferenceId) {
    if (!contract || !currentAccount) {
        showStatus('请先连接钱包！', 'error');
        return;
    }
    
    try {
        showStatus('正在报名...', 'warning');
        
        await contract.methods.enroll(conferenceId).send({ from: currentAccount });
        
        await loadAvailableConferences();
        
    } catch (error) {
        console.error('报名失败:', error);
        showStatus('报名失败: ' + error.message, 'error');
    }
}

// 加载可报名会议列表
async function loadAvailableConferences() {
    if (!contract) {
        document.getElementById('conferencesList').innerHTML = 
            '<p style="text-align: center; color: #999;">请先配置合约地址</p>';
        return;
    }
    
    try {
        const availableConferenceIds = await contract.methods.queryConfList().call();
        const conferencesContainer = document.getElementById('conferencesList');
        
        if (availableConferenceIds.length === 0) {
            conferencesContainer.innerHTML = 
                '<p style="text-align: center; color: #999;">暂无可报名会议</p>';
            return;
        }
        
        let conferencesHTML = '';
        
        for (let conferenceId of availableConferenceIds) {
            const conferenceInfo = await contract.methods.getConferenceInfo(conferenceId).call();
            const isEnrolled = currentAccount ? 
                await contract.methods.isEnrolledInConference(currentAccount, conferenceId).call() : false;
            
            conferencesHTML += `
                <div class="conference-item">
                    <h3>${conferenceInfo.name}</h3>
                    <div class="conference-info">
                        <span>📊 ${conferenceInfo.currentParticipants}/${conferenceInfo.maxParticipants} 人</span>
                        <span>🏷️ ID: ${conferenceId}</span>
                    </div>
                    ${currentAccount ? (isEnrolled ? 
                        '<button class="btn" disabled>已报名</button>' : 
                        `<button class="btn" onclick="enrollConference(${conferenceId})">立即报名</button>`
                    ) : '<p style="color: #999;">请先连接钱包</p>'}
                </div>
            `;
        }
        
        conferencesContainer.innerHTML = conferencesHTML;
        
    } catch (error) {
        console.error('加载会议列表失败:', error);
        document.getElementById('conferencesList').innerHTML = 
            '<p style="text-align: center; color: #f56565;">加载失败: ' + error.message + '</p>';
    }
}

// 加载我的报名会议
async function loadMyConferences() {
    if (!contract || !currentAccount) {
        document.getElementById('myConferencesList').innerHTML = 
            '<p style="text-align: center; color: #999;">请先连接钱包</p>';
        return;
    }
    
    try {
        const myConferenceIds = await contract.methods.queryMyConf().call({ from: currentAccount });
        const myConferencesContainer = document.getElementById('myConferencesList');
        
        if (myConferenceIds.length === 0) {
            myConferencesContainer.innerHTML = 
                '<p style="text-align: center; color: #999;">您还没有报名任何会议</p>';
            return;
        }
        
        let myConferencesHTML = '';
        
        for (let conferenceId of myConferenceIds) {
            const conferenceInfo = await contract.methods.getConferenceInfo(conferenceId).call();
            
            myConferencesHTML += `
                <div class="conference-item">
                    <h3>${conferenceInfo.name}</h3>
                    <div class="conference-info">
                        <span>📊 ${conferenceInfo.currentParticipants}/${conferenceInfo.maxParticipants} 人</span>
                        <span>🏷️ ID: ${conferenceId}</span>
                        <span style="color: #48bb78;">✅ 已报名</span>
                    </div>
                </div>
            `;
        }
        
        myConferencesContainer.innerHTML = myConferencesHTML;
        
    } catch (error) {
        console.error('加载我的会议失败:', error);
        document.getElementById('myConferencesList').innerHTML = 
            '<p style="text-align: center; color: #f56565;">加载失败: ' + error.message + '</p>';
    }
}

// 更新委托会议选项
async function updateDelegateConferenceOptions() {
    if (!contract) return;
    
    try {
        const availableConferenceIds = await contract.methods.queryConfList().call();
        const selectElement = document.getElementById('delegateConferenceId');
        
        selectElement.innerHTML = '<option value="">请选择会议</option>';
        
        for (let conferenceId of availableConferenceIds) {
            const conferenceInfo = await contract.methods.getConferenceInfo(conferenceId).call();
            selectElement.innerHTML += `
                <option value="${conferenceId}">${conferenceInfo.name} (ID: ${conferenceId})</option>
            `;
        }
        
    } catch (error) {
        console.error('更新委托会议选项失败:', error);
    }
}

// 显示状态消息
function showStatus(message, type) {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
    statusElement.classList.remove('hidden');
    
    // 3秒后自动隐藏
    setTimeout(() => {
        statusElement.classList.add('hidden');
    }, 3000);
}

// 工具函数：格式化地址
function formatAddress(address) {
    return address.slice(0, 6) + '...' + address.slice(-4);
}
