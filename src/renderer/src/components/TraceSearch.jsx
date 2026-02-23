import React, { useState, useEffect } from 'react'
import { Upload, Input, Button, Card, Image, Typography, Progress, Alert, Space, Spin, Tag } from 'antd'
import { InboxOutlined, SearchOutlined, UploadOutlined, LinkOutlined, CopyOutlined } from '@ant-design/icons'

const { Dragger } = Upload
const { Text, Title } = Typography

function formatTime(sec) {
  if (!sec && sec !== 0) return '-'
  const s = Math.floor(sec)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

export default function TraceSearch() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  const featured = results && results.length > 0 ? results[0] : null

  // Handle paste event
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let item of items) {
        if (item.type.indexOf('image') === 0) {
          const file = item.getAsFile()
          if (file) {
            searchByFile(file)
          }
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  async function searchByUrl(url) {
    if (!url) return
    setLoading(true)
    setError(null)
    setResults([])
    try {
      console.log('TraceSearch: searchByUrl ->', url)
      const data = await window.api.searchByUrl(url)
      console.log('TraceSearch: searchByUrl result', data)
      setResults(data.result.slice(0, 3) || []) // Limit to top 3 results
    } catch (e) {
      console.error('TraceSearch: searchByUrl error', e)
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  async function searchByFile(file) {
    if (!file) return
    setLoading(true)
    setError(null)
    setResults([])
    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setPreviewImage(e.target.result)
      reader.readAsDataURL(file)

      console.log('TraceSearch: searchByFile ->', file.name, file.type, file.size)
      const buffer = await file.arrayBuffer()
      const data = await window.api.searchByFile(buffer, file.name)
      console.log('TraceSearch: searchByFile result', data)
      setResults(data.result.slice(0, 3) || []) // Limit to top 3 results
    } catch (e) {
      console.error('TraceSearch: searchByFile error', e)
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  const uploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    customRequest({ file, onSuccess }) {
      // We handle upload manually, call searchByFile
      searchByFile(file).then(() => onSuccess && onSuccess(null))
    }
  }

  // helper to copy text to clipboard (minimal feedback)
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text || '')
    } catch (e) {
      console.error('copy failed', e)
    }
  }

  // Render a single "panel" for one result (no duplication)
  const ResultPanel = ({ item }) => {
    const title =
      item?.anilist?.title?.english || item?.anilist?.title?.romaji || item?.anilist?.title?.native || 'Unknown'

    return (
      <div
        style={{
          width: '100%',
          borderRadius: 8,
          padding: 12,
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          gap: 12,
          alignItems: 'center'
        }}
      >
        <div style={{ flex: '0 0 120px' }}>
          <Image src={item.image} width={120} height={84} style={{ objectFit: 'cover', borderRadius: 6 }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <Text strong style={{ fontSize: 15, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {title}
              </Text>
              <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>
                Episode: {item.episode ?? '-'} • At: {formatTime(item.from)} • From: {item.filename ?? '-'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <Tag color={item.similarity > 0.8 ? 'green' : item.similarity > 0.6 ? 'gold' : 'default'}>
                {(item.similarity * 100).toFixed(1)}%
              </Tag>
              <div style={{ marginTop: 8, width: 120 }}>
                <Progress percent={Math.round(item.similarity * 100)} size="small" status={item.similarity > 0.7 ? 'success' : 'normal'} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <Button
              size="small"
              icon={<LinkOutlined />}
              onClick={() => {
                if (item.video) window.open(item.video, '_blank')
                else window.open(item.image, '_blank')
              }}
            >
              Open
            </Button>
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(item.image)}
            >
              Copy image URL
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card
      variant="plain"
      styles={{ body: { padding: 16, background: 'transparent' } }}
      style={{ margin: '12px 0', width: '100%' }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 940,
          margin: '0 auto',
          background: '#fff',
          padding: 16,
          borderRadius: 8
        }}
      >
        <Title level={4} style={{ marginBottom: 8 }}>
          Trace.moe Search
        </Title>

        <Space orientation="vertical" style={{ width: '100%' }} size="middle">
          <Text>
            Paste an image URL or upload an image to search which anime/frame it comes from.
          </Text>

          <Input.Search
            placeholder="Image URL"
            enterButton={<Button icon={<SearchOutlined />}>Search</Button>}
            onSearch={(value) => searchByUrl(value)}
            allowClear
          />

          <Dragger {...uploadProps} style={{ padding: 12, width: '100%' }} icon={<InboxOutlined />}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Click or drag image to this area to upload</p>
          </Dragger>

          {previewImage && (
            <div style={{ width: '100%', marginTop: 16, textAlign: 'center' }}>
              <Text style={{ display: 'block', marginBottom: 12, color: '#666' }}>
                Your search image
              </Text>
              <div
                style={{
                  display: 'inline-block',
                  maxWidth: '100%',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  overflow: 'hidden'
                }}
              >
                <img
                  src={previewImage}
                  alt="search preview"
                  style={{ maxWidth: 400, height: 'auto', display: 'block' }}
                />
              </div>

              {results && results.length > 0 && results[0].anilist && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    background: '#f5f5f5',
                    borderRadius: 6,
                    textAlign: 'left',
                    maxWidth: 400,
                    margin: '12px auto 0'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, color: '#0f1720' }}>
                    {results[0].anilist.title.english ||
                      results[0].anilist.title.romaji ||
                      results[0].anilist.title.native}
                  </div>
                  <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>
                    <div>Episode: {results[0].episode ?? '-'}</div>
                    <div>Similarity: {(results[0].similarity * 100).toFixed(2)}%</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: 12 }}>
              <Spin />
            </div>
          )}

          {error && <Alert type="error" title="Error" description={error} />}
          {results && results.length > 0 && (
            <div style={{ width: '100%', overflow: 'auto', marginTop: 12 }}>
              {results.map((item, idx) => (
                <div key={idx} style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
                  {/* Одна карточка результата (без дублирования) */}
                  <ResultPanel item={item} />
                </div>
              ))}
            </div>
          )}
        </Space>
      </div>
    </Card>
  )
}
