import { FunctionComponent } from "react"
import { ProtoSchema } from "@/types/Protobuf"
import { styles } from "./protobuf.styles"

interface SchemaSelectorProps {
  schemas: ProtoSchema[]
  selectedSchemaId: string
  selectedMessageType: string
  availableMessageTypes: string[]
  isLoadingSchemas: boolean
  isAutoDetecting: boolean
  onSchemaChange: (schemaId: string) => void
  onMessageTypeChange: (messageType: string) => void
  onRefreshSchemas: () => void
  onAutoDetect: () => void
  onDone?: () => void
  showDoneButton?: boolean
}

const SchemaSelector: FunctionComponent<SchemaSelectorProps> = ({
  schemas,
  selectedSchemaId,
  selectedMessageType,
  availableMessageTypes,
  isLoadingSchemas,
  isAutoDetecting,
  onSchemaChange,
  onMessageTypeChange,
  onRefreshSchemas,
  onAutoDetect,
  onDone,
  showDoneButton = false
}) => {
  return (
    <div style={styles.controls}>
      {/* Status message */}
      {(isAutoDetecting || isLoadingSchemas) && (
        <div style={styles.statusMessage}>
          {isLoadingSchemas 
            ? 'Loading proto schemas...' 
            : 'Auto-detecting best proto file + message type combination...'}
        </div>
      )}
      
      {/* Schema selection */}
      <div style={styles.controlGroup}>
        <label style={styles.controlLabel}>Schema:</label>
        {schemas.length > 0 ? (
          <>
            <select
              value={selectedSchemaId}
              onChange={(e) => onSchemaChange(e.target.value)}
              disabled={isLoadingSchemas}
              style={styles.select}
            >
              <option value="">Select schema...</option>
              {schemas.map(schema => (
                <option key={schema.id || schema.name} value={schema.id || schema.name}>
                  {schema.name} {schema.error && "(Error)"}
                </option>
              ))}
            </select>
            <button 
              onClick={onRefreshSchemas}
              disabled={isLoadingSchemas}
              style={styles.buttonSmall}
            >
              Refresh
            </button>
          </>
        ) : (
          <span style={styles.noSchemasMessage}>
            No schemas found. Place .proto files in the proto-schemas directory.
          </span>
        )}
      </div>

      {/* Message type selection */}
      {selectedSchemaId && availableMessageTypes.length > 0 && (
        <div style={styles.controlGroup}>
          <label style={styles.controlLabel}>Message Type:</label>
          <select
            value={selectedMessageType}
            onChange={(e) => onMessageTypeChange(e.target.value)}
            style={styles.select}
          >
            <option value="">Select message type...</option>
            {availableMessageTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button 
            onClick={onAutoDetect} 
            disabled={isAutoDetecting}
            style={styles.buttonSmall}
          >
            {isAutoDetecting ? 'Detecting...' : 'Auto-detect'}
          </button>
          {showDoneButton && onDone && (
            <button 
              onClick={onDone}
              style={styles.buttonSmall}
            >
              Done
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default SchemaSelector