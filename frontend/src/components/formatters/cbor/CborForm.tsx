import { Editor } from "@monaco-editor/react"
import { CSSProperties, FunctionComponent, useEffect, useMemo, useRef, useState } from "react"
import { useCddlSchema } from "@/hooks/useCddlSchema"
import { validateCborPayload } from "@/utils/cbor"
import { deriveShape } from "@/utils/cbor/shape"
import { CborValue, fromNotation, markedFields, toNotation, toPayloadOfValue } from "@/utils/cbor/value"
import { styles } from "./cbor.styles"
import FieldView from "./fields/FieldView"
import SchemaSelector from "./SchemaSelector"

interface Props {
  /** the payload being written, as CBOR diagnostic notation */
  text?: string
  subject?: string
  style?: CSSProperties
  onChange?: (text: string) => void
}

/** Send editor: CDDL fields when a type is selected, otherwise diagnostic notation. */
const CborForm: FunctionComponent<Props> = ({ text, subject, style, onChange }) => {
  const {
    schemas,
    selectedSchemaId,
    selectedRule,
    isLoadingSchemas,
    showSchemaControls,
    availableRules,
    selectedSchema,
    setSelectedSchemaId,
    setSelectedRule,
    setShowSchemaControls,
    refreshSchemas,
  } = useCddlSchema(undefined, subject)

  const [asText, setAsText] = useState(false)
  const [value, setValue] = useState<CborValue>(null)
  /** why the text could not be read into the fields; null while the text is fine */
  const [importError, setImportError] = useState<string | null>(null)
  /** what the form last wrote, to tell its own text apart from text set elsewhere */
  const written = useRef<string>(null)

  const shape = useMemo(
    () => selectedSchema?.content && selectedRule ? deriveShape(selectedSchema.content, selectedRule) : undefined,
    [selectedSchema?.content, selectedRule],
  )
  const field = shape?.field

  /** Read notation into the fields. Bad text is reported, never silently emptied. */
  const takeText = (notation: string): boolean => {
    if (!field) return false
    const { value: next, error } = fromNotation(field, notation)
    if (error) {
      setImportError(error)
      return false
    }
    setImportError(null)
    setValue(next)
    return true
  }

  // the fields start from whatever the card already holds, whether that came
  // from the text editor, from another card, or from a message being edited
  useEffect(() => {
    if (!field) return
    if (text == written.current) return
    const { value: next, error } = fromNotation(field, text ?? "")
    setValue(next)
    setImportError(error ?? null)
  }, [field, text])

  const check = useMemo(() => {
    if (!field || !value) return null
    const { payload, errors } = toPayloadOfValue(field, value)
    if (errors.length > 0) return { errors, valid: false, size: 0 }
    const verdict = validateCborPayload(payload, selectedSchema, selectedRule)
    return { errors: [], valid: verdict.valid, size: payload.length, mismatch: verdict.errors[0] }
  }, [field, value, selectedSchema, selectedRule])

  const wrong = useMemo(() => markedFields(check?.errors ?? []), [check])

  const handleChange = (next: CborValue) => {
    setValue(next)
    setImportError(null)
    // a payload that cannot be written yet is no payload: the card must not
    // keep the last complete one and send that instead
    written.current = toNotation(field, next).text ?? ""
    onChange?.(written.current)
  }

  const handleText = (notation: string) => {
    written.current = notation
    setImportError(null)
    onChange?.(notation ?? "")
  }

  const handleSwap = (next: boolean) => {
    // coming back from the text editor, the fields take up what was written there.
    // if the text cannot be read, stay on Text so the work is not thrown away
    if (!next && field && !takeText(text ?? "")) return
    if (next) setImportError(null)
    setAsText(next)
  }

  const hasSelection = !!(selectedSchemaId && selectedRule)
  const showFields = !!field && !asText
  const choosing = showSchemaControls || !hasSelection

  return (
    <div style={{ ...style, ...styles.container }}>
      <div style={styles.schemaHeader}>
        {hasSelection && !choosing ? (
          <button style={styles.headerButton}
            title="Use another schema or type"
            onClick={() => setShowSchemaControls(true)}
          >
            {selectedSchema?.name} <span style={{ opacity: 0.5 }}>{"\u203a"}</span> {selectedRule} {"\u2304"}
          </button>
        ) : (
          <span style={styles.schemaText}>CBOR</span>
        )}

        {field && (
          <div style={styles.segmented}>
            <button style={{ ...styles.segment, ...(asText ? {} : styles.segmentOn) }}
              title="Fill in the fields of the selected type"
              onClick={() => handleSwap(false)}
            >
              Fields
            </button>
            <button style={{ ...styles.segment, ...(asText ? styles.segmentOn : {}) }}
              title="Edit as CBOR diagnostic notation (JSON works too)"
              onClick={() => handleSwap(true)}
            >
              Text
            </button>
          </div>
        )}
      </div>

      {choosing && (
        <SchemaSelector
          schemas={schemas}
          selectedSchemaId={selectedSchemaId}
          selectedRule={selectedRule}
          availableRules={availableRules}
          isLoadingSchemas={isLoadingSchemas}
          onSchemaChange={setSelectedSchemaId}
          onRuleChange={rule => {
            setSelectedRule(rule)
            if (rule) setShowSchemaControls(false)
          }}
          onRefreshSchemas={refreshSchemas}
          showAutoDetect={false}
          compact
        />
      )}

      {shape?.error && <div style={styles.errorContainer}>{shape.error}</div>}
      {importError && (
        <div style={styles.errorContainer}>
          Could not read the text into fields: {importError}
        </div>
      )}

      {showFields ? (
        <div style={styles.form}>
          {value && (
            <FieldView
              field={field}
              value={value}
              errors={wrong}
              onChange={handleChange}
            />
          )}
        </div>
      ) : (
        <div style={styles.dataDisplay}>
          <Editor
            height="100%"
            language="json"
            value={text ?? ""}
            theme="vs-dark"
            onChange={handleText}
            options={{ minimap: { enabled: false }, scrollBeyondLastLine: false }}
          />
        </div>
      )}

      <div style={styles.formFooter}>{statusOf()}</div>
    </div>
  )

  function statusOf() {
    if (!showFields) {
      if (importError) return <span style={styles.statusWrong}>fix the text before switching to Fields</span>
      return (
        <span style={styles.statusQuiet}>
          {hasSelection
            ? `written out as CBOR text, checked against ${selectedRule}`
            : `JSON works here, and so does h'01ff' and 32("a")`}
        </span>
      )
    }
    if (importError) return <span style={styles.statusWrong}>{importError}</span>
    if (!check) return null

    const invalid = check.errors.filter(error => error.kind == "invalid")
    if (invalid.length > 0) return <span style={styles.statusWrong}>{invalid[0].message}</span>

    const missing = check.errors.map(error => nameOf(error.path))
    if (missing.length > 0) {
      return <span style={styles.statusQuiet}>{`waiting for ${listOf(missing)}`}</span>
    }
    if (!check.valid) return <span style={styles.statusWrong}>{check.mismatch}</span>

    return <span style={styles.statusReady}>{`ready \u00b7 ${check.size} bytes \u00b7 matches ${selectedRule}`}</span>
  }
}

export default CborForm

function nameOf(path: string): string {
  const last = path.split(".").pop()
  return !last || last == "$" ? "a value" : last
}

/** "a", "a and b", or "a, b and N more" */
function listOf(names: string[]): string {
  const said = [...new Set(names)]
  if (said.length == 1) return said[0]
  if (said.length == 2) return `${said[0]} and ${said[1]}`
  return `${said[0]}, ${said[1]} and ${said.length - 2} more`
}
