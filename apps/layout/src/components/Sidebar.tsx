import React from 'react';
import { Layout, Menu } from 'antd';
import { CheckSquareOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useHistory, useLocation } from 'react-router-dom';
import 'antd/dist/antd.css';

const { Sider } = Layout;

export const Sidebar: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const menuItems = [
    {
      key: '/tasks',
      icon: <CheckSquareOutlined /> as React.ReactNode,
      label: 'Tasks',
    },
    {
      key: '/order',
      icon: <ShoppingOutlined /> as React.ReactNode,
      label: 'Orders',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    history.push(key);
  };

  const getSelectedKey = () => {
    if (location.pathname.startsWith('/tasks')) return '/tasks';
    if (location.pathname.startsWith('/order')) return '/order';
    return location.pathname;
  };

  return (
    <Sider
      width={200}
      style={{
        background: '#fff',
        height: '100vh',
        position: 'fixed',
        left: 0,
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        style={{ height: '100%', borderRight: 0 }}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default Sidebar;