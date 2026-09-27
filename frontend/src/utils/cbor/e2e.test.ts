/**
 * End-to-end check: publishes through the NUI API and reads the bytes back
 * from JetStream, so the CBOR the send card writes is the CBOR the message
 * list reads.
 *
 * Skipped unless NUI_E2E is set. Needs JetStream on :4222, NUI on :31311,
 * and person.cddl in the schemas directory:
 *
 *   nats-server -js
 *   go run ./cmd/server --cddl-schemas-path=./tests/cddlschemas/default
 *   cd frontend && NUI_E2E=1 npx vitest run src/utils/cbor/e2e.test.ts
 */

import { describe, test, expect, beforeAll } from 'vitest'
import { MSG_FORMAT, toPayload } from '@/utils/editor'
import { decodeAndValidateCbor } from './index'
import { CborEntry, CborField, deriveShape } from './shape'
import { CborRowsValue, CborValue, emptyValue, toJsValue, toNotation } from './value'

const API = 'http://localhost:31311/api'
const SUBJECT = 'test.person'
const STREAM = 'cbor_e2e'

let connectionId = ''
let personSchema: { id: string; name: string; content: string }

async function api(path: string, body?: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${text}`)
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/** Something a field will take, whatever the fixture schema asks for */
function sampleOf(field: CborField): CborValue {
  if (field.kind == 'bool') return { kind: 'bool', on: true }
  if (field.kind == 'number') return { kind: 'scalar', text: '45' }
  if (field.kind == 'bytes') return { kind: 'scalar', text: 'dead', encoding: 'hex' }
  return { kind: 'scalar', text: 'grace' }
}

/** publish exactly the way the send card does: toPayload, then base64 */
async function publish(text: string, format: MSG_FORMAT) {
  const { payload, error } = toPayload(text, format)
  if (error) return { error }
  await api(`/connection/${connectionId}/messages/publish`, {
    subject: SUBJECT,
    payload: btoa(payload),
    headers: {},
  })
  return { error: undefined }
}

/** read the payloads back as the binary strings the message list receives */
async function received(): Promise<string[]> {
  const messages = await api(`/connection/${connectionId}/stream/${STREAM}/messages`)
  return messages.map((message: { payload: string }) => atob(message.payload))
}

describe.runIf(process.env.NUI_E2E)('CBOR over the NUI API', () => {

  beforeAll(async () => {
    const schemas = await api('/cddl')
    personSchema = schemas.find((schema: { id: string }) => schema.id === 'person')

    const connection = await api('/connection', { name: 'cbor-e2e', hosts: ['localhost:4222'] })
    connectionId = connection.id
    await api(`/connection/${connectionId}/stream`, {
      name: STREAM,
      storage: 'memory',
      subjects: [SUBJECT],
    }).catch(() => null)
    // start from a known state: the stream outlives a single run
    await api(`/connection/${connectionId}/stream/${STREAM}/purge`, { seq: null, keep: null, subject: null })
  })

  test('should carry a CBOR payload to NATS and back, matching its CDDL rule', async () => {
    expect(personSchema?.content).toContain('person = {')

    const sent = await publish('{"name": "ada", "age": 36, "email": "ada@example.com"}', MSG_FORMAT.CBOR)
    expect(sent.error).toBeUndefined()

    const payloads = await received()
    const decoded = decodeAndValidateCbor(payloads[0], personSchema, 'person')

    expect(decoded.data).toEqual({ name: 'ada', age: 36, email: 'ada@example.com' })
    expect(decoded.valid).toBe(true)
  })

  test('should show the data and the mismatch for a payload the rule rejects', async () => {
    await publish('{"name": "ada", "age": -3, "email": "ada@example.com"}', MSG_FORMAT.CBOR)

    const payloads = await received()
    const decoded = decodeAndValidateCbor(payloads[1], personSchema, 'person')

    expect(decoded.success).toBe(true)
    expect(decoded.data).toMatchObject({ name: 'ada', age: -3 })
    expect(decoded.valid).toBe(false)
    expect(decoded.validationErrors?.[0]).toMatch(/^\/age: /)
  })

  test('should not send text that cannot be encoded', async () => {
    const before = (await received()).length

    const sent = await publish('{not valid', MSG_FORMAT.CBOR)

    expect(sent.error).toMatch(/^CBOR encode failed: /)
    expect(await received()).toHaveLength(before)
  })

  test('should report a payload that was never CBOR', async () => {
    await publish('hello world', MSG_FORMAT.TEXT)

    const payloads = await received()
    const decoded = decodeAndValidateCbor(payloads[2], personSchema, 'person')

    expect(decoded.success).toBe(false)
    expect(decoded.error).toMatch(/^CBOR decode failed: /)
  })

  test('should carry a payload built from the fields of its rule', async () => {
    const before = (await received()).length
    const { field } = deriveShape(personSchema.content, 'person')
    const entries = (field as { entries: CborEntry[] }).entries

    // fill in the members the rule requires, as the form lays them out
    const { rows } = emptyValue(field) as CborRowsValue
    const value: CborValue = {
      kind: 'rows',
      rows: rows.map(row => ({ ...row, value: sampleOf(entries[row.entry].value) })),
    }
    const { text, errors } = toNotation(field, value)

    expect(errors).toEqual([])
    expect(await publish(text, MSG_FORMAT.CBOR)).toEqual({ error: undefined })

    const payloads = await received()
    const decoded = decodeAndValidateCbor(payloads[before], personSchema, 'person')

    expect(decoded.data).toEqual(toJsValue(field, value).value)
    expect(decoded.valid).toBe(true)
  })
})
