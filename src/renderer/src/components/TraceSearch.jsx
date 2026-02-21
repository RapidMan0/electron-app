import React, { useState } from 'react'
import { Upload, Input, Button, Card, Image, Typography, Progress, Alert, Space, Spin } from 'antd'
import { InboxOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons'

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

  const featured = results && results.length > 0 ? results[0] : null

  async function searchByUrl(url) {
    if (!url) return
    setLoading(true)
    setError(null)
    setResults([])
    try {
      const endpoint = `https://api.trace.moe/search?anilistInfo=1&url=${encodeURIComponent(url)}`
      console.log('TraceSearch: searchByUrl ->', endpoint)
      const res = await fetch(endpoint)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status} ${text}`)
      }
      let data
      try {
        data = await res.json()
      } catch (pe) {
        throw new Error('Failed to parse JSON response: ' + pe.message)
      }
      console.log('TraceSearch: searchByUrl result', data)
      setResults(data.result || [])
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
      const form = new FormData()
      form.append('image', file)
      console.log('TraceSearch: searchByFile ->', file.name, file.type, file.size)
      const res = await fetch('https://api.trace.moe/search?anilistInfo=1', {
        method: 'POST',
        body: form
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status} ${text}`)
      }
      let data
      try {
        data = await res.json()
      } catch (pe) {
        throw new Error('Failed to parse JSON response: ' + pe.message)
      }
      console.log('TraceSearch: searchByFile result', data)
      setResults(data.result || [])
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

          {loading && (
            <div style={{ textAlign: 'center', padding: 12 }}>
              <Spin />
            </div>
          )}

          {error && <Alert type="error" title="Error" description={error} />}
          {featured && (
            <div style={{ width: '100%', marginTop: 8 }}>
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  background: '#ffffff',
                  color: '#111827',
                  padding: 16,
                  borderRadius: 8,
                  alignItems: 'flex-start',
                  boxShadow: '0 6px 18px rgba(15,23,42,0.06)',
                  border: '1px solid rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ flex: '1 1 auto' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: '#0f1720' }}>
                    {featured.anilist
                      ? featured.anilist.title.english ||
                        featured.anilist.title.romaji ||
                        featured.anilist.title.native
                      : 'Unknown'}
                  </div>
                  <div style={{ color: '#6b7280', marginBottom: 8 }}>
                    Episode: {featured.episode ?? '-'} • Similarity:{' '}
                    {(featured.similarity * 100).toFixed(2)}%
                  </div>

                  {featured.anilist && featured.anilist.description && (
                    <div
                      style={{
                        color: '#374151',
                        marginTop: 8,
                        lineHeight: 1.4,
                        maxHeight: 140,
                        overflow: 'auto'
                      }}
                      dangerouslySetInnerHTML={{ __html: featured.anilist.description }}
                    />
                  )}

                  <div
                    style={{
                      marginTop: 12,
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr',
                      rowGap: 8,
                      columnGap: 12,
                      alignItems: 'start'
                    }}
                  >
                    <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 700 }}>Alias</div>
                    <div style={{ color: '#111827', fontSize: 13 }}>
                      {featured.anilist && featured.anilist.synonyms && featured.anilist.synonyms.length > 0
                        ? featured.anilist.synonyms.join(', ')
                        : '-'}
                    </div>

                    <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 700 }}>Genre</div>
                    <div style={{ color: '#111827', fontSize: 13 }}>
                      {featured.anilist && featured.anilist.genres && featured.anilist.genres.length > 0
                        ? featured.anilist.genres.join(', ')
                        : '-'}
                    </div>
                  </div>
                </div>

                <div style={{ width: 220, flex: '0 0 220px' }}>
                  <Image
                    src={featured.anilist?.coverImage?.large || featured.image}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: 6,
                      boxShadow: '0 4px 12px rgba(2,6,23,0.08)',
                      background: '#f8fafc'
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          {results && results.length > 1 && (
            <div style={{ width: '100%', overflow: 'auto', marginTop: 12 }}>
              {results.slice(1, 10).map((item, idx) => (
                <div key={idx} style={{ padding: 12, borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: '0 0 120px' }}>
                      <Image
                        src={item.image}
                        style={{
                          maxWidth: 120,
                          width: '100%',
                          height: 'auto',
                          objectFit: 'cover',
                          borderRadius: 4
                        }}
                      />
                    </div>
                    <div style={{ flex: '1 1 auto' }}>
                      <div style={{ wordBreak: 'break-word' }}>
                        <Text strong>
                          {item.anilist
                            ? item.anilist.title.english ||
                              item.anilist.title.romaji ||
                              item.anilist.title.native
                            : 'Unknown'}
                        </Text>
                        <div style={{ fontSize: 12, color: '#888' }}>
                          Episode: {item.episode ?? '-'} • Similarity:{' '}
                          {(item.similarity * 100).toFixed(2)}%
                        </div>
                      </div>
                      <div style={{ wordBreak: 'break-word', marginTop: 6 }}>
                        At: {formatTime(item.from)} • From: {item.filename ?? '-'}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <Progress
                          percent={Math.round(item.similarity * 100)}
                          status={item.similarity > 0.7 ? 'success' : 'normal'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Space>
      </div>
    </Card>
  )
}
