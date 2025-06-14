import { useState } from 'react';
import { Card, Button, Badge, Row, Col, Alert, Modal, Form, InputGroup } from 'react-bootstrap';
import { useWeb3 } from '../context/Web3Context';
import Web3 from 'web3';

export default function MeetingList({ meetings, onRegistrationUpdate, currentAccount, showMyMeetings = false }) {
  const { contract } = useWeb3();
  const [loading, setLoading] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [delegateAddress, setDelegateAddress] = useState('');

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString('zh-CN');
  };

  const formatEther = (wei) => {
    return Web3.utils.fromWei(wei, 'ether');
  };

  const getMeetingStatus = (meeting) => {
    const now = Math.floor(Date.now() / 1000);
    if (!meeting.isActive) return { text: '已取消', variant: 'secondary' };
    if (now >= meeting.endTime) return { text: '已结束', variant: 'dark' };
    if (now >= meeting.startTime) return { text: '进行中', variant: 'warning' };
    if (meeting.currentParticipants >= meeting.maxParticipants) return { text: '已满员', variant: 'danger' };
    return { text: '报名中', variant: 'success' };
  };

  const canRegister = (meeting) => {
    const now = Math.floor(Date.now() / 1000);
    return meeting.isActive && 
           now < meeting.startTime && 
           meeting.currentParticipants < meeting.maxParticipants;
  };

  const handleRegister = async (meetingId, registrationFee) => {
    if (!contract || !currentAccount) return;

    setLoading({ ...loading, [`register_${meetingId}`]: true });
    setError('');
    setSuccess('');

    try {
      const gasEstimate = await contract.methods.registerForMeeting(meetingId)
        .estimateGas({ from: currentAccount, value: registrationFee });

      await contract.methods.registerForMeeting(meetingId).send({
        from: currentAccount,
        value: registrationFee,
        gas: Math.floor(gasEstimate * 1.2)
      });

      setSuccess('报名成功！');
      if (onRegistrationUpdate) onRegistrationUpdate();
    } catch (error) {
      console.error('报名失败:', error);
      setError(error.message || '报名失败');
    } finally {
      setLoading({ ...loading, [`register_${meetingId}`]: false });
    }
  };

  const handleCancelRegistration = async (meetingId) => {
    if (!contract || !currentAccount) return;

    setLoading({ ...loading, [`cancel_${meetingId}`]: true });
    setError('');
    setSuccess('');

    try {
      const gasEstimate = await contract.methods.cancelRegistration(meetingId)
        .estimateGas({ from: currentAccount });

      await contract.methods.cancelRegistration(meetingId).send({
        from: currentAccount,
        gas: Math.floor(gasEstimate * 1.2)
      });

      setSuccess('取消报名成功！');
      if (onRegistrationUpdate) onRegistrationUpdate();
    } catch (error) {
      console.error('取消报名失败:', error);
      setError(error.message || '取消报名失败');
    } finally {
      setLoading({ ...loading, [`cancel_${meetingId}`]: false });
    }
  };

  const handleCancelMeeting = async (meetingId) => {
    if (!contract || !currentAccount) return;

    if (!window.confirm('确定要取消这个会议吗？这将退款给所有参与者。')) {
      return;
    }

    setLoading({ ...loading, [`cancelMeeting_${meetingId}`]: true });
    setError('');
    setSuccess('');

    try {
      const gasEstimate = await contract.methods.cancelMeeting(meetingId)
        .estimateGas({ from: currentAccount });

      await contract.methods.cancelMeeting(meetingId).send({
        from: currentAccount,
        gas: Math.floor(gasEstimate * 1.2)
      });

      setSuccess('会议已取消！');
      if (onRegistrationUpdate) onRegistrationUpdate();
    } catch (error) {
      console.error('取消会议失败:', error);
      setError(error.message || '取消会议失败');
    } finally {
      setLoading({ ...loading, [`cancelMeeting_${meetingId}`]: false });
    }
  };

  const handleDelegateRegister = async () => {
    if (!contract || !currentAccount || !selectedMeeting || !delegateAddress) return;

    setLoading({ ...loading, [`delegate_${selectedMeeting.id}`]: true });
    setError('');
    setSuccess('');

    try {
      // 检查是否有委托权限
      const hasPermission = await contract.methods
        .hasDelegatePermission(delegateAddress, currentAccount).call();
      
      if (!hasPermission) {
        throw new Error('您没有代表该用户报名的权限');
      }

      const gasEstimate = await contract.methods
        .delegateRegister(selectedMeeting.id, delegateAddress)
        .estimateGas({ from: currentAccount, value: selectedMeeting.registrationFee });

      await contract.methods
        .delegateRegister(selectedMeeting.id, delegateAddress).send({
          from: currentAccount,
          value: selectedMeeting.registrationFee,
          gas: Math.floor(gasEstimate * 1.2)
        });

      setSuccess('委托报名成功！');
      setShowDelegateModal(false);
      setDelegateAddress('');
      setSelectedMeeting(null);
      if (onRegistrationUpdate) onRegistrationUpdate();
    } catch (error) {
      console.error('委托报名失败:', error);
      setError(error.message || '委托报名失败');
    } finally {
      setLoading({ ...loading, [`delegate_${selectedMeeting.id}`]: false });
    }
  };

  const openDelegateModal = (meeting) => {
    setSelectedMeeting(meeting);
    setShowDelegateModal(true);
  };

  if (!meetings || meetings.length === 0) {
    return (
      <Alert variant="info" className="text-center">
        {showMyMeetings ? '您还没有参加任何会议' : '暂无会议'}
      </Alert>
    );
  }

  return (
    <>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
      
      <Row>
        {meetings.map((meeting) => {
          const status = getMeetingStatus(meeting);
          const isOrganizer = meeting.organizer.toLowerCase() === currentAccount?.toLowerCase();
          
          return (
            <Col key={meeting.id} lg={6} xl={4} className="mb-4">
              <Card className="h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">{meeting.title}</h6>
                  <Badge bg={status.variant}>{status.text}</Badge>
                </Card.Header>
                <Card.Body>
                  {meeting.description && (
                    <Card.Text className="text-muted small">
                      {meeting.description}
                    </Card.Text>
                  )}
                  
                  <div className="mb-2">
                    <small className="text-muted">开始时间:</small><br />
                    <small>{formatDate(meeting.startTime)}</small>
                  </div>
                  
                  <div className="mb-2">
                    <small className="text-muted">结束时间:</small><br />
                    <small>{formatDate(meeting.endTime)}</small>
                  </div>
                  
                  <div className="mb-2">
                    <small className="text-muted">参与人数:</small><br />
                    <small>{meeting.currentParticipants} / {meeting.maxParticipants}</small>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted">报名费:</small><br />
                    <small>
                      {meeting.registrationFee === '0' ? '免费' : `${formatEther(meeting.registrationFee)} ETH`}
                    </small>
                  </div>
                  
                  {isOrganizer && (
                    <Badge bg="primary" className="mb-2">我创建的</Badge>
                  )}
                </Card.Body>
                
                <Card.Footer>
                  {isOrganizer && meeting.isActive ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancelMeeting(meeting.id)}
                      disabled={loading[`cancelMeeting_${meeting.id}`]}
                    >
                      {loading[`cancelMeeting_${meeting.id}`] ? '取消中...' : '取消会议'}
                    </Button>
                  ) : canRegister(meeting) ? (
                    <div className="d-grid gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleRegister(meeting.id, meeting.registrationFee)}
                        disabled={loading[`register_${meeting.id}`]}
                      >
                        {loading[`register_${meeting.id}`] ? '报名中...' : '立即报名'}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => openDelegateModal(meeting)}
                      >
                        委托报名
                      </Button>
                    </div>
                  ) : showMyMeetings && canRegister(meeting) ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancelRegistration(meeting.id)}
                      disabled={loading[`cancel_${meeting.id}`]}
                    >
                      {loading[`cancel_${meeting.id}`] ? '取消中...' : '取消报名'}
                    </Button>
                  ) : null}
                </Card.Footer>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* 委托报名模态框 */}
      <Modal show={showDelegateModal} onHide={() => setShowDelegateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>委托报名</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>为其他用户代理报名会议：<strong>{selectedMeeting?.title}</strong></p>
          <Form.Group className="mb-3">
            <Form.Label>用户地址</Form.Label>
            <Form.Control
              type="text"
              placeholder="输入用户的以太坊地址"
              value={delegateAddress}
              onChange={(e) => setDelegateAddress(e.target.value)}
            />
            <Form.Text className="text-muted">
              该用户必须已经授权您代理报名权限
            </Form.Text>
          </Form.Group>
          {selectedMeeting && selectedMeeting.registrationFee !== '0' && (
            <Alert variant="info">
              报名费: {formatEther(selectedMeeting.registrationFee)} ETH
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDelegateModal(false)}>
            取消
          </Button>
          <Button 
            variant="primary" 
            onClick={handleDelegateRegister}
            disabled={!delegateAddress || loading[`delegate_${selectedMeeting?.id}`]}
          >
            {loading[`delegate_${selectedMeeting?.id}`] ? '报名中...' : '确认报名'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
