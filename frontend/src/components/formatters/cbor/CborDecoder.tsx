import { FunctionComponent } from "react"
import { CborDecodedData, CddlSchema } from "@/types/Cbor"
import { styles } from "./cbor.styles"

interface CborDecoderProps {
  decodedData: CborDecodedData | null
  schema?: CddlSchema
  binaryData?: string
}

const CborDecoder: FunctionComponent<CborDecoderProps> = ({
  decodedData,
  schema,
  binaryData,
}) => {
  if (decodedData?.validationErrors?.length) {
    return (
      <div style={styles.errorContainer}>
        CDDL validation failed:
        <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
          {decodedData.validationErrors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      </div>
    )
  }

  if (decodedData?.error) {
    return (
      <div style={styles.errorContainer}>
        {decodedData.error}
        {binaryData && (
          <details style={styles.debugInfo}>
            <summary>Debug Info</summary>
            <div>Payload length: {binaryData.length}</div>
            <div>
              Hex preview:{" "}
              {Array.from(binaryData.substring(0, 16))
                .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
                .join(" ")}
            </div>
          </details>
        )}
      </div>
    )
  }

  if (schema?.error) {
    return <div style={styles.errorContainer}>Schema Error: {schema.error}</div>
  }

  return null
}

export default CborDecoder
