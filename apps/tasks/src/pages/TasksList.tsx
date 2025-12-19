import React, { useEffect, useState } from 'react';
import { Table, Spin, Alert, Button, Tag } from 'antd';
import { useHistory } from 'react-router-dom';
import { apiClient, Task } from '@repo/shared';
import 'antd/dist/antd.css';
import { metrics } from "@repo/metrics";

export const TasksList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        // Запускаем действие перед началом загрузки
        metrics.startAction('LOAD_TASKS', 'xhr');

        const response = await apiClient.get<Task[]>('/todos');
        setTasks(response.data.slice(0, 20)); // Показываем первые 20 задач
        setError(null);

        // Завершаем действие после успешной загрузки
        metrics.leaveAction('LOAD_TASKS');
      } catch (err) {
        setError('Failed to load tasks');
        // Теперь parentActionId будет найден, т.к. действие LOAD_TASKS активно
        metrics.reportError(err, 'LOAD_TASKS');

          // Завершаем действие после ошибки
        metrics.leaveAction('LOAD_TASKS');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Status',
      dataIndex: 'completed',
      key: 'completed',
      width: 120,
      render: (completed: boolean) => (
        <Tag color={completed ? 'green' : 'orange'}>
          {completed ? 'Completed' : 'In Progress'}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_: any, record: Task) => (
        <Button type="link" onClick={() => history.push(`/tasks/${record.id}`)}>
          View Details
        </Button>
      ),
    },
  ];

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>Tasks List</h1>
      <Spin spinning={loading}>
        <Table
          dataSource={tasks}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </div>
  );
};