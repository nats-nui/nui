import { FunctionComponent, ReactNode, useState } from "react"
import { CborField, CborOccur } from "@/utils/cbor/shape"
import { styles } from "../cbor.styles"

interface Props {
  field: CborField
  label?: string
  hint?: string
  occur?: CborOccur
  error?: string
  /** what the field is edited with, next to its label */
  children?: ReactNode
  /** the members of the field, under its label */
  below?: ReactNode
  /** what the schema pins about the field, shown only when asked for */
  advanced?: ReactNode
  onRemove?: () => void
}

/** Label + input; schema details stay behind a hover disclosure. */
const FieldShell: FunctionComponent<Props> = ({
  field,
  label,
  hint,
  occur,
  error,
  children,
  below,
  advanced,
  onRemove,
}) => {
  const [focused, setFocused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [open, setOpen] = useState(false)

  const notes = [
    field.type && `type ${field.type}`,
    field.tags?.length && `tag ${field.tags.join(" of ")}`,
    occur && occurrenceOf(occur),
  ].filter(Boolean) as string[]

  const help = hint ?? field.hint
  const quiet = { ...styles.iconButton, opacity: open || hovered ? 0.9 : 0.2 }

  return (
    <div style={styles.field}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.row}>
        {label && <span style={styles.fieldLabel} title={help}>{label}</span>}
        {children}
        {(notes.length > 0 || advanced) && (
          <button style={quiet}
            title="what the schema says about this field"
            onClick={() => setOpen(!open)}
          >
            {open ? "\u2304" : "\u22ef"}
          </button>
        )}
        {onRemove && (
          <button style={quiet} title="remove" onClick={onRemove}>
            {"\u00d7"}
          </button>
        )}
      </div>

      {(help || error) && (
        // the line is held open whether or not it has anything to say: a hint
        // that appears on focus and vanishes on blur moves everything below it,
        // and what moves out from under the pointer cannot be clicked
        <div style={error ? styles.fieldError : styles.fieldHint}>
          {error ?? (focused ? help : "\u00a0")}
        </div>
      )}

      {open && (
        <div style={styles.advanced}>
          {notes.map(note => <div key={note} style={styles.fieldType}>{note}</div>)}
          {advanced}
        </div>
      )}

      {below}
    </div>
  )
}

export default FieldShell

function occurrenceOf(occur: CborOccur): string | null {
  if (occur.min == 1 && occur.max == 1) return null
  if (occur.max == null) return `${occur.min} or more`
  if (occur.min == 0 && occur.max == 1) return "optional"
  return `${occur.min} to ${occur.max} times`
}
