import { FunctionComponent } from "react"
import { ProtobufDecodedData, ProtoSchema } from "@/types/Protobuf"
import { styles } from "./protobuf.styles"

interface ProtobufDecoderProps {
  decodedData: ProtobufDecodedData | null
  schema?: ProtoSchema
  binaryData?: string
}

const ProtobufDecoder: FunctionComponent<ProtobufDecoderProps> = ({
  decodedData,
  schema,
  binaryData,
}) => {
  // Show decoding errors
  if (decodedData?.error) {
    return (
      <div style={styles.errorContainer}>
        Error: {decodedData.error}
        {binaryData && (
          <details style={styles.debugInfo}>
            <summary>Debug Info</summary>
            <div>Payload length: {binaryData.length}</div>
            <div>First 50 chars: {binaryData.substring(0, 50)}</div>
            <div>Binary string (expected for protobuf)</div>
            <div>
              Hex preview: {Array.from(binaryData.substring(0, 16))
                .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join(' ')}
            </div>
          </details>
        )}
      </div>
    )
  }

  // Show schema errors
  if (schema?.error) {
    return (
      <div style={styles.errorContainer}>
        Schema Error: {schema.error}
      </div>
    )
  }

  return null
}

export default ProtobufDecoder