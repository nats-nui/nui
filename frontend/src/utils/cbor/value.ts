import { CBOR } from '@cbortech/cbor'
import { CborEntry, CborField } from './shape'
import { binaryStringToBytes, bytesToBinaryString } from '.'

/**
 * The values held by the fields of a shape.
 *
 * A leaf keeps what was typed rather than what it means, so half-written input
 * survives a render and nothing is rounded on the way through. Meaning is given
 * by `toJsValue`, which reads a value tree against the shape that produced it
 * and reports, per field, whatever it cannot make sense of.
 */

/** How the text of a byte string is written */
export type BytesEncoding = 'hex' | 'utf8' | 'base64'

export interface CborScalarValue {
  kind: 'scalar'
  text: string
  encoding?: BytesEncoding
}

export interface CborBoolValue {
  kind: 'bool'
  on: boolean
}

/** A value the schema pins: there is nothing to hold */
export interface CborConstValue {
  kind: 'const'
}

export interface CborEnumValue {
  kind: 'enum'
  index: number
}

export interface CborRowsValue {
  kind: 'rows'
  rows: CborRow[]
}

export interface CborChoiceValue {
  kind: 'choice'
  option: number
  value: CborValue
}

export type CborValue =
  | CborScalarValue
  | CborBoolValue
  | CborConstValue
  | CborEnumValue
  | CborRowsValue
  | CborChoiceValue

/** One member of a map or one item of an array, filling one entry of the shape */
export interface CborRow {
  /** identifies the row across renders, so editing one does not disturb the others */
  id: number
  /** the entry of the shape the row fills */
  entry: number
  /** the key, when the entry leaves it open */
  key?: CborValue
  value: CborValue
}

export interface CborValueError {
  path: string
  message: string
  /**
   * `missing` is a field nobody has filled in yet, which is where every form
   * starts and is nothing to complain about; `invalid` is a field holding
   * something its schema will not take, which is worth saying out loud.
   */
  kind: 'missing' | 'invalid'
}

export interface CborValueResult {
  /** unset when the fields do not hold a value yet */
  value?: unknown
  errors: CborValueError[]
}

export interface CborNotationResult {
  /** the diagnostic notation of the value; unset while a field is in error */
  text?: string
  errors: CborValueError[]
}

let nextRowId = 1

/** The value a field starts from: its `.default`, or the empty form of its type */
export function emptyValue(field: CborField): CborValue {
  switch (field.kind) {
    case 'bool':
      return { kind: 'bool', on: field.defaultValue === true }

    case 'const':
      return { kind: 'const' }

    case 'enum': {
      const index = field.options.findIndex(option => sameValue(option.value, field.defaultValue))
      return { kind: 'enum', index: index < 0 ? 0 : index }
    }

    case 'map':
    case 'array':
      return { kind: 'rows', rows: field.entries.flatMap((entry, index) => requiredRows(entry, index)) }

    case 'choice':
      return { kind: 'choice', option: 0, value: emptyValue(field.options[0]) }

    case 'bytes':
      return { kind: 'scalar', text: defaultText(field.defaultValue), encoding: 'hex' }

    default:
      return { kind: 'scalar', text: defaultText(field.defaultValue) }
  }
}

/** A row filling one entry of a map or an array */
export function rowOf(entry: CborEntry, index: number): CborRow {
  return {
    id: nextRowId++,
    entry: index,
    key: entry.key?.kind == 'open' ? emptyValue(entry.key.field) : undefined,
    value: emptyValue(entry.value),
  }
}

/** What a field means, read against the shape that produced it */
export function toJsValue(field: CborField, value: CborValue): CborValueResult {
  const errors: CborValueError[] = []
  const read = readValue(field, value, errors)
  return errors.length > 0 ? { errors } : { value: read, errors }
}

/**
 * The diagnostic notation of what the fields hold.
 * Notation is the text every card carries for a CBOR payload, so the form hands
 * back the same thing the notation editor would, and the two can be swapped.
 */
export function toNotation(field: CborField, value: CborValue): CborNotationResult {
  const { value: read, errors } = toJsValue(field, value)
  if (errors.length > 0) return { errors }

  try {
    return { text: CBOR.stringify(read, { indent: 2 }), errors }
  } catch (error) {
    return { errors: [{ path: field.path, message: messageOf(error), kind: 'invalid' }] }
  }
}

