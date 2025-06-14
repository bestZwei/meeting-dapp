import { Card, Button, Alert } from 'react-bootstrap';
import { useWeb3 } from '../context/Web3Context';

export default function WalletConnection() {
  const { connectWallet, error } = useWeb3();

  return (
    <Card className="text-center">
      <Card.Header>
        <h4>连接钱包</h4>
      </Card.Header>
      <Card.Body>
        <p className="mb-4">
          请连接您的以太坊钱包以使用会议报名 DApp
        </p>
        
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}
        
        <Button 
          variant="primary" 
          size="lg"
          onClick={connectWallet}
          className="mb-3"
        >
          连接 MetaMask
        </Button>
        
        <div className="text-muted">
          <small>
            如果您还没有安装 MetaMask，请先前往{' '}
            <a 
              href="https://metamask.io" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              metamask.io
            </a>{' '}
            下载安装。
          </small>
        </div>
      </Card.Body>
    </Card>
  );
}
