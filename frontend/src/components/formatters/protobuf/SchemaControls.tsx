import { FunctionComponent } from "react"
import { ProtoSchema } from "@/types/Protobuf"

interface SchemaControlsProps {
  schemas: ProtoSchema[]
  selectedSchema: string
  selectedMessageType: string
  availableMessageTypes: string[]
  isLoadingBackendSchemas: boolean
  isDiscovering: boolean
  onSchemaChange: (schemaId: string) => void
  onMessageTypeChange: (messageType: string) => void
  onRefreshSchemas: () => void
  onAutoDetect: () => void
  onSmartDetect: () => void
  onDone?: () => void
  showDoneButton?: boolean
}

const SchemaControls: FunctionComponent<SchemaControlsProps> = ({
  schemas,
  selectedSchema,
  selectedMessageType,
  availableMessageTypes,
  isLoadingBackendSchemas,
  isDiscovering,
  onSchemaChange,
  onMessageTypeChange,
  onRefreshSchemas,
  onAutoDetect,
  onSmartDetect,
  onDone,
  showDoneButton = false
}) => {
  return (
    <div style={cssControls}>
      {(isDiscovering || isLoadingBackendSchemas) && (
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
            onChange={(e) => onSchemaChange(e.target.value)}
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
          onClick={onRefreshSchemas}
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
              onChange={(e) => onMessageTypeChange(e.target.value)}
            >
              <option value="">Select message type...</option>
              {availableMessageTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <button 
            onClick={onAutoDetect} 
            disabled={isDiscovering}
          >
            Auto-detect
          </button>
          <button 
            onClick={onSmartDetect} 
            disabled={isDiscovering}
            style={{ marginLeft: '5px' }}
          >
            {isDiscovering ? 'Analyzing...' : 'Smart Detect'}
          </button>
          {showDoneButton && onDone && (
            <button 
              onClick={onDone}
              style={{ marginLeft: '10px', padding: '4px 8px', fontSize: '12px' }}
            >
              Done
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default SchemaControls

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