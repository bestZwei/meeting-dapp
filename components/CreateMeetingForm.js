import { useState } from 'react';
import { Form, Button, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { useWeb3 } from '../context/Web3Context';
import Web3 from 'web3';

export default function CreateMeetingForm({ onMeetingCreated }) {
  const { contract, account } = useWeb3();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    maxParticipants: '',
    registrationFee: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract || !account) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 验证表单数据
      if (!formData.title.trim()) {
        throw new Error('请输入会议标题');
      }
      
      if (!formData.startDate || !formData.startTime) {
        throw new Error('请选择开始时间');
      }
      
      if (!formData.endDate || !formData.endTime) {
        throw new Error('请选择结束时间');
      }
      
      if (!formData.maxParticipants || formData.maxParticipants <= 0) {
        throw new Error('请输入有效的最大参与人数');
      }

      // 转换时间戳
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      if (startDateTime <= new Date()) {
        throw new Error('开始时间必须在未来');
      }
      
      if (endDateTime <= startDateTime) {
        throw new Error('结束时间必须晚于开始时间');
      }

      const startTime = Math.floor(startDateTime.getTime() / 1000);
      const endTime = Math.floor(endDateTime.getTime() / 1000);
      const maxParticipants = parseInt(formData.maxParticipants);
      const registrationFee = formData.registrationFee ? 
        Web3.utils.toWei(formData.registrationFee, 'ether') : '0';

      // 调用智能合约
      const gasEstimate = await contract.methods.createMeeting(
        formData.title.trim(),
        formData.description.trim(),
        startTime,
        endTime,
        maxParticipants,
        registrationFee
      ).estimateGas({ from: account });

      const result = await contract.methods.createMeeting(
        formData.title.trim(),
        formData.description.trim(),
        startTime,
        endTime,
        maxParticipants,
        registrationFee
      ).send({ 
        from: account,
        gas: Math.floor(gasEstimate * 1.2) // 增加20%的gas余量
      });

      setSuccess('会议创建成功！');
      
      // 重置表单
      setFormData({
        title: '',
        description: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        maxParticipants: '',
        registrationFee: ''
      });

      // 通知父组件
      if (onMeetingCreated) {
        onMeetingCreated();
      }

    } catch (error) {
      console.error('创建会议失败:', error);
      setError(error.message || '创建会议失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>会议标题 *</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="输入会议标题"
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>最大参与人数 *</Form.Label>
              <Form.Control
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                placeholder="例如: 100"
                min="1"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>会议描述</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="输入会议描述（可选）"
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>开始日期 *</Form.Label>
              <Form.Control
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>开始时间 *</Form.Label>
              <Form.Control
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>结束日期 *</Form.Label>
              <Form.Control
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>结束时间 *</Form.Label>
              <Form.Control
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4">
          <Form.Label>报名费用（ETH）</Form.Label>
          <InputGroup>
            <Form.Control
              type="number"
              step="0.001"
              min="0"
              name="registrationFee"
              value={formData.registrationFee}
              onChange={handleChange}
              placeholder="0.000"
            />
            <InputGroup.Text>ETH</InputGroup.Text>
          </InputGroup>
          <Form.Text className="text-muted">
            留空或输入0表示免费会议
          </Form.Text>
        </Form.Group>

        <div className="d-grid">
          <Button 
            type="submit" 
            variant="primary" 
            size="lg"
            disabled={loading || !contract}
          >
            {loading ? '创建中...' : '创建会议'}
          </Button>
        </div>
      </Form>
    </>
  );
}
