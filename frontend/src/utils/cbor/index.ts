import { CBOR } from '@cbortech/cbor'
import { CDDL } from '@cbortech/cbor/cddl'
import { CborDecodedData, CborEncodedData, CddlSchema, CddlValidation } from '@/types/Cbor'

type CompiledCddl = ReturnType<typeof CDDL.compile>

interface CompileResult {
  compiled?: CompiledCddl
  error?: string
}

const COMPILED_CACHE_SIZE = 32
const compiledCache = new Map<string, CompileResult>()

/**
 * Compile a CDDL source, keeping the result around.
 * Every row of a message list validates against the same source and compiling
 * costs orders of magnitude more than validating.
 */
export function compileCddl(content: string): CompileResult {
  const cached = compiledCache.get(content)
  if (cached) return cached

  let result: CompileResult
  try {
    result = { compiled: CDDL.compile(content) }
  } catch (error) {
    result = { error: errorMessage(error) }
  }

  if (compiledCache.size >= COMPILED_CACHE_SIZE) {
    const oldest = compiledCache.keys().next().value
    if (oldest != null) compiledCache.delete(oldest)
  }
  compiledCache.set(content, result)
  return result
}

/** Convert a NUI binary-string payload (one character per byte) to bytes */
export function binaryStringToBytes(binaryString: string): Uint8Array {
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i) & 0xff
  }
  return bytes
}

/** Convert bytes to the binary string the publish API expects */
export function bytesToBinaryString(bytes: Uint8Array): string {
  let binaryString = ''
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i])
  }
  return binaryString
}

/**
 * Render a decoded CBOR value as something JSON can hold.
 * CBOR carries types JSON has no syntax for: left alone, bigints and simple
 * values make `JSON.stringify` throw, while tag numbers and non-text map keys
 * are dropped silently. They are rendered here the way CBOR diagnostic
 * notation writes them.
 */
function toJsonSafe(value: unknown): unknown {
  const tag = CBOR.Tag.get(value)
  if (tag != null) {
    // bytes and arrays carry their tag on themselves, so what is inside a tag
    // can be the tagged value again: read on without asking about the tag twice
    const inner = CBOR.Tag.getValue(value)
    return { tag: Number(tag), value: inner === value ? untagged(value) : toJsonSafe(inner) }
  }
  return untagged(value)
}

function untagged(value: unknown): unknown {
  if (value === undefined) return null
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'number' && !Number.isFinite(value)) return String(value)
  if (value instanceof Uint8Array) return `h'${toHex(value)}'`
  if (CBOR.Simple.is(value)) return `simple(${CBOR.Simple.get(value)})`

  // a map holding non-text keys: keep the pairs rather than coerce the keys
  if (value instanceof CBOR.MapEntries || value instanceof Map) {
    return Array.from(value as Iterable<[unknown, unknown]>, ([key, entry]) => [
      toJsonSafe(key),
      toJsonSafe(entry),
    ])
  }

  if (Array.isArray(value)) return value.map(toJsonSafe)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, toJsonSafe(entry)]),
    )
  }
  return value
}

/** Decode a CBOR payload to a JS value and to the JSON text shown in the UI */
export function decodeCborPayload(binaryData: string): CborDecodedData {
  if (!binaryData) return { success: true, dataJson: '' }

  const bytes = binaryStringToBytes(binaryData)
  let data: unknown
  try {
    data = CBOR.decode(bytes)
  } catch (error) {
    const sequence = decodeSequence(bytes)
    if (!sequence) return { success: false, error: `CBOR decode failed: ${errorMessage(error)}` }
    data = sequence
  }

  try {
    return { success: true, data, dataJson: JSON.stringify(toJsonSafe(data), null, 2) }
  } catch (error) {
    return { success: false, data, error: `CBOR render failed: ${errorMessage(error)}` }
  }
}

/** Check a CBOR payload against one rule of a CDDL schema */
export function validateCborPayload(
  binaryData: string,
  schema: CddlSchema,
  rule: string,
): CddlValidation {
  const { compiled, error } = compileCddl(schema.content)
  if (!compiled) return { valid: false, errors: [error ?? 'CDDL compile failed'] }

  try {
    const result = compiled.validate(binaryStringToBytes(binaryData), { rule })
    if (result.valid) return { valid: true, errors: [] }
    return { valid: false, errors: result.errors.map(formatValidationError) }
  } catch (error) {
    return { valid: false, errors: [errorMessage(error)] }
  }
}

