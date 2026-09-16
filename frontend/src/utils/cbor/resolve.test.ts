/**
 * Tests for picking the schema and rule a payload is read under
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { CBOR } from '@cbortech/cbor'
import { bytesToBinaryString } from './index'
import {
  MAX_SCHEMAS_TO_PROBE,
  forgetResolutions,
  getTopicCache,
  probeSchemas,
  rememberedFor,
  resolveCbor,
} from './resolve'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

const logged: { type?: string, body: string }[] = []
vi.mock('@/stores/log', () => ({
  default: { add: (entry: { type?: string, body: string }) => { logged.push(entry) } },
}))

/** The log is written after the render that decided on it, so let that happen */
const said = () => new Promise<typeof logged>(resolve => queueMicrotask(() => resolve(logged)))

const PERSON = { id: 'person', name: 'person.cddl', content: 'person = { name: tstr, age: uint }' }
const PRODUCT = { id: 'product', name: 'product.cddl', content: 'product = { sku: tstr, price: int }' }

function payloadOf(cdn: string): string {
  return bytesToBinaryString(CBOR.compile(cdn))
}

/** Schemas that match nothing, to push the probe up against its bound */
function filler(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `s${index}`,
    name: `s${index}.cddl`,
    content: `s${index} = { only: "${index}" }`,
  }))
}

const person = payloadOf('{"name": "ada", "age": 36}')
const product = payloadOf('{"sku": "x1", "price": 9}')

beforeEach(() => {
  localStorageMock.clear()
  getTopicCache().clear()
  forgetResolutions()
  logged.length = 0
})

describe('probing', () => {
  test('should find the schema and rule a payload matches', () => {
    expect(probeSchemas(person, [PRODUCT, PERSON])).toMatchObject({
      schema: { name: 'person.cddl' },
      rule: 'person',
    })
  })

  test('should pass over a schema that does not compile', () => {
    const broken = { id: 'b', name: 'b.cddl', content: 'this is not cddl', error: 'Failed to compile' }

    expect(probeSchemas(person, [broken, PERSON])).toMatchObject({ rule: 'person' })
  })

  test('should say so when nothing matches rather than pass over it', async () => {
    expect(probeSchemas(payloadOf('[1, 2, 3]'), [PERSON, PRODUCT], 'odd.subject')).toBeUndefined()

    expect((await said()).map(entry => entry.body)).toContain('no schema matches odd.subject')
  })

  test('should say the same thing only once for a subject', async () => {
    probeSchemas(payloadOf('[1]'), [PERSON], 'noisy.subject')
    probeSchemas(payloadOf('[2]'), [PERSON], 'noisy.subject')

    expect((await said()).filter(entry => entry.body.startsWith('no schema matches'))).toHaveLength(1)
  })

  test('should warn when the bound leaves schemas untried', async () => {
    const many = filler(MAX_SCHEMAS_TO_PROBE + 3)

    expect(probeSchemas(person, many)).toBeUndefined()

    expect((await said()).find(entry => entry.type == 'warn')?.body).toBe(
      `no match in the first ${MAX_SCHEMAS_TO_PROBE} of ${many.length} schemas, and the rest were not tried`,
    )
  })

  test('should not warn about the bound when a match is found within it', async () => {
    expect(probeSchemas(person, [PERSON, ...filler(MAX_SCHEMAS_TO_PROBE + 3)])).toMatchObject({ rule: 'person' })

    expect((await said()).filter(entry => entry.type == 'warn')).toHaveLength(0)
  })
})

describe('recalling what a subject carried', () => {
  test('should use a remembered rule that still holds', () => {
    getTopicCache().onSuccessfulDecode('people.new', 'person', 'person')

    expect(resolveCbor(person, [PERSON, PRODUCT], 'people.new')).toMatchObject({
      rule: 'person',
      fromCache: true,
      cacheStale: false,
    })
  })

  test('should report a remembered rule the payload has outgrown', () => {
    getTopicCache().onSuccessfulDecode('mixed.subject', 'person', 'person')

    const answer = resolveCbor(product, [PERSON, PRODUCT], 'mixed.subject')

    expect(answer.cacheStale).toBe(true)
    expect(answer.fromCache).toBe(false)
  })

  test('should detect afresh rather than stay on a rule that stopped holding', () => {
    getTopicCache().onSuccessfulDecode('mixed.subject', 'person', 'person')

    expect(resolveCbor(product, [PERSON, PRODUCT], 'mixed.subject')).toMatchObject({
      schema: { name: 'product.cddl' },
      rule: 'product',
    })
  })

  test('should forget a rule whose schema is no longer on disk', () => {
    getTopicCache().onSuccessfulDecode('people.new', 'gone', 'gone')

    expect(rememberedFor('people.new', [PERSON])).toBeUndefined()
  })

  test('should have nothing to say about a subject never seen', () => {
    expect(rememberedFor('brand.new', [PERSON])).toBeUndefined()
  })
})

describe('keeping answers', () => {
  test('should work a payload out once and hand the same answer back', () => {
    const first = resolveCbor(person, [PERSON, PRODUCT], 'people.new')
    const second = resolveCbor(person, [PERSON, PRODUCT], 'people.new')

    expect(second).toBe(first)
  })

  test('should hand the same answer back when a reread brings the same schemas', () => {
    const first = resolveCbor(person, [PERSON], 'people.new')

    expect(resolveCbor(person, [{ ...PERSON }], 'people.new')).toBe(first)
  })

  test('should work a payload out again once a schema has been edited', () => {
    const first = resolveCbor(person, [PERSON], 'people.new')
    const edited = { ...PERSON, content: 'person = { name: tstr, age: uint, ? note: tstr }' }

    const second = resolveCbor(person, [edited], 'people.new')

    expect(second).not.toBe(first)
    expect(second).toMatchObject({ rule: 'person' })
  })

  test('should keep the answers of two payloads apart', () => {
    expect(resolveCbor(person, [PERSON, PRODUCT]).rule).toBe('person')
    expect(resolveCbor(product, [PERSON, PRODUCT]).rule).toBe('product')
  })

  test('should leave the cache alone: reading a list teaches nothing', () => {
    resolveCbor(person, [PERSON, PRODUCT], 'people.new')

    expect(getTopicCache().lookup('people.new')).toBeNull()
  })
})

describe('decoding', () => {
  test('should decode a payload no schema matches', () => {
    const answer = resolveCbor(payloadOf('[1, 2, 3]'), [PERSON])

    expect(answer.unmatched).toBe(true)
    expect(answer.decoded.success).toBe(true)
    expect(answer.decoded.dataJson).toBe('[\n  1,\n  2,\n  3\n]')
  })

  test('should report a payload that is not CBOR at all', () => {
    const answer = resolveCbor('\uFFFF\uFFFF not cbor', [PERSON])

    expect(answer.decoded.success).toBe(false)
    expect(answer.decoded.error).toBeTruthy()
  })
})
