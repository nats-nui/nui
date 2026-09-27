import { FunctionComponent } from "react"
import { useCddlSchema } from "@/hooks/useCddlSchema"
import CompactSchemaHeader from "./CompactSchemaHeader"
import SchemaSelector from "./SchemaSelector"
import CborDecoder from "./CborDecoder"
import CborDataDisplay from "./CborDataDisplay"
import { styles } from "./cbor.styles"

interface Props {
  text?: string
  style?: React.CSSProperties
  subject?: string
}

const CborCmp: FunctionComponent<Props> = ({ text, style, subject }) => {
  const {
    schemas,
    selectedSchemaId,
    selectedRule,
    decodedData,
    isLoadingSchemas,
    showSchemaControls,
    availableRules,
    selectedSchema,
    setSelectedSchemaId,
    setSelectedRule,
    setShowSchemaControls,
    refreshSchemas,
    autoDetectRule,
  } = useCddlSchema(text, subject)

  if (!text) {
    return <div style={style}>No data to display</div>
  }

  const hasValidSelection = !!(selectedSchemaId && selectedRule)
  const cddlValid = decodedData?.valid === true

  return (
    <div style={{ ...style, ...styles.container }}>
      {!showSchemaControls && hasValidSelection && selectedSchema ? (
        <CompactSchemaHeader
          schema={selectedSchema}
          rule={selectedRule}
          valid={cddlValid}
          onChangeClick={() => setShowSchemaControls(true)}
        />
      ) : (
        <SchemaSelector
          schemas={schemas}
          selectedSchemaId={selectedSchemaId}
          selectedRule={selectedRule}
          availableRules={availableRules}
          isLoadingSchemas={isLoadingSchemas}
          onSchemaChange={setSelectedSchemaId}
          onRuleChange={setSelectedRule}
          onRefreshSchemas={refreshSchemas}
          onAutoDetect={autoDetectRule}
          onDone={hasValidSelection ? () => setShowSchemaControls(false) : undefined}
          showDoneButton={!!hasValidSelection}
        />
      )}

      <CborDecoder decodedData={decodedData} schema={selectedSchema} binaryData={text} />

      <CborDataDisplay
        decodedData={decodedData}
        binaryData={text}
        selectedSchemaId={selectedSchemaId}
        selectedRule={selectedRule}
        schema={selectedSchema}
      />
    </div>
  )
}

export default CborCmp