/** The bytes of what the fields hold, as the payload a card sends */
export function toPayloadOfValue(field: CborField, value: CborValue): { payload?: string, errors: CborValueError[] } {
  const { value: read, errors } = toJsValue(field, value)
  if (errors.length > 0) return { errors }

  try {
    return { payload: bytesToBinaryString(CBOR.encode(read)), errors }
  } catch (error) {
    return { errors: [{ path: field.path, message: messageOf(error), kind: 'invalid' }] }
  }
}

/** Fill the fields of a shape from a decoded value */
export function fromJsValue(field: CborField, js: unknown): CborValue {
  const plain = untag(js, field)

  switch (field.kind) {
    case 'bool':
      return { kind: 'bool', on: plain === true }

    case 'const':
      return { kind: 'const' }

    case 'enum': {
      const index = field.options.findIndex(option => sameValue(option.value, plain))
      return { kind: 'enum', index: index < 0 ? 0 : index }
    }

    case 'choice': {
      const option = field.options.findIndex(candidate => fits(candidate, js))
      const index = option < 0 ? 0 : option
      return { kind: 'choice', option: index, value: fromJsValue(field.options[index], js) }
    }

    case 'map':
      return { kind: 'rows', rows: mapRows(field.entries, plain) }

    case 'array':
      return { kind: 'rows', rows: arrayRows(field.entries, Array.isArray(plain) ? plain : []) }

    case 'bytes':
      return plain instanceof Uint8Array
        ? { kind: 'scalar', text: toHex(plain), encoding: 'hex' }
        : { kind: 'scalar', text: '', encoding: 'hex' }

    case 'text':
      return { kind: 'scalar', text: typeof plain == 'string' ? plain : '' }

    case 'number':
      return { kind: 'scalar', text: typeof plain == 'number' || typeof plain == 'bigint' ? `${plain}` : '' }

    default:
      // an `any` field is written the way the notation editor writes it
      return { kind: 'scalar', text: notationOf(js) }
  }
}

/** Fill the fields of a shape from diagnostic notation */
export function fromNotation(field: CborField, text: string): { value: CborValue, error?: string } {
  if (!text?.trim()) return { value: emptyValue(field) }
  try {
    return { value: fromJsValue(field, CBOR.parse(text)) }
  } catch (error) {
    return { value: emptyValue(field), error: messageOf(error) }
  }
}

/** Fill the fields of a shape from a payload as it arrived */
export function fromPayload(field: CborField, payload: string): { value: CborValue, error?: string } {
  if (!payload) return { value: emptyValue(field) }
  try {
    return { value: fromJsValue(field, CBOR.decode(binaryStringToBytes(payload))) }
  } catch (error) {
    return { value: emptyValue(field), error: messageOf(error) }
  }
}

/** Whether a decoded value could be what a field stands for */
function fits(field: CborField, js: unknown): boolean {
  const plain = untag(js, field)
  switch (field.kind) {
    case 'text':
      return typeof plain == 'string'
    case 'number':
      return typeof plain == 'number' || typeof plain == 'bigint'
    case 'bool':
      return typeof plain == 'boolean'
    case 'bytes':
      return plain instanceof Uint8Array
    case 'const':
      return sameValue(field.value, plain)
    case 'enum':
      return field.options.some(option => sameValue(option.value, plain))
    case 'array':
      return Array.isArray(plain)
    case 'map':
      return isMapLike(plain)
    case 'choice':
      return field.options.some(option => fits(option, js))
    default:
      return true
  }
}

function readValue(field: CborField, value: CborValue, errors: CborValueError[]): unknown {
  return withTags(field, readPlain(field, value, errors))
}

function readPlain(field: CborField, value: CborValue, errors: CborValueError[]): unknown {
  switch (field.kind) {
    case 'const':
      return field.value

    case 'bool':
      return value.kind == 'bool' ? value.on : false

    case 'enum': {
      const option = value.kind == 'enum' ? field.options[value.index] : undefined
      if (!option) return unfilled(errors, field.path, 'pick one of the values the schema allows')
      return option.value
    }

    case 'choice': {
      if (value.kind != 'choice') return unfilled(errors, field.path, 'pick one of the types the schema allows')
      const option = field.options[value.option]
      if (!option) return unfilled(errors, field.path, 'pick one of the types the schema allows')
      return readValue(option, value.value, errors)
    }

    case 'map':
      return readMap(field.entries, value, errors)

    case 'array':
      return readArray(field.entries, value, errors)

    case 'text':
      return readText(field, value, errors)

    case 'number':
      return readNumber(field, value, errors)

    case 'bytes':
      return readBytes(field, value, errors)

    default:
      return readAny(field, value, errors)
  }
}

