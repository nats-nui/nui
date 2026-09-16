import { FunctionComponent } from "react"
import { CddlSchema } from "@/types/Cbor"
import { styles } from "./cbor.styles"

interface SchemaSelectorProps {
  schemas: CddlSchema[]
  selectedSchemaId: string
  selectedRule: string
  availableRules: string[]
  isLoadingSchemas: boolean
  onSchemaChange: (schemaId: string) => void
  onRuleChange: (rule: string) => void
  onRefreshSchemas: () => void
  onAutoDetect?: () => void
  onDone?: () => void
  showDoneButton?: boolean
  /** hide when writing a payload (nothing to detect from yet) */
  showAutoDetect?: boolean
  /** schema + type on one line */
  compact?: boolean
}

const SchemaSelector: FunctionComponent<SchemaSelectorProps> = ({
  schemas,
  selectedSchemaId,
  selectedRule,
  availableRules,
  isLoadingSchemas,
  onSchemaChange,
  onRuleChange,
  onRefreshSchemas,
  onAutoDetect,
  onDone,
  showDoneButton = false,
  showAutoDetect = true,
  compact = false,
}) => {
  return (
    <div style={compact ? styles.controlsCompact : styles.controls}>
      {isLoadingSchemas && (
        <div style={styles.statusMessage}>Loading CDDL schemas...</div>
      )}

      <div style={styles.controlGroup}>
        {!compact && <label style={styles.controlLabel}>Schema:</label>}
        {schemas.length > 0 ? (
          <>
            <select
              value={selectedSchemaId}
              onChange={(e) => onSchemaChange(e.target.value)}
              disabled={isLoadingSchemas}
              style={styles.select}
            >
              <option value="">Select schema...</option>
              {schemas.map((schema) => (
                <option key={schema.id || schema.name} value={schema.id || schema.name}>
                  {schema.name} {schema.error && "(Error)"}
                </option>
              ))}
            </select>
            <button
              onClick={onRefreshSchemas}
              disabled={isLoadingSchemas}
              style={styles.buttonSmall}
              title="look for .cddl files again"
            >
              {compact ? "\u21bb" : "Refresh"}
            </button>
          </>
        ) : (
          <span style={styles.noSchemasMessage}>
            No schemas found. Place .cddl files in cddlschemas/default.
          </span>
        )}
      </div>

      {selectedSchemaId && availableRules.length > 0 && (
        <div style={styles.controlGroup}>
          {!compact && <label style={styles.controlLabel}>Type:</label>}
          <select
            value={selectedRule}
            onChange={(e) => onRuleChange(e.target.value)}
            style={styles.select}
            title="Message type (file name is preferred; helpers like uuid stay available)"
          >
            <option value="">Select type...</option>
            {availableRules.map((rule) => (
              <option key={rule} value={rule}>
                {rule}
              </option>
            ))}
          </select>
          {showAutoDetect && onAutoDetect && (
            <button onClick={onAutoDetect} style={styles.buttonSmall}>
              Auto-detect
            </button>
          )}
          {showDoneButton && onDone && (
            <button onClick={onDone} style={styles.buttonSmall}>
              Done
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default SchemaSelector
