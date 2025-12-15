import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Spin, Alert, Button, Tag } from 'antd';
import { useParams, useHistory } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { apiClient, Task } from '@repo/shared';
import 'antd/dist/antd.css';

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<Task>(`/todos/${id}`);
        setTask(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load task details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert message="Error" description={error} type="error" showIcon />
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => history.push('/tasks')}
          style={{ marginTop: '16px' }}
        >
          Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => history.push('/tasks')}
        style={{ marginBottom: '16px', paddingLeft: 0 }}
      >
        Back to Tasks
      </Button>
      <Spin spinning={loading}>
        {task && (
          <Card title={`Task #${task.id}`}>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="ID">{task.id}</Descriptions.Item>
              <Descriptions.Item label="Title">{task.title}</Descriptions.Item>
              <Descriptions.Item label="User ID">{task.userId}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={task.completed ? 'green' : 'orange'}>
                  {task.completed ? 'Completed' : 'In Progress'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Spin>
    </div>
  );
};