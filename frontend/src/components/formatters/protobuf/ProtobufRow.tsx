import { FunctionComponent, useMemo, memo, useSyncExternalStore } from "react"
import { useProtobufSchemas } from "@/contexts/ProtobufSchemaContext"
import { getTopicCacheRevision, resolveProtobuf, subscribeToTopicCache } from "@/utils/protobuf/resolve"
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
  const { schemas } = useProtobufSchemas()
  const cacheRevision = useSyncExternalStore(subscribeToTopicCache, getTopicCacheRevision, getTopicCacheRevision)
  const resolution = useMemo(
    () => text ? resolveProtobuf(text, schemas, subject) : undefined,
    [text, schemas, subject, cacheRevision],
  )
  const selectedSchema = resolution?.schema
  const selectedMessageType = resolution?.messageType
  const decodedData = resolution?.decoded

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

  if (!selectedSchema || !selectedMessageType) {
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