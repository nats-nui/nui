import { FunctionComponent, useMemo, useState } from "react"
import { Editor } from "@monaco-editor/react"
import { CborDecodedData, CddlSchema } from "@/types/Cbor"
import { toCborNotation } from "@/utils/cbor"
import { deriveShape } from "@/utils/cbor/shape"
import TextCmp from "../text/TextCmp"
import { styles } from "./cbor.styles"
import CborStructured from "./CborStructured"

interface CborDataDisplayProps {
  decodedData: CborDecodedData | null
  binaryData?: string
  selectedSchemaId: string
  selectedRule: string
  schema?: CddlSchema
}

type View = "fields" | "json" | "notation"

const VIEW_TITLES: Record<View, string> = {
  fields: "Payload under the names from the selected type",
  json: "Payload as JSON",
  notation: "Payload as CBOR diagnostic notation",
}

const CborDataDisplay: FunctionComponent<CborDataDisplayProps> = ({
  decodedData,
  binaryData,
  selectedSchemaId,
  selectedRule,
  schema,
}) => {
  const [view, setView] = useState<View>("fields")

  // fields view only when the payload matches the selected type
  const field = useMemo(
    () => decodedData?.valid && schema?.content && selectedRule
      ? deriveShape(schema.content, selectedRule).field
      : undefined,
    [decodedData?.valid, schema?.content, selectedRule],
  )

  const notation = useMemo(
    () => view == "notation" ? toCborNotation(binaryData) : "",
    [view, binaryData],
  )

  if (decodedData?.dataJson) {
    const showing = field ? view : "json"
    return (
      <div style={styles.dataDisplay}>
        {field && (
          <div style={styles.viewSwitch}>
            <div style={styles.segmented}>
              {(["fields", "json", "notation"] as View[]).map(candidate => (
                <button key={candidate}
                  style={{ ...styles.segment, ...(candidate == showing ? styles.segmentOn : {}) }}
                  title={VIEW_TITLES[candidate]}
                  onClick={() => setView(candidate)}
                >
                  {candidate == "notation" ? "Text" : candidate == "json" ? "JSON" : "Fields"}
                </button>
              ))}
            </div>
          </div>
        )}

        {showing == "fields" && <CborStructured field={field} payload={binaryData} />}

        {showing != "fields" && (
          <Editor
            height="100%"
            language={showing == "json" ? "json" : "plaintext"}
            value={showing == "json" ? decodedData.dataJson : notation}
            theme="vs-dark"
            options={{
              readOnly: true,
              formatOnType: true,
              formatOnPaste: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
            }}
          />
        )}
      </div>
    )
  }

  if (!decodedData?.error && selectedSchemaId && selectedRule) {
    return (
      <div style={styles.placeholder}>
        Ready to decode with {selectedSchemaId} › {selectedRule}
      </div>
    )
  }

  return (
    <div style={styles.fallbackContainer}>
      <div style={styles.placeholder}>
        CBOR format: place .cddl files in cddlschemas/default for schema validation.
        <br />
        Raw CBOR decode works without a schema when the payload is valid CBOR.
      </div>
      {binaryData && <TextCmp text={binaryData} />}
    </div>
  )
}

export default CborDataDisplay
