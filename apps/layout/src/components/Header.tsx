import React from 'react';
import { Layout } from 'antd';
import 'antd/dist/antd.css';

const { Header: AntHeader } = Layout;

export const Header: React.FC = () => {
  return (
    <AntHeader style={{ background: '#001529', padding: '0 24px' }}>
      <div style={{
        color: 'white',
        fontSize: '20px',
        fontWeight: 'bold',
        lineHeight: '64px'
      }}>
        Module Federation App
      </div>
    </AntHeader>
  );
};

export default Header;