function readMap(entries: CborEntry[], value: CborValue, errors: CborValueError[]): unknown {
  if (value.kind != 'rows') return fail(errors, entries[0]?.path ?? '$', 'expected the members of a map')

  const pairs: [unknown, unknown][] = []
  for (const row of value.rows) {
    const entry = entries[row.entry]
    if (!entry) continue
    const key = entry.key
    const written = key?.kind == 'open'
      ? readValue(key.field, row.key ?? emptyValue(key.field), errors)
      : key?.kind == 'fixed' ? key.value : undefined
    pairs.push([written, readValue(entry.value, row.value, errors)])
  }
  checkOccurrences(entries, value.rows, errors)

  // a map whose keys are all distinct text reads as an object, which is how
  // notation and JSON write it; anything else has to keep its pairs
  const keys = pairs.map(([key]) => key)
  if (keys.every(key => typeof key == 'string') && new Set(keys).size == keys.length) {
    return Object.fromEntries(pairs as [string, unknown][])
  }
  const map = new CBOR.MapEntries()
  for (const pair of pairs) map.push(pair)
  return map
}

function readArray(entries: CborEntry[], value: CborValue, errors: CborValueError[]): unknown {
  if (value.kind != 'rows') return fail(errors, entries[0]?.path ?? '$', 'expected the items of an array')
  checkOccurrences(entries, value.rows, errors)

  return value.rows
    .filter(row => entries[row.entry])
    .map(row => readValue(entries[row.entry].value, row.value, errors))
}

/** The schema says how many times a member may appear: hold the fields to it */
function checkOccurrences(entries: CborEntry[], rows: CborRow[], errors: CborValueError[]): void {
  entries.forEach((entry, index) => {
    const count = rows.filter(row => row.entry == index).length
    if (count < entry.occur.min) {
      unfilled(errors, entry.path, `'${entry.label}' is needed ${entry.occur.min} time(s), not ${count}`)
    }
    if (entry.occur.max != null && count > entry.occur.max) {
      fail(errors, entry.path, `'${entry.label}' is allowed ${entry.occur.max} time(s), not ${count}`)
    }
  })
}

function readText(field: Extract<CborField, { kind: 'text' }>, value: CborValue, errors: CborValueError[]): unknown {
  const text = value.kind == 'scalar' ? value.text : ''
  if (field.maxLength != null && text.length > field.maxLength) {
    return fail(errors, field.path, lengthMessage(field, 'characters'))
  }
  if (field.minLength != null && text.length < field.minLength) {
    return text.length == 0
      ? unfilled(errors, field.path, lengthMessage(field, 'characters'))
      : fail(errors, field.path, lengthMessage(field, 'characters'))
  }
  if (field.pattern && !matches(field.pattern, text)) {
    // a field nobody has typed in does not match anything, which says nothing
    // about the writer: it is unfinished, not wrong
    return text.length == 0
      ? unfilled(errors, field.path, `${field.pattern} is what goes here`)
      : fail(errors, field.path, `does not match ${field.pattern}`)
  }
  return text
}

function readNumber(field: Extract<CborField, { kind: 'number' }>, value: CborValue, errors: CborValueError[]): unknown {
  const text = (value.kind == 'scalar' ? value.text : '').trim()
  if (!text) return unfilled(errors, field.path, 'a number is needed here')

  if (field.integer) {
    let asBig: bigint
    try {
      asBig = BigInt(text)
    } catch {
      return fail(errors, field.path, 'a whole number is needed here')
    }
    // compare on bigint when the value cannot be represented exactly as a number
    if (field.big || !isSafe(asBig)) {
      if (outOfBoundsBigInt(asBig, field)) return fail(errors, field.path, boundsMessage(field))
      return asBig
    }
    if (outOfBounds(Number(asBig), field)) return fail(errors, field.path, boundsMessage(field))
    return Number(asBig)
  }

  const asNumber = Number(text)
  if (!Number.isFinite(asNumber)) return fail(errors, field.path, 'a number is needed here')
  if (outOfBounds(asNumber, field)) return fail(errors, field.path, boundsMessage(field))
  return asNumber
}

