import { FunctionComponent } from "react"
import { ProtoSchema } from "@/types/Protobuf"
import { styles } from "./protobuf.styles"

interface CompactSchemaHeaderProps {
  schema: ProtoSchema
  messageType: string
  onChangeClick: () => void
}

const CompactSchemaHeader: FunctionComponent<CompactSchemaHeaderProps> = ({
  schema,
  messageType,
  onChangeClick,
}) => {
  return (
    <div style={styles.schemaHeader}>
      <span style={styles.schemaText}>
        <span style={{ opacity: 0.7 }}>Schema:</span> {schema.name} <span style={{ opacity: 0.5 }}>→</span> {messageType}
      </span>
      <button 
        onClick={onChangeClick}
        style={styles.changeButton}
      >
        Change
      </button>
    </div>
  )
}

export default CompactSchemaHeader