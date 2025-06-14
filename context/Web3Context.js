import { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import contractABI from '../contracts/MeetingRegistration.json';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 合约地址 - 部署后需要更新
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        setWeb3(web3Instance);
        setAccount(accounts[0]);

        // 创建合约实例
        if (CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000') {
          const contractInstance = new web3Instance.eth.Contract(
            contractABI.abi,
            CONTRACT_ADDRESS
          );
          setContract(contractInstance);
        }

        // 监听账户变化
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          } else {
            setAccount(null);
          }
        });

        // 监听网络变化
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });

      } else {
        setError('Please install MetaMask');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setContract(null);
  };

  const initWeb3 = async () => {
    try {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        // 检查是否已经连接
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          
          // 创建合约实例
          if (CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000') {
            const contractInstance = new web3Instance.eth.Contract(
              contractABI.abi,
              CONTRACT_ADDRESS
            );
            setContract(contractInstance);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing Web3:', error);
      setError('Failed to initialize Web3');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initWeb3();
  }, []);

  const value = {
    web3,
    account,
    contract,
    loading,
    error,
    connectWallet,
    disconnectWallet,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};