function readBytes(field: Extract<CborField, { kind: 'bytes' }>, value: CborValue, errors: CborValueError[]): unknown {
  const text = value.kind == 'scalar' ? value.text : ''
  const encoding = (value.kind == 'scalar' ? value.encoding : undefined) ?? 'hex'

  let bytes: Uint8Array
  try {
    bytes = decodeBytes(text, encoding)
  } catch (error) {
    return fail(errors, field.path, messageOf(error))
  }
  if (field.maxLength != null && bytes.length > field.maxLength) {
    return fail(errors, field.path, lengthMessage(field, 'bytes'))
  }
  if (field.minLength != null && bytes.length < field.minLength) {
    return bytes.length == 0
      ? unfilled(errors, field.path, lengthMessage(field, 'bytes'))
      : fail(errors, field.path, lengthMessage(field, 'bytes'))
  }
  return bytes
}

/** What a length bound asks for, said as the schema means it */
function lengthMessage(field: { minLength?: number, maxLength?: number }, unit: string): string {
  const { minLength: min, maxLength: max } = field
  if (min != null && min == max) return `exactly ${min} ${unit}`
  if (min != null && max != null) return `between ${min} and ${max} ${unit}`
  if (max != null) return `at most ${max} ${unit}`
  return `at least ${min} ${unit}`
}

function readAny(field: CborField, value: CborValue, errors: CborValueError[]): unknown {
  const text = (value.kind == 'scalar' ? value.text : '').trim()
  if (!text) return unfilled(errors, field.path, 'a value is needed here, written as CBOR text')
  try {
    return CBOR.parse(text)
  } catch (error) {
    return fail(errors, field.path, messageOf(error))
  }
}

/** Put back the tags the schema wraps the value in, innermost last */
function withTags(field: CborField, value: unknown): unknown {
  if (!field.tags?.length) return value
  return field.tags.reduceRight<unknown>((inner, tag) => CBOR.Tag.set(inner, BigInt(tag)), value)
}

/** Take off the tags the schema knows about, to reach the value they carry */
function untag(value: unknown, field: CborField): unknown {
  let plain = value
  for (let i = 0; i < (field.tags?.length ?? 0); i++) {
    if (CBOR.Tag.get(plain) == null) break
    plain = CBOR.Tag.getValue(plain)
  }
  return plain
}

function mapRows(entries: CborEntry[], js: unknown): CborRow[] {
  const pairs = pairsOf(js)
  const rows: CborRow[] = []
  const taken = new Set<number>()

  entries.forEach((entry, index) => {
    const named = entry.key
    if (named?.kind != 'fixed') return
    pairs.forEach(([key, value], position) => {
      if (taken.has(position) || !sameValue(named.value, key)) return
      taken.add(position)
      rows.push({ id: nextRowId++, entry: index, value: fromJsValue(entry.value, value) })
    })
  })

  // whatever the schema did not name belongs to the member it left open
  const open = entries.findIndex(entry => entry.key?.kind == 'open')
  if (open >= 0) {
    const entry = entries[open]
    pairs.forEach(([key, value], position) => {
      if (taken.has(position)) return
      taken.add(position)
      rows.push({
        id: nextRowId++,
        entry: open,
        key: entry.key?.kind == 'open' ? fromJsValue(entry.key.field, key) : undefined,
        value: fromJsValue(entry.value, value),
      })
    })
  }
  return rows.sort((first, second) => first.entry - second.entry)
}

function arrayRows(entries: CborEntry[], items: unknown[]): CborRow[] {
  const rows: CborRow[] = []
  let position = 0

  entries.forEach((entry, index) => {
    const remaining = minimumOf(entries.slice(index + 1))
    let count = 0
    while (
      position < items.length
      && (count < entry.occur.min || items.length - position > remaining)
      && (entry.occur.max == null || count < entry.occur.max)
      && (count < entry.occur.min || fits(entry.value, items[position]))
    ) {
      rows.push({ id: nextRowId++, entry: index, value: fromJsValue(entry.value, items[position]) })
      position++
      count++
    }
  })
  return rows
}

