import React from 'react'
import TraceSearch from './components/TraceSearch'

import 'antd/dist/reset.css'
import { Layout, Row, Col, Button, Space, Typography } from 'antd'
import { SearchOutlined, LinkOutlined } from '@ant-design/icons'

const { Header, Content } = Layout
const { Title, Text } = Typography

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        className="app-header"
        style={{
          background: '#1a1a2e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
      >
        <div
          className="app-header-left"
          style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}
        >
          <div style={{ fontSize: 24, color: '#e2e8f0' }}>
            <SearchOutlined />
          </div>
          <div style={{ minWidth: 0 }}>
            <Title
              level={4}
              className="app-title"
              style={{ margin: 0, lineHeight: 1, fontWeight: 700, color: '#e2e8f0' }}
            >
              TraceFinder
            </Title>
            <Text className="app-subtitle" style={{ color: 'rgba(226,232,240,0.6)', fontSize: 12 }}>
              Identify anime scenes in seconds
            </Text>
          </div>
        </div>

        <Space>
          <Button 
            type="text" 
            icon={<LinkOutlined />}
            href="https://trace.moe" 
            target="_blank" 
            rel="noreferrer"
            style={{ color: '#e2e8f0', fontWeight: 500 }}
          >
            trace.moe
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: 24, display: 'flex', justifyContent: 'center', background: '#f5f5f5', flex: 1 }}>
        <Row style={{ width: '100%', maxWidth: 1000 }}>
          <Col span={24}>
            <TraceSearch />
          </Col>
        </Row>
      </Content>

    </Layout>
  )
}

export default App