import { FunctionComponent } from "react"
import { Editor } from "@monaco-editor/react"
import { ProtobufDecodedData } from "@/types/Protobuf"
import TextCmp from "../text/TextCmp"
import { styles } from "./protobuf.styles"

interface ProtobufDataDisplayProps {
  decodedData: ProtobufDecodedData | null
  binaryData?: string
  selectedSchemaId: string
  selectedMessageType: string
}

const ProtobufDataDisplay: FunctionComponent<ProtobufDataDisplayProps> = ({
  decodedData,
  binaryData,
  selectedSchemaId,
  selectedMessageType,
}) => {
  // Successfully decoded data
  if (decodedData?.success && decodedData.data) {
    return (
      <div style={styles.dataDisplay}>
        <Editor
          height="100%"
          language="json"
          value={decodedData.dataJson || JSON.stringify(decodedData.data, null, 2)}
          theme="vs-dark"
          options={{
            readOnly: true,
            formatOnType: true,
            formatOnPaste: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    )
  }

  // Ready to decode but no data yet
  if (!decodedData?.error && selectedSchemaId && selectedMessageType) {
    return (
      <div style={styles.placeholder}>
        Ready to decode with {selectedSchemaId}::{selectedMessageType}
      </div>
    )
  }

  // Fallback - show instructions and raw text
  return (
    <div style={styles.fallbackContainer}>
      <div style={styles.placeholder}>
        Protobuf format requires schema and message type selection.
        <br />
        Place .proto files in the proto-schemas directory to make them available.
      </div>
      {binaryData && <TextCmp text={binaryData} />}
    </div>
  )
}

export default ProtobufDataDisplay