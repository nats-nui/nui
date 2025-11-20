import { FunctionComponent, useMemo, memo } from "react"
import { useProtobufSchema } from "@/hooks/useProtobufSchema"
import JsonRow from "../json/JsonRow"
import TextRow from "../text/TextRow"

interface Props {
  text?: string
  style?: React.CSSProperties
  subject?: string
}

const ProtobufRow: FunctionComponent<Props> = ({
  text,
  style,
  subject,
}) => {
  const {
    selectedSchema,
    selectedMessageType,
    decodedData,
    showSchemaControls,
  } = useProtobufSchema(text, subject)

  const schemaInfo = useMemo(() => {
    if (!selectedSchema || !selectedMessageType) return null
    const schemaName = selectedSchema.name.length > 30 
      ? `...${selectedSchema.name.slice(-27)}` 
      : selectedSchema.name
    return `${schemaName}:${selectedMessageType}`
  }, [selectedSchema, selectedMessageType])

  if (!text) return null

  if (decodedData?.success && decodedData.dataJson) {
    return (
      <div style={style}>
        {schemaInfo && (
          <div style={cssSchemaInfo}>
            {schemaInfo}
          </div>
        )}
        <JsonRow text={decodedData.dataJson} />
      </div>
    )
  }

  if (decodedData?.error) {
    return (
      <div style={style}>
        {schemaInfo && (
          <div style={cssSchemaInfo}>
            {schemaInfo}
          </div>
        )}
        <TextRow text={`Protobuf decode failed: ${decodedData.error}`} error />
      </div>
    )
  }

  if (showSchemaControls || !selectedSchema || !selectedMessageType) {
    return (
      <div style={style}>
        <TextRow text="Protobuf: Schema selection required" error />
      </div>
    )
  }

  return (
    <div style={style}>
      <TextRow text="Decoding protobuf message..." />
    </div>
  )
}

export default memo(ProtobufRow)

const cssSchemaInfo: React.CSSProperties = {
  fontSize: 10,
  opacity: 0.6,
  fontFamily: "monospace",
  marginBottom: 2,
}