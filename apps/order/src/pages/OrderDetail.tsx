import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Spin, Alert, Button } from 'antd';
import { useParams, useHistory } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { apiClient, Order } from '@repo/shared';
import 'antd/dist/antd.css';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<Order>(`/users/${id}`);
        setOrder(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load order details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert message="Error" description={error} type="error" showIcon />
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => history.push('/order')}
          style={{ marginTop: '16px' }}
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => history.push('/order')}
        style={{ marginBottom: '16px', paddingLeft: 0 }}
      >
        Back to Orders
      </Button>
      <Spin spinning={loading}>
        {order && (
          <>
            <Card title={`Order #${order.id}`} style={{ marginBottom: '16px' }}>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Order ID">{order.id}</Descriptions.Item>
                <Descriptions.Item label="Customer Name">{order.name}</Descriptions.Item>
                <Descriptions.Item label="Username">{order.username}</Descriptions.Item>
                <Descriptions.Item label="Email">{order.email}</Descriptions.Item>
                <Descriptions.Item label="Phone">{order.phone}</Descriptions.Item>
                <Descriptions.Item label="Website">{order.website}</Descriptions.Item>
              </Descriptions>
            </Card>

            {order.address && (
              <Card title="Shipping Address" style={{ marginBottom: '16px' }}>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Street">{order.address.street}</Descriptions.Item>
                  <Descriptions.Item label="Suite">{order.address.suite}</Descriptions.Item>
                  <Descriptions.Item label="City">{order.address.city}</Descriptions.Item>
                  <Descriptions.Item label="Zipcode">{order.address.zipcode}</Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {order.company && (
              <Card title="Company Information">
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Company Name">{order.company.name}</Descriptions.Item>
                  <Descriptions.Item label="Catch Phrase">{order.company.catchPhrase}</Descriptions.Item>
                  <Descriptions.Item label="BS">{order.company.bs}</Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </>
        )}
      </Spin>
    </div>
  );
};
