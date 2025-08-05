import { FunctionComponent, useState, useMemo, useEffect } from "react"
import { ProtoSchema, ProtobufDecodedData } from "@/types/Protobuf"
import { decodeProtobufMessage, getMessageTypes, autoDetectMessageType } from "@/utils/protobuf"
import protoApi from "@/api/proto"
import { schemaDiscovery, DiscoveredMessage } from "@/services/ProtoSchemaDiscovery"
import TextCmp from "../text/TextCmp"
import { JsonPropsCmp } from "../json/JsonCmp"

interface Props {
  text?: string
  style?: React.CSSProperties
}

const ProtobufCmp: FunctionComponent<Props> = ({
  text,
  style,
}) => {
  // Feature flag for analysis results (enable only with URL param)
  const showAnalysisResults = new URLSearchParams(window.location.search).has('proto-analysis')
  const [schemas, setSchemas] = useState<ProtoSchema[]>([])
  const [selectedSchema, setSelectedSchema] = useState<string>("")
  const [selectedMessageType, setSelectedMessageType] = useState<string>("")
  const [decodedData, setDecodedData] = useState<ProtobufDecodedData | null>(null)
  const [isLoadingBackendSchemas, setIsLoadingBackendSchemas] = useState(false)
  const [discoveredMessages, setDiscoveredMessages] = useState<DiscoveredMessage[]>([])
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [showSchemaControls, setShowSchemaControls] = useState(false)

  const availableMessageTypes = useMemo(() => {
    const schema = schemas.find(s => s.name === selectedSchema || s.id === selectedSchema)
    return schema ? getMessageTypes(schema) : []
  }, [schemas, selectedSchema])

  // Load schemas from backend on component mount
  useEffect(() => {
    loadBackendSchemas()
  }, [])

  // Reset state and auto-select when text changes
  useEffect(() => {
    // Reset state
    setSelectedSchema("")
    setSelectedMessageType("")
    setDiscoveredMessages([])
    setShowSchemaControls(false)
    
    // Auto-select first schema if available and no text-specific analysis needed
    if (schemas.length > 0 && !text) {
      const firstSchema = schemas[0]
      setSelectedSchema(firstSchema.id || firstSchema.name)
      
      if (!firstSchema.error) {
        const messageTypes = getMessageTypes(firstSchema)
        if (messageTypes.length > 0) {
          setSelectedMessageType(messageTypes[0])
        }
      }
    }
    
    // Always run smart detection
    const autoDetect = async () => {
      if (text && text.length > 0 && schemas.length > 0 && !isDiscovering) {
        if (showAnalysisResults) {
          console.log('🔄 Auto-detecting protobuf schema...')
        }
        
        setIsDiscovering(true)
        
        try {
          // Trigger analysis of all schemas
          const allMessages = await schemaDiscovery.discoverMessageTypes()
          if (showAnalysisResults) {
            setDiscoveredMessages(allMessages)
          }
          
          // Find best matching messages for the binary data
          const matchingMessages = await schemaDiscovery.findMatchingMessageTypes(text)
          
          if (matchingMessages.length > 0) {
            const firstMatch = matchingMessages[0]
            setSelectedSchema(firstMatch.schemaId)
            setSelectedMessageType(firstMatch.messageType)
            if (showAnalysisResults) {
              console.log(`✅ Auto-selected: ${firstMatch.schemaName} → ${firstMatch.messageType}`)
            }
          }
        } catch (error) {
          if (showAnalysisResults) {
            console.error('Failed to perform auto-detection:', error)
          }
        } finally {
          setIsDiscovering(false)
        }
      }
    }
    
    if (text && schemas.length > 0) {
      autoDetect()
    }
  }, [text, schemas.length, showAnalysisResults])

  const loadBackendSchemas = async () => {
    setIsLoadingBackendSchemas(true)
    try {
      // Clear the discovery service cache when refreshing
      schemaDiscovery.clearCache()
      const backendSchemas = await protoApi.index()
      
      // Parse backend schemas
      const parsedSchemas = await Promise.all(
        backendSchemas.map(async (schema) => {
          try {
            const { parseProtoSchema } = await import('@/utils/protobuf')
            const parsed = parseProtoSchema(schema.content, schema.name)
            return {
              ...schema,
              root: parsed.root,
              error: parsed.error
            }
          } catch (error) {
            return {
              ...schema,
              root: null,
              error: `Failed to parse: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          }
        })
      )

      setSchemas(parsedSchemas)
    } catch (error) {
      console.error('Failed to load backend schemas:', error)
    } finally {
      setIsLoadingBackendSchemas(false)
    }
  }

  useEffect(() => {
    if (!text || !selectedSchema || !selectedMessageType) {
      setDecodedData(null)
      return
    }

    const schema = schemas.find(s => s.name === selectedSchema || s.id === selectedSchema)
    if (!schema) return

    const result = decodeProtobufMessage(text, schema, selectedMessageType)
    setDecodedData(result)
  }, [text, selectedSchema, selectedMessageType, schemas])


  const handleAutoDetect = async () => {
    if (!text) return
    
    if (selectedSchema) {
      // Use existing schema-specific auto-detection
      const schema = schemas.find(s => s.name === selectedSchema || s.id === selectedSchema)
      if (schema) {
        const detectedType = autoDetectMessageType(text, schema)
        if (detectedType) {
          setSelectedMessageType(detectedType)
          return
        }
      }
    }

    // Lazy discovery across all schemas
    setIsDiscovering(true)
    try {
      const matchingMessages = await schemaDiscovery.findMatchingMessageTypes(text)
      setDiscoveredMessages(matchingMessages)
      
      if (matchingMessages.length > 0) {
        // Auto-select first matching message
        const firstMatch = matchingMessages[0]
        setSelectedSchema(firstMatch.schemaId)
        setSelectedMessageType(firstMatch.messageType)
      }
    } catch (error) {
      console.error('Failed to discover message types:', error)
    } finally {
      setIsDiscovering(false)
    }
  }

  const handleSmartDetect = async () => {
    if (!text) return
    
    setIsDiscovering(true)
    try {
      // Trigger lazy analysis of all schemas
      const allMessages = await schemaDiscovery.discoverMessageTypes()
      setDiscoveredMessages(allMessages)
      
      // Find best matching messages for the binary data
      const matchingMessages = await schemaDiscovery.findMatchingMessageTypes(text)
      
      if (matchingMessages.length > 0) {
        const firstMatch = matchingMessages[0]
        setSelectedSchema(firstMatch.schemaId)
        setSelectedMessageType(firstMatch.messageType)
      }
    } catch (error) {
      console.error('Failed to perform smart detection:', error)
    } finally {
      setIsDiscovering(false)
    }
  }

  if (!text) {
    return <div style={style}>No data to display</div>
  }

  return (
    <div style={{ ...cssBody, ...style }}>
      {!showSchemaControls && selectedSchema && selectedMessageType ? (
        <div style={cssSchemaHeader}>
          <span style={cssSchemaText}>
            {schemas.find(s => s.id === selectedSchema || s.name === selectedSchema)?.name || selectedSchema} → {selectedMessageType}
          </span>
          <button 
            onClick={() => setShowSchemaControls(true)}
            style={cssChangeButton}
          >
            change
          </button>
        </div>
      ) : (
        <div style={cssControls}>
          {showAnalysisResults && (isDiscovering || isLoadingBackendSchemas) && (
            <div style={{ ...cssControlGroup, marginBottom: '10px', fontStyle: 'italic', color: '#666' }}>
              {isLoadingBackendSchemas ? '📁 Loading proto schemas...' : '🔍 Auto-detecting best proto file + message type combination...'}
            </div>
          )}
          
          <div style={cssControlGroup}>
            <label>Schema:</label>
            {isLoadingBackendSchemas && <span>Loading schemas...</span>}
            {schemas.length > 0 ? (
              <select
                value={selectedSchema}
                onChange={(e) => setSelectedSchema(e.target.value)}
                disabled={isLoadingBackendSchemas}
              >
                <option value="">Select schema...</option>
                {schemas.map(schema => (
                  <option key={schema.id || schema.name} value={schema.id || schema.name}>
                    {schema.name} {schema.error && "(Error)"}
                  </option>
                ))}
              </select>
            ) : (
              <span style={{ color: '#666', fontStyle: 'italic' }}>
                No schemas found. Place .proto files in the proto-schemas directory.
              </span>
            )}
            <button 
              onClick={loadBackendSchemas}
              disabled={isLoadingBackendSchemas}
              style={{ marginLeft: '10px', padding: '4px 8px', fontSize: '12px' }}
            >
              Refresh
            </button>
          </div>

          {selectedSchema && availableMessageTypes.length > 0 && (
            <div style={cssControlGroup}>
              <label>
                Message Type:
                <select
                  value={selectedMessageType}
                  onChange={(e) => setSelectedMessageType(e.target.value)}
                >
                  <option value="">Select message type...</option>
                  {availableMessageTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              {showAnalysisResults && (
                <>
                  <button 
                    onClick={handleAutoDetect} 
                    disabled={isDiscovering}
                  >
                    Auto-detect
                  </button>
                  <button 
                    onClick={handleSmartDetect} 
                    disabled={isDiscovering}
                    style={{ marginLeft: '5px' }}
                  >
                    {isDiscovering ? 'Analyzing...' : 'Smart Detect'}
                  </button>
                </>
              )}
            </div>
          )}

          {showAnalysisResults && discoveredMessages.length > 0 && (
            <div style={cssControlGroup}>
              <label>Analysis Results ({discoveredMessages.length} combinations tested):</label>
              <select
                onChange={(e) => {
                  const [schemaId, messageType] = e.target.value.split('::')
                  if (schemaId && messageType) {
                    setSelectedSchema(schemaId)
                    setSelectedMessageType(messageType)
                  }
                }}
                style={{ maxWidth: '500px' }}
              >
                <option value="">Select from compatible proto file + message type combinations...</option>
                {discoveredMessages.map(msg => (
                  <option key={`${msg.schemaId}::${msg.messageType}`} value={`${msg.schemaId}::${msg.messageType}`}>
                    {msg.schemaName} → {msg.messageType} 
                    {msg.score && ` (score: ${msg.score})`}
                    {msg.decodeResult?.success && msg.decodeResult.fieldCount && ` - ${msg.decodeResult.fieldCount} fields`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showAnalysisResults && discoveredMessages.length > 0 && discoveredMessages[0]?.decodeResult && (
            <div style={cssAnalysisResults}>
              <details>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  Analysis Details ({discoveredMessages.filter(m => m.decodeResult?.success).length} successful matches)
                </summary>
                <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '10px' }}>
                  {discoveredMessages.slice(0, 10).map((msg, i) => (
                    <div key={`${msg.schemaId}::${msg.messageType}`} style={{
                      padding: '5px',
                      margin: '2px 0',
                      backgroundColor: msg.decodeResult?.success ? '#e8f5e8' : '#f5e8e8',
                      borderRadius: '3px',
                      fontSize: '12px'
                    }}>
                      <strong>{i + 1}. {msg.schemaName} → {msg.messageType}</strong>
                      {msg.score && <span style={{ color: '#666' }}> (score: {msg.score})</span>}
                      <br />
                      {msg.decodeResult?.success ? (
                        <span style={{ color: '#006600' }}>
                          ✅ Success - {msg.decodeResult.fieldCount} fields decoded
                        </span>
                      ) : (
                        <span style={{ color: '#cc0000' }}>
                          ❌ {msg.decodeResult?.error}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      )}

      {decodedData?.error && (
        <div style={cssError}>
          Error: {decodedData.error}
          {text && (
            <details style={{ marginTop: '10px', fontSize: '11px' }}>
              <summary>Debug Info</summary>
              <div>Payload length: {text.length}</div>
              <div>First 50 chars: {text.substring(0, 50)}</div>
              <div>Binary string (expected for protobuf)</div>
              <div>Hex preview: {Array.from(text.substring(0, 16)).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ')}</div>
            </details>
          )}
        </div>
      )}

      {schemas.find(s => s.name === selectedSchema || s.id === selectedSchema)?.error && (
        <div style={cssError}>
          Schema Error: {schemas.find(s => s.name === selectedSchema || s.id === selectedSchema)?.error}
        </div>
      )}

      {decodedData?.success && decodedData.data ? (
        <div style={cssDecodedData}>
          <JsonPropsCmp json={decodedData.data} deep={0} />
        </div>
      ) : !decodedData?.error && selectedSchema && selectedMessageType ? (
        <div style={cssPlaceholder}>
          Ready to decode with {selectedSchema}::{selectedMessageType}
        </div>
      ) : (
        <div style={cssFallback}>
          <div style={cssPlaceholder}>
            Protobuf format requires schema and message type selection.
            <br />
            Place .proto files in the proto-schemas directory to make them available.
          </div>
          <TextCmp text={text} />
        </div>
      )}
    </div>
  )
}

export default ProtobufCmp

const cssBody: React.CSSProperties = {
  fontFamily: "monospace",
  display: "flex",
  flexDirection: "column",
}

const cssControls: React.CSSProperties = {
  padding: "10px",
  borderBottom: "1px solid #ccc",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
}

const cssSchemaHeader: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid #e0e0e0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(0,0,0,0.02)",
}

const cssControlGroup: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
}

const cssError: React.CSSProperties = {
  color: "#ff4444",
  padding: "10px",
  backgroundColor: "#ffe6e6",
  margin: "10px",
  borderRadius: "4px",
}

const cssDecodedData: React.CSSProperties = {
  padding: "10px",
}

const cssMetadata: React.CSSProperties = {
  fontSize: "12px",
  color: "#666",
  marginBottom: "10px",
  fontStyle: "italic",
}

const cssPlaceholder: React.CSSProperties = {
  padding: "20px",
  textAlign: "center",
  color: "#666",
  fontStyle: "italic",
}

const cssFallback: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
}

const cssAnalysisResults: React.CSSProperties = {
  margin: "10px 0",
  padding: "10px",
  backgroundColor: "#f9f9f9",
  borderRadius: "4px",
  border: "1px solid #ddd",
}


const cssSchemaText: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "12px",
  color: "inherit",
  opacity: 0.7,
}

const cssChangeButton: React.CSSProperties = {
  marginLeft: "8px",
  padding: "2px 6px",
  fontSize: "11px",
  color: "inherit",
  opacity: 0.7,
  backgroundColor: "transparent",
  border: "1px solid currentColor",
  borderRadius: "3px",
  cursor: "pointer",
}