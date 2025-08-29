import { FunctionComponent } from "react"
import { useProtobufSchema } from "@/hooks/useProtobufSchema"
import CompactSchemaHeader from "./CompactSchemaHeader"
import SchemaSelector from "./SchemaSelector"
import ProtobufDecoder from "./ProtobufDecoder"
import ProtobufDataDisplay from "./ProtobufDataDisplay"
import { styles } from "./protobuf.styles"

interface Props {
  text?: string
  style?: React.CSSProperties
}

const ProtobufCmp: FunctionComponent<Props> = ({
  text,
  style,
}) => {
  const {
    schemas,
    selectedSchemaId,
    selectedMessageType,
    decodedData,
    isLoadingSchemas,
    isAutoDetecting,
    showSchemaControls,
    availableMessageTypes,
    selectedSchema,
    setSelectedSchemaId,
    setSelectedMessageType,
    setShowSchemaControls,
    refreshSchemas,
    autoDetectMessageType,
  } = useProtobufSchema(text)

  if (!text) {
    return <div style={style}>No data to display</div>
  }

  const hasValidSelection = selectedSchemaId && selectedMessageType

  return (
    <div style={{ ...style, ...styles.container }}>
      {/* Header/Controls Section */}
      {!showSchemaControls && hasValidSelection && selectedSchema ? (
        <CompactSchemaHeader
          schema={selectedSchema}
          messageType={selectedMessageType}
          onChangeClick={() => setShowSchemaControls(true)}
        />
      ) : (
        <SchemaSelector
          schemas={schemas}
          selectedSchemaId={selectedSchemaId}
          selectedMessageType={selectedMessageType}
          availableMessageTypes={availableMessageTypes}
          isLoadingSchemas={isLoadingSchemas}
          isAutoDetecting={isAutoDetecting}
          onSchemaChange={setSelectedSchemaId}
          onMessageTypeChange={setSelectedMessageType}
          onRefreshSchemas={refreshSchemas}
          onAutoDetect={autoDetectMessageType}
          onDone={hasValidSelection ? () => setShowSchemaControls(false) : undefined}
          showDoneButton={!!hasValidSelection}
        />
      )}

      {/* Error Display */}
      <ProtobufDecoder
        decodedData={decodedData}
        schema={selectedSchema}
        binaryData={text}
      />

      {/* Data Display */}
      <ProtobufDataDisplay
        decodedData={decodedData}
        binaryData={text}
        selectedSchemaId={selectedSchemaId}
        selectedMessageType={selectedMessageType}
      />
    </div>
  )
}

export default ProtobufCmp