/**
 * Decode a CBOR payload, checking it against a CDDL rule when one is selected.
 * The payload is always decoded: a CDDL mismatch is reported next to the data,
 * not in place of it.
 */
export function decodeAndValidateCbor(
  binaryData: string,
  schema?: CddlSchema | null,
  rule?: string,
): CborDecodedData {
  const decoded = decodeCborPayload(binaryData)
  if (!decoded.success || !binaryData || !schema?.content || !rule) return decoded

  const validation = validateCborPayload(binaryData, schema, rule)
  return {
    ...decoded,
    valid: validation.valid,
    validationErrors: validation.valid ? undefined : validation.errors,
    schemaUsed: schema.id || schema.name,
    rule,
  }
}

/**
 * Encode editor text into a CBOR payload.
 * The text is CBOR diagnostic notation (RFC 8949 §8), of which JSON is a
 * subset, so plain JSON goes through untouched.
 */
export function encodeCborPayload(
  text: string,
  schema?: CddlSchema | null,
  rule?: string,
): CborEncodedData {
  if (!text?.trim()) return { success: false, error: 'CBOR encode failed: the payload is empty' }

  let bytes: Uint8Array
  try {
    bytes = CBOR.compile(text)
  } catch (error) {
    return { success: false, error: `CBOR encode failed: ${errorMessage(error)}` }
  }

  // NUI reads a payload back as a single item, so refuse to write a sequence
  if (decodeSequence(bytes)) {
    return { success: false, error: 'CBOR encode failed: expected a single CBOR item' }
  }

  const payload = bytesToBinaryString(bytes)
  if (schema?.content && rule) {
    const validation = validateCborPayload(payload, schema, rule)
    if (!validation.valid) {
      return {
        success: false,
        error: `The payload does not match '${rule}'`,
        validationErrors: validation.errors,
      }
    }
  }
  return { success: true, payload }
}

/**
 * Write a stored CBOR payload back as the diagnostic notation that produced it.
 * Editing a payload means editing its text form, so a payload read from a
 * message or a KV entry has to make the trip back before it can be changed.
 */
export function toCborNotation(binaryData: string): string {
  if (!binaryData) return ''
  try {
    return CBOR.decompile(binaryStringToBytes(binaryData), { indent: 2 })
  } catch {
    // not CBOR at all: leave the payload to the notation editor to complain about
    return binaryData
  }
}

/**
 * Named CDDL rules available as the payload type.
 * File stem first when present (`order.cddl` → `order` before helpers like `uuid`).
 */
export function getRulesFromSchema(schema: CddlSchema): string[] {
  if (!schema?.content) return []
  const { compiled } = compileCddl(schema.content)
  if (!compiled) return []

  const rules: string[] = []
  for (const [name, definitions] of compiled.rules) {
    // a generic rule has no site to bind its parameters from, so the validator
    // rejects it as a target: leave it out of the list
    if (definitions.some(definition => !!definition.generics?.length)) continue
    rules.push(name)
  }

  const stem = schemaStem(schema)
  return rules.sort((a, b) => {
    if (a == stem) return -1
    if (b == stem) return 1
    return a.localeCompare(b)
  })
}

/** The name of the schema file without its path or `.cddl` suffix */
function schemaStem(schema: CddlSchema): string {
  const file = (schema.name || schema.id || "").replace(/\\/g, "/").split("/").pop() ?? ""
  return file.replace(/\.cddl$/i, "")
}

/** Compile a schema and hand it back carrying the failure, if any */
export function prepareCddlSchema(schema: CddlSchema): CddlSchema {
  const { error } = compileCddl(schema.content)
  return { ...schema, error: error ? `Failed to compile: ${error}` : undefined }
}

/** Read a CBOR sequence (RFC 8742): concatenated items rather than one item */
function decodeSequence(bytes: Uint8Array): unknown[] | null {
  try {
    const items = [...CBOR.decodeSeq(bytes)]
    return items.length > 1 ? items : null
  } catch {
    return null
  }
}

function formatValidationError(error: { message: string; path?: string }): string {
  const path = error.path && error.path !== '/' ? error.path : null
  return path ? `${path}: ${error.message}` : error.message
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function toHex(bytes: Uint8Array): string {
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0')
  }
  return hex
}
