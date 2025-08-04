import { FunctionComponent, useState, useMemo, useEffect } from "react"
import { ProtoSchema, ProtobufDecodedData } from "@/types/Protobuf"
import { decodeProtobufMessage, getMessageTypes, autoDetectMessageType } from "@/utils/protobuf"
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
  const [schemas, setSchemas] = useState<ProtoSchema[]>([])
  const [selectedSchema, setSelectedSchema] = useState<string>("")
  const [selectedMessageType, setSelectedMessageType] = useState<string>("")
  const [decodedData, setDecodedData] = useState<ProtobufDecodedData | null>(null)
  const [isLoadingSchema, setIsLoadingSchema] = useState(false)

  const availableMessageTypes = useMemo(() => {
    const schema = schemas.find(s => s.name === selectedSchema)
    return schema ? getMessageTypes(schema) : []
  }, [schemas, selectedSchema])

  useEffect(() => {
    if (!text || !selectedSchema || !selectedMessageType) {
      setDecodedData(null)
      return
    }

    const schema = schemas.find(s => s.name === selectedSchema)
    if (!schema) return

    const result = decodeProtobufMessage(text, schema, selectedMessageType)
    setDecodedData(result)
  }, [text, selectedSchema, selectedMessageType, schemas])

  const handleSchemaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoadingSchema(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        // For now, just store the raw content - proper parsing will be implemented
        const newSchema: ProtoSchema = {
          name: file.name,
          content,
          root: null,
          lastModified: new Date(),
          error: "Schema parsing not yet implemented - Phase 1 basic version"
        }
        
        setSchemas(prev => [...prev, newSchema])
        setSelectedSchema(file.name)
      } catch (error) {
        console.error('Failed to load schema:', error)
      } finally {
        setIsLoadingSchema(false)
      }
    }
    reader.readAsText(file)
  }

  const handleAutoDetect = () => {
    if (!text || !selectedSchema) return
    
    const schema = schemas.find(s => s.name === selectedSchema)
    if (!schema) return

    const detectedType = autoDetectMessageType(text, schema)
    if (detectedType) {
      setSelectedMessageType(detectedType)
    }
  }

  if (!text) {
    return <div style={style}>No data to display</div>
  }

  return (
    <div style={{ ...cssBody, ...style }}>
      <div style={cssControls}>
        <div style={cssControlGroup}>
          <label>
            Schema:
            <input
              type="file"
              accept=".proto"
              onChange={handleSchemaUpload}
              disabled={isLoadingSchema}
            />
          </label>
          {schemas.length > 0 && (
            <select
              value={selectedSchema}
              onChange={(e) => setSelectedSchema(e.target.value)}
            >
              <option value="">Select schema...</option>
              {schemas.map(schema => (
                <option key={schema.name} value={schema.name}>
                  {schema.name} {schema.error && "(Error)"}
                </option>
              ))}
            </select>
          )}
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
            <button onClick={handleAutoDetect}>
              Auto-detect
            </button>
          </div>
        )}
      </div>

      {decodedData?.error && (
        <div style={cssError}>
          Error: {decodedData.error}
        </div>
      )}

      {schemas.find(s => s.name === selectedSchema)?.error && (
        <div style={cssError}>
          Schema Error: {schemas.find(s => s.name === selectedSchema)?.error}
        </div>
      )}

      {decodedData?.success && decodedData.data ? (
        <div style={cssDecodedData}>
          <div style={cssMetadata}>
            Schema: {decodedData.schemaUsed}, Type: {decodedData.messageType}
          </div>
          <JsonPropsCmp json={decodedData.data} deep={0} />
        </div>
      ) : !decodedData?.error && selectedSchema && selectedMessageType ? (
        <div style={cssPlaceholder}>
          Ready to decode with {selectedSchema}::{selectedMessageType}
        </div>
      ) : (
        <div style={cssFallback}>
          <div style={cssPlaceholder}>
            Protobuf format requires schema and message type selection
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