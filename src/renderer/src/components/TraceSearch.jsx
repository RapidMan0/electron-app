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

  // Render a single "panel" for one result (no duplication) — made larger
  const ResultPanel = ({ item }) => {
    const title =
      item?.anilist?.title?.english || item?.anilist?.title?.romaji || item?.anilist?.title?.native || 'Unknown'
    const engTitle = item?.anilist?.title?.english

    return (
      <div
        style={{
          width: '100%',
          borderRadius: 10,
          padding: 20,
          background: '#fff',
          boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
          display: 'flex',
          gap: 16,
          alignItems: 'center'
        }}
      >
        <div style={{ flex: '0 0 160px' }}>
          <Image src={item.image} width={160} height={110} style={{ objectFit: 'cover', borderRadius: 8 }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <Text strong style={{ fontSize: 17, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {title}
              </Text>
              <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
                Episode: {item.episode ?? '-'} • At: {formatTime(item.from)} • From: {item.filename ?? '-'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <Tag style={{ fontSize: 14 }} color={item.similarity > 0.8 ? 'green' : item.similarity > 0.6 ? 'gold' : 'default'}>
                {(item.similarity * 100).toFixed(1)}%
              </Tag>
              <div style={{ marginTop: 10, width: 160 }}>
                <Progress percent={Math.round(item.similarity * 100)} size="small" status={item.similarity > 0.7 ? 'success' : 'normal'} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <Button
              size="middle"
              icon={<LinkOutlined />}
              onClick={() => {
                if (item.video) window.open(item.video, '_blank')
                else window.open(item.image, '_blank')
              }}
            >
              Open
            </Button>

            <Button
              size="middle"
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(item.image)}
            >
              Copy image URL
            </Button>

            <Button
              size="middle"
              icon={<SearchOutlined />}
              onClick={() => {
                // Open Google search using the English title (engTitle)
                const query = engTitle || ''
                if (query) {
                  window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank')
                }
              }}
            >
              Google
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card
      variant="plain"
      styles={{ body: { padding: 20, background: 'transparent' } }}
      style={{ margin: '16px 0', width: '100%' }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 980,
          margin: '0 auto',
          background: '#fff',
          padding: 20,
          borderRadius: 10
        }}
      >
        <Title level={4} style={{ marginBottom: 10 }}>
          Trace.moe Search
        </Title>

        <Space orientation="vertical" style={{ width: '100%' }} size="large">
          <Text>
            Paste an image URL or upload an image to search which anime/frame it comes from.
          </Text>

          <Input.Search
            placeholder="Image URL"
            enterButton={<Button icon={<SearchOutlined />}>Search</Button>}
            onSearch={(value) => searchByUrl(value)}
            allowClear
          />

          <Dragger {...uploadProps} style={{ padding: 14, width: '100%' }} icon={<InboxOutlined />}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Click or drag image to this area to upload</p>
          </Dragger>

          {previewImage && (
            <div style={{ width: '100%', marginTop: 18, textAlign: 'center' }}>
              <Text style={{ display: 'block', marginBottom: 12, color: '#666' }}>
                Your search image
              </Text>
              <div
                style={{
                  display: 'inline-block',
                  maxWidth: '100%',
                  borderRadius: 10,
                  boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                  overflow: 'hidden'
                }}
              >
                <img
                  src={previewImage}
                  alt="search preview"
                  style={{ maxWidth: 560, height: 'auto', display: 'block' }}
                />
              </div>

              {results && results.length > 0 && results[0].anilist && (
                <div
                  style={{
                    marginTop: 14,
                    padding: 14,
                    background: '#f5f5f5',
                    borderRadius: 8,
                    textAlign: 'left',
                    maxWidth: 560,
                    margin: '14px auto 0'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: '#0f1720' }}>
                    {results[0].anilist.title.english ||
                      results[0].anilist.title.romaji ||
                      results[0].anilist.title.native}
                  </div>
                  <div style={{ fontSize: 15, color: '#666', lineHeight: 1.6 }}>
                    <div>Episode: {results[0].episode ?? '-'}</div>
                    <div>Similarity: {(results[0].similarity * 100).toFixed(2)}%</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: 14 }}>
              <Spin />
            </div>
          )}

          {error && <Alert type="error" title="Error" description={error} />}
          {results && results.length > 0 && (
            <div style={{ width: '100%', overflow: 'auto', marginTop: 14 }}>
              {results.map((item, idx) => (
                <div key={idx} style={{ padding: 20, borderBottom: '1px solid #f0f0f0' }}>
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