function minimumOf(entries: CborEntry[]): number {
  return entries.reduce((total, entry) => total + entry.occur.min, 0)
}

function requiredRows(entry: CborEntry, index: number): CborRow[] {
  return Array.from({ length: entry.occur.min }, () => rowOf(entry, index))
}

function pairsOf(js: unknown): [unknown, unknown][] {
  if (js instanceof CBOR.MapEntries) return Array.from(js)
  if (js instanceof Map) return Array.from(js)
  if (js && typeof js == 'object' && !Array.isArray(js)) return Object.entries(js)
  return []
}

function isMapLike(js: unknown): boolean {
  return !!js && typeof js == 'object' && !Array.isArray(js) && !(js instanceof Uint8Array)
}

function fail(errors: CborValueError[], path: string, message: string): undefined {
  errors.push({ path, message, kind: 'invalid' })
  return undefined
}

/**
 * The fields worth marking, by path.
 *
 * A form opens with every field empty, and saying so in red at every one of
 * them tells the reader they have done something wrong before they have done
 * anything at all. Only a field holding something its schema will not take is
 * marked; what is merely unfilled is counted at the foot of the card instead.
 */
export function markedFields(errors: CborValueError[]): Record<string, string> {
  const marked: Record<string, string> = {}
  for (const error of errors) {
    if (error.kind == 'invalid' && !(error.path in marked)) marked[error.path] = error.message
  }
  return marked
}

/** A field nobody has reached yet: the form is unfinished, not wrong */
function unfilled(errors: CborValueError[], path: string, message: string): undefined {
  errors.push({ path, message, kind: 'missing' })
  return undefined
}

function outOfBounds(value: number, field: Extract<CborField, { kind: 'number' }>): boolean {
  return (field.min != null && value < field.min) || (field.max != null && value > field.max)
}

function outOfBoundsBigInt(value: bigint, field: Extract<CborField, { kind: 'number' }>): boolean {
  const min = field.min != null ? BigInt(field.min) : null
  const max = field.max != null ? BigInt(field.max) : null
  return (min != null && value < min) || (max != null && value > max)
}

function boundsMessage(field: Extract<CborField, { kind: 'number' }>): string {
  if (field.min != null && field.max != null) return `between ${field.min} and ${field.max}`
  if (field.min != null) return `${field.min} or more`
  return `${field.max} or less`
}

function matches(pattern: string, text: string): boolean {
  try {
    return new RegExp(pattern).test(text)
  } catch {
    // a pattern this engine cannot read is left for the CDDL verdict to judge
    return true
  }
}

function decodeBytes(text: string, encoding: BytesEncoding): Uint8Array {
  if (encoding == 'utf8') return new TextEncoder().encode(text)
  if (encoding == 'base64') return binaryStringToBytes(atob(text.trim()))

  const hex = text.replace(/\s+/g, '')
  if (hex.length % 2 != 0) throw new Error('a hex string needs two characters per byte')
  if (hex.length > 0 && !/^[0-9a-fA-F]+$/.test(hex)) throw new Error('only hex characters are allowed here')

  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

function toHex(bytes: Uint8Array): string {
  let hex = ''
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0')
  return hex
}

function notationOf(js: unknown): string {
  try {
    return CBOR.stringify(js)
  } catch {
    return ''
  }
}

function defaultText(value: unknown): string {
  if (value == null) return ''
  if (value instanceof Uint8Array) return toHex(value)
  return `${value}`
}

function sameValue(left: unknown, right: unknown): boolean {
  if (left === right) return true
  if (typeof left == 'bigint' || typeof right == 'bigint') {
    return isNumeric(left) && isNumeric(right) && BigInt(left as number) == BigInt(right as number)
  }
  if (left instanceof Uint8Array && right instanceof Uint8Array) {
    return left.length == right.length && left.every((byte, index) => byte == right[index])
  }
  return false
}

function isNumeric(value: unknown): boolean {
  return typeof value == 'bigint' || (typeof value == 'number' && Number.isInteger(value))
}

function isSafe(value: bigint): boolean {
  return value <= BigInt(Number.MAX_SAFE_INTEGER) && value >= BigInt(Number.MIN_SAFE_INTEGER)
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
