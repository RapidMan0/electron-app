import React from 'react'
import TraceSearch from './components/TraceSearch'

import 'antd/dist/reset.css'
import { Layout, Row, Col, Button, Space, Typography } from 'antd'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        className="app-header"
        style={{
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div
          className="app-header-left"
          style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}
        >
          <div style={{ minWidth: 0 }}>
            <Title
              level={4}
              className="app-title"
              style={{ margin: 0, lineHeight: 1, fontWeight: 700 }}
            >
              TraceFinder
            </Title>
            <Text className="app-subtitle" type="secondary">
              Find anime scenes using the free trace.moe API
            </Text>
          </div>
        </div>

        <Space>
          <Button onClick={() => window.electron.ipcRenderer.send('ping')}>Ping</Button>
          <Button type="link" href="https://trace.moe" target="_blank" rel="noreferrer">
            trace.moe
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
        <Row style={{ width: '100%', maxWidth: 1000 }}>
          <Col span={24}>
            <TraceSearch />
          </Col>
        </Row>
      </Content>

      <Footer style={{ textAlign: 'center' }} />
    </Layout>
  )
}

export default App
