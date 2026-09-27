import { FunctionComponent } from "react"
import { CborEntry, CborField, CborOccur } from "@/utils/cbor/shape"
import { BytesEncoding, CborRow, CborValue, emptyValue, rowOf } from "@/utils/cbor/value"
import { styles } from "../cbor.styles"
import FieldShell from "./FieldShell"

export interface FieldViewProps {
  field: CborField
  value: CborValue
  onChange: (value: CborValue) => void
  /** the message reported for a field, by path */
  errors?: Record<string, string>
  readOnly?: boolean
  /** how the field reads where it sits; unset at the root */
  label?: string
  hint?: string
  occur?: CborOccur
  onRemove?: () => void
}

/** One CDDL field control; required members first, optionals via chips. */
const FieldView: FunctionComponent<FieldViewProps> = props => {
  const { field, value, onChange, errors, readOnly, label, hint, occur, onRemove } = props
  const error = errors?.[field.path]
  const shell = { field, label, hint, occur, error, onRemove }

  switch (field.kind) {
    case "map":
    case "array":
      return <ContainerView {...props} field={field} />

    case "choice": {
      const chosen = value.kind == "choice" ? value : { kind: "choice" as const, option: 0, value: emptyValue(field.options[0]) }
      const option = field.options[chosen.option] ?? field.options[0]
      return (
        <FieldShell {...shell}
          children={readOnly ? null : (
            <select style={styles.selectSmall}
              value={chosen.option}
              onChange={event => {
                const next = Number(event.target.value)
                onChange({ kind: "choice", option: next, value: emptyValue(field.options[next]) })
              }}
            >
              {field.options.map((candidate, index) => (
                <option key={candidate.path + index} value={index}>{candidate.type}</option>
              ))}
            </select>
          )}
          below={
            <div style={styles.nested}>
              <FieldView {...props}
                field={option}
                value={chosen.value}
                label={undefined}
                occur={undefined}
                onRemove={undefined}
                onChange={next => onChange({ ...chosen, value: next })}
              />
            </div>
          }
        />
      )
    }

    case "const":
      return <FieldShell {...shell} children={<span style={styles.fixedValue}>{field.label}</span>} />

    case "bool": {
      const on = value.kind == "bool" && value.on
      if (readOnly) return <FieldShell {...shell} children={<span style={styles.readValue}>{`${on}`}</span>} />
      return (
        <FieldShell {...shell}
          children={
            <input type="checkbox"
              checked={on}
              onChange={event => onChange({ kind: "bool", on: event.target.checked })}
            />
          }
        />
      )
    }

    case "enum": {
      const index = value.kind == "enum" ? value.index : 0
      const option = field.options[index]
      if (readOnly) return <FieldShell {...shell} children={<span style={styles.readValue}>{option?.label}</span>} />
      return (
        <FieldShell {...shell}
          children={
            <select style={styles.selectSmall}
              value={index}
              onChange={event => onChange({ kind: "enum", index: Number(event.target.value) })}
            >
              {field.options.map((candidate, position) => (
                <option key={candidate.label} value={position}>{candidate.label}</option>
              ))}
            </select>
          }
        />
      )
    }

    default:
      return <ScalarView {...props} />
  }
}

export default FieldView

/** A leaf: text, a number, bytes, or a value written as diagnostic notation */
const ScalarView: FunctionComponent<FieldViewProps> = props => {
  const { field, value, onChange, errors, readOnly, label, hint, occur, onRemove } = props
  const error = errors?.[field.path]
  const text = value.kind == "scalar" ? value.text : ""
  const encoding = (value.kind == "scalar" ? value.encoding : undefined) ?? "hex"
  const style = { ...styles.input, ...(error ? styles.inputInvalid : {}) }

  const shell = {
    field,
    label,
    hint,
    occur,
    error,
    onRemove,
    advanced: field.kind == "bytes" && !readOnly ? (
      <div style={styles.row}>
        <span>written as</span>
        <select style={styles.selectSmall}
          value={encoding}
          onChange={event => onChange({ kind: "scalar", text, encoding: event.target.value as BytesEncoding })}
        >
          <option value="hex">hex</option>
          <option value="utf8">text</option>
          <option value="base64">base64</option>
        </select>
      </div>
    ) : undefined,
  }

  if (readOnly) {
    return <FieldShell {...shell} children={<span style={styles.readValue}>{text || "\u2014"}</span>} />
  }

  // an `any` field is the notation fallback, kept to the one value that needs it
  if (field.kind == "any") {
    return (
      <FieldShell {...shell}
        children={
          <textarea style={{ ...style, ...styles.notationInput }}
            value={text}
            spellCheck={false}
            placeholder={field.reason == "recursive" ? "written as diagnostic notation" : "any value, as notation"}
            onChange={event => onChange({ kind: "scalar", text: event.target.value })}
          />
        }
      />
    )
  }

  return (
    <FieldShell {...shell}
      children={
        <input style={style}
          value={text}
          spellCheck={false}
          inputMode={field.kind == "number" ? "numeric" : undefined}
          maxLength={field.kind == "text" ? field.maxLength : undefined}
          placeholder={placeholderOf(field, encoding)}
          onChange={event => onChange({ kind: "scalar", text: event.target.value, encoding })}
        />
      }
    />
  )
}

