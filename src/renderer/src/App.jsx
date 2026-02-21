import React from 'react'
import TraceSearch from './components/TraceSearch'

import 'antd/dist/reset.css'
import { Layout, Row, Col, Button, Space, Typography } from 'antd'
import { SearchOutlined, LinkOutlined } from '@ant-design/icons'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        className="app-header"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <div
          className="app-header-left"
          style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}
        >
          <div style={{ fontSize: 24, color: '#fff' }}>
            <SearchOutlined />
          </div>
          <div style={{ minWidth: 0 }}>
            <Title
              level={4}
              className="app-title"
              style={{ margin: 0, lineHeight: 1, fontWeight: 700, color: '#fff' }}
            >
              TraceFinder
            </Title>
            <Text className="app-subtitle" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
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
            style={{ color: '#fff', fontWeight: 500 }}
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

      <Footer style={{ textAlign: 'center', background: '#fff', color: '#666', marginTop: 'auto' }}>
        TraceFinder © 2026 • Powered by <a href="https://trace.moe" target="_blank" rel="noreferrer" style={{ color: '#667eea' }}>trace.moe</a>
      </Footer>
    </Layout>
  )
}

export default App
