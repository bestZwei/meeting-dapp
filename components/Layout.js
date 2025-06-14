import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useWeb3 } from '../context/Web3Context';

export default function Layout({ children }) {
  const { account, disconnectWallet } = useWeb3();

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="/">
            <strong>会议报名 DApp</strong>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {account && (
                <>
                  <Nav.Item className="d-flex align-items-center me-3">
                    <span className="text-light">
                      账户: {shortenAddress(account)}
                    </span>
                  </Nav.Item>
                  <Button 
                    variant="outline-light" 
                    size="sm"
                    onClick={disconnectWallet}
                  >
                    断开连接
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <main>
        {children}
      </main>
      
      <footer className="bg-light mt-5 py-4">
        <Container>
          <div className="text-center text-muted">
            <p>&copy; 2025 会议报名 DApp. 基于以太坊区块链技术.</p>
          </div>
        </Container>
      </footer>
    </>
  );
}