/** A map or an array: the members that are filled in, and a chip for the rest */
const ContainerView: FunctionComponent<FieldViewProps & { field: CborField & { entries: CborEntry[] } }> = ({
  field,
  value,
  onChange,
  errors,
  readOnly,
  label,
  hint,
  occur,
  onRemove,
}) => {
  const rows = value.kind == "rows" ? value.rows : []
  const setRows = (next: CborRow[]) => onChange({ kind: "rows", rows: next })

  const countOf = (entry: number) => rows.filter(row => row.entry == entry).length
  const addable = field.entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry, index }) => entry.occur.max == null || countOf(index) < entry.occur.max)

  // the rail marks a group as belonging to the field above it; the root belongs
  // to nothing, so it does not get one
  const members = (
    <div style={label ? styles.nested : styles.rootMembers}>
      {rows.map(row => {
        const entry = field.entries[row.entry]
        if (!entry) return null
        const removable = !readOnly && countOf(row.entry) > entry.occur.min
        return (
          <div key={row.id}>
            {entry.key?.kind == "open" && (
              <FieldView field={entry.key.field}
                value={row.key ?? emptyValue(entry.key.field)}
                onChange={next => setRows(rows.map(candidate => candidate.id == row.id ? { ...candidate, key: next } : candidate))}
                errors={errors}
                readOnly={readOnly}
                label="key"
              />
            )}
            <FieldView field={entry.value}
              value={row.value}
              onChange={next => setRows(rows.map(candidate => candidate.id == row.id ? { ...candidate, value: next } : candidate))}
              errors={errors}
              readOnly={readOnly}
              label={labelOf(entry, row, rows)}
              hint={entry.hint}
              occur={entry.occur}
              onRemove={removable ? () => setRows(rows.filter(candidate => candidate.id != row.id)) : undefined}
            />
          </div>
        )
      })}

      {!readOnly && addable.length > 0 && (
        <div style={styles.chipRow}>
          {addable.map(({ entry, index }) => (
            <button key={entry.path} style={styles.chip}
              title={entry.hint ?? entry.value.type}
              onClick={() => setRows(sortByEntry([...rows, rowOf(entry, index)]))}
            >
              {`+ ${entry.label}`}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  // the root of a shape has no name to put above its members
  if (!label) return members

  return (
    <FieldShell field={field}
      label={label}
      hint={hint}
      occur={occur}
      error={errors?.[field.path]}
      onRemove={onRemove}
      below={members}
    />
  )
}

/** Rows keep the order of the schema, and their own order within one member */
function sortByEntry(rows: CborRow[]): CborRow[] {
  return [...rows].sort((first, second) => first.entry - second.entry)
}

function labelOf(entry: CborEntry, row: CborRow, rows: CborRow[]): string {
  if (entry.occur.max == 1) return entry.label
  const position = rows.filter(candidate => candidate.entry == row.entry).indexOf(row)
  return `${entry.label} ${position + 1}`
}

function placeholderOf(field: CborField, encoding: BytesEncoding): string | undefined {
  if (field.kind == "bytes") return encoding == "hex" ? "hex, e.g. 01ff" : encoding
  if (field.kind == "number") return field.integer ? "whole number" : "number"
  return undefined
}
