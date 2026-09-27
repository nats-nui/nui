import { FunctionComponent } from "react"
import { CddlSchema } from "@/types/Cbor"
import { styles } from "./cbor.styles"

interface CompactSchemaHeaderProps {
  schema: CddlSchema
  rule: string
  valid?: boolean
  onChangeClick: () => void
}

const CompactSchemaHeader: FunctionComponent<CompactSchemaHeaderProps> = ({
  schema,
  rule,
  valid,
  onChangeClick,
}) => {
  return (
    <div style={styles.schemaHeader}>
      <button style={styles.headerButton}
        title="Read this payload through another schema or type"
        onClick={onChangeClick}
      >
        {schema.name} <span style={{ opacity: 0.5 }}>{"\u203a"}</span> {rule} {"\u2304"}
      </button>
      {valid && <span style={styles.validBadge}>matches</span>}
    </div>
  )
}

export default CompactSchemaHeader
