import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useWeb3 } from '../context/Web3Context';
import Layout from '../components/Layout';
import MeetingList from '../components/MeetingList';
import CreateMeetingForm from '../components/CreateMeetingForm';
import WalletConnection from '../components/WalletConnection';

export default function Home() {
  const { web3, account, contract, loading } = useWeb3();
  const [activeTab, setActiveTab] = useState('meetings');
  const [meetings, setMeetings] = useState([]);
  const [userMeetings, setUserMeetings] = useState([]);

  const loadMeetings = async () => {
    if (!contract) return;
    
    try {
      const totalMeetings = await contract.methods.getTotalMeetings().call();
      const meetingList = [];
      
      for (let i = 1; i <= totalMeetings; i++) {
        try {
          const meeting = await contract.methods.getMeeting(i).call();
          meetingList.push(meeting);
        } catch (error) {
          console.error(`Error loading meeting ${i}:`, error);
        }
      }
      
      setMeetings(meetingList);
    } catch (error) {
      console.error('Error loading meetings:', error);
    }
  };

  const loadUserMeetings = async () => {
    if (!contract || !account) return;
    
    try {
      const userMeetingIds = await contract.methods.getUserMeetings(account).call();
      const userMeetingList = [];
      
      for (const meetingId of userMeetingIds) {
        try {
          const meeting = await contract.methods.getMeeting(meetingId).call();
          userMeetingList.push(meeting);
        } catch (error) {
          console.error(`Error loading user meeting ${meetingId}:`, error);
        }
      }
      
      setUserMeetings(userMeetingList);
    } catch (error) {
      console.error('Error loading user meetings:', error);
    }
  };

  useEffect(() => {
    if (contract) {
      loadMeetings();
      if (account) {
        loadUserMeetings();
      }
    }
  }, [contract, account]);

  const handleMeetingCreated = () => {
    loadMeetings();
    setActiveTab('meetings');
  };

  const handleRegistrationUpdate = () => {
    loadMeetings();
    loadUserMeetings();
  };

  if (loading) {
    return (
      <Layout>
        <Container className="mt-5">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading Web3...</p>
          </div>
        </Container>
      </Layout>
    );
  }

  if (!web3) {
    return (
      <Layout>
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={8}>
              <Alert variant="warning" className="text-center">
                <h4>Web3 Not Detected</h4>
                <p>Please install MetaMask or another Web3 wallet to use this DApp.</p>
              </Alert>
            </Col>
          </Row>
        </Container>
      </Layout>
    );
  }

  if (!account) {
    return (
      <Layout>
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={6}>
              <WalletConnection />
            </Col>
          </Row>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container className="mt-4">
        <Row>
          <Col>
            <h1 className="text-center mb-4">会议报名 DApp</h1>
            <p className="text-center text-muted mb-4">
              基于以太坊的去中心化会议报名系统
            </p>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-center">
              <Button
                variant={activeTab === 'meetings' ? 'primary' : 'outline-primary'}
                className="me-2"
                onClick={() => setActiveTab('meetings')}
              >
                所有会议
              </Button>
              <Button
                variant={activeTab === 'my-meetings' ? 'primary' : 'outline-primary'}
                className="me-2"
                onClick={() => setActiveTab('my-meetings')}
              >
                我的会议
              </Button>
              <Button
                variant={activeTab === 'create' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveTab('create')}
              >
                创建会议
              </Button>
            </div>
          </Col>
        </Row>

        <Row>
          <Col>
            {activeTab === 'meetings' && (
              <Card>
                <Card.Header>
                  <h5 className="mb-0">所有会议</h5>
                </Card.Header>
                <Card.Body>
                  <MeetingList 
                    meetings={meetings} 
                    onRegistrationUpdate={handleRegistrationUpdate}
                    currentAccount={account}
                  />
                </Card.Body>
              </Card>
            )}

            {activeTab === 'my-meetings' && (
              <Card>
                <Card.Header>
                  <h5 className="mb-0">我参加的会议</h5>
                </Card.Header>
                <Card.Body>
                  <MeetingList 
                    meetings={userMeetings} 
                    onRegistrationUpdate={handleRegistrationUpdate}
                    currentAccount={account}
                    showMyMeetings={true}
                  />
                </Card.Body>
              </Card>
            )}

            {activeTab === 'create' && (
              <Card>
                <Card.Header>
                  <h5 className="mb-0">创建新会议</h5>
                </Card.Header>
                <Card.Body>
                  <CreateMeetingForm onMeetingCreated={handleMeetingCreated} />
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}
