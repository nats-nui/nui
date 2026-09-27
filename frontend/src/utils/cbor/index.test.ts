/**
 * Tests for the CBOR decode/encode helpers and their CDDL verdict
 */

import { describe, test, expect } from 'vitest'
import { CBOR } from '@cbortech/cbor'
import {
  binaryStringToBytes,
  bytesToBinaryString,
  compileCddl,
  decodeAndValidateCbor,
  decodeCborPayload,
  encodeCborPayload,
  getRulesFromSchema,
  prepareCddlSchema,
  validateCborPayload,
} from './index'

const PERSON_CDDL = `
person = {
  name: tstr,
  age: uint,
}
`

const PRODUCT_CDDL = `
product = {
  id: int,
  name: tstr,
  price: float64,
}
`

const GENERIC_CDDL = `
envelope<t> = { body: t }
reading = envelope<int>
`

const personSchema = { id: 'simple', name: 'simple.cddl', content: PERSON_CDDL }
const productSchema = { id: 'simple2', name: 'simple2.cddl', content: PRODUCT_CDDL }

/** Build the payload NUI would receive from a CBOR diagnostic notation literal */
function payloadOf(cdn: string): string {
  return bytesToBinaryString(CBOR.compile(cdn))
}

describe('binary string conversion', () => {
  test('should round-trip bytes that are not valid text', () => {
    const bytes = new Uint8Array([0x00, 0x7f, 0x80, 0xfe, 0xff])

    expect(Array.from(binaryStringToBytes(bytesToBinaryString(bytes)))).toEqual(Array.from(bytes))
  })

  test('should map one character to one byte', () => {
    expect(bytesToBinaryString(new Uint8Array([0xa1, 0x61, 0x61, 0x01]))).toHaveLength(4)
    expect(binaryStringToBytes('')).toEqual(new Uint8Array(0))
  })
})

describe('decodeCborPayload', () => {
  test('should decode a map to a value and to indented JSON', () => {
    const result = decodeCborPayload(payloadOf('{"name": "ada", "age": 36}'))

    expect(result).toMatchObject({ success: true, data: { name: 'ada', age: 36 } })
    expect(result.dataJson).toBe('{\n  "name": "ada",\n  "age": 36\n}')
  })

  test('should decode nested arrays and maps', () => {
    const result = decodeCborPayload(payloadOf('{"tags": ["a", "b"], "meta": {"ok": true}}'))

    expect(result.data).toEqual({ tags: ['a', 'b'], meta: { ok: true } })
  })

  test('should treat an empty payload as an empty document, not a failure', () => {
    expect(decodeCborPayload('')).toEqual({ success: true, dataJson: '' })
  })

  test('should report a payload that is not CBOR', () => {
    const result = decodeCborPayload('not-cbor')

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/^CBOR decode failed: /)
    expect(result.dataJson).toBeUndefined()
  })

  test('should decode a CBOR sequence as a list of items', () => {
    const result = decodeCborPayload(payloadOf('1\n2'))

    expect(result).toMatchObject({ success: true, data: [1, 2] })
  })

  describe('types JSON cannot hold', () => {
    test('should render a byte string as hex rather than as an index map', () => {
      const result = decodeCborPayload(payloadOf("{\"blob\": h'deadbeef'}"))

      expect(JSON.parse(result.dataJson)).toEqual({ blob: "h'deadbeef'" })
    })

    test('should render a bignum as digits instead of failing to serialize', () => {
      const result = decodeCborPayload(payloadOf('18446744073709551616'))

      expect(result.success).toBe(true)
      expect(JSON.parse(result.dataJson)).toBe('18446744073709551616')
    })

    test('should render an unassigned simple value instead of failing to serialize', () => {
      const result = decodeCborPayload(payloadOf('simple(19)'))

      expect(result.success).toBe(true)
      expect(JSON.parse(result.dataJson)).toBe('simple(19)')
    })

    test('should keep the tag number of a tagged value', () => {
      const result = decodeCborPayload(payloadOf('999("payload")'))

      expect(JSON.parse(result.dataJson)).toEqual({ tag: 999, value: 'payload' })
    })

    test('should keep the tag number of a tagged byte string', () => {
      // a tag around bytes is how a UUID travels, and the bytes are their own
      // container: reading the tag off them must not hand them back tagged
      const result = decodeCborPayload(payloadOf(`37(h'000102030405060708090a0b0c0d0e0f')`))

      expect(result.success).toBe(true)
      expect(JSON.parse(result.dataJson))
        .toEqual({ tag: 37, value: `h'000102030405060708090a0b0c0d0e0f'` })
    })

    test('should keep the pairs of a map whose keys are not text', () => {
      const result = decodeCborPayload(payloadOf('{1: "x", 2: "y"}'))

      expect(JSON.parse(result.dataJson)).toEqual([[1, 'x'], [2, 'y']])
    })

    test('should render undefined as null', () => {
      const result = decodeCborPayload(bytesToBinaryString(new Uint8Array([0x81, 0xf7])))

      expect(JSON.parse(result.dataJson)).toEqual([null])
    })
  })
})

describe('compileCddl', () => {
  test('should compile a schema only once', () => {
    expect(compileCddl(PERSON_CDDL).compiled).toBe(compileCddl(PERSON_CDDL).compiled)
  })

  test('should report a schema it cannot parse', () => {
    const result = compileCddl('this is = not ) valid')

    expect(result.compiled).toBeUndefined()
    expect(result.error).toBeTruthy()
  })
})

describe('getRulesFromSchema', () => {
  test('should list the rules in source order when there is one', () => {
    expect(getRulesFromSchema(personSchema)).toEqual(['person'])
  })

  test('should put the file stem first so picking a schema lands on the message type', () => {
    const schema = {
      id: 'order',
      name: 'order.cddl',
      content: `
        line = { sku: tstr }
        amount = { cents: uint }
        order = { lines: [+ line], total: amount }
        uuid = bstr
      `,
    }
    expect(getRulesFromSchema(schema)[0]).toBe('order')
  })

  test('should leave out generic rules, which cannot be validated against', () => {
    expect(getRulesFromSchema({ name: 'generic.cddl', content: GENERIC_CDDL })).toEqual(['reading'])
  })

  test('should return nothing for a schema that does not compile', () => {
    expect(getRulesFromSchema({ name: 'bad.cddl', content: 'this is = not ) valid' })).toEqual([])
    expect(getRulesFromSchema({ name: 'empty.cddl', content: '' })).toEqual([])
  })
})

describe('prepareCddlSchema', () => {
  test('should leave a valid schema without an error', () => {
    expect(prepareCddlSchema(personSchema)).toEqual({ ...personSchema, error: undefined })
  })

  test('should attach the reason a schema cannot be compiled', () => {
    const prepared = prepareCddlSchema({ name: 'bad.cddl', content: 'this is = not ) valid' })

    expect(prepared.error).toMatch(/^Failed to compile: /)
  })
})

describe('validateCborPayload', () => {
  test('should accept a payload that matches the rule', () => {
    const payload = payloadOf('{"name": "ada", "age": 36}')

    expect(validateCborPayload(payload, personSchema, 'person')).toEqual({ valid: true, errors: [] })
  })

  test('should point at the member that does not match', () => {
    const payload = payloadOf('{"name": "ada", "age": -3}')

    const result = validateCborPayload(payload, personSchema, 'person')

    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toMatch(/^\/age: /)
  })

  test('should report a rule the schema does not define', () => {
    const payload = payloadOf('{"name": "ada", "age": 36}')

    const result = validateCborPayload(payload, personSchema, 'nope')

    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain("'nope' is not defined")
  })

  test('should report a schema that does not compile', () => {
    const payload = payloadOf('1')

    const result = validateCborPayload(payload, { name: 'bad.cddl', content: 'a = )' }, 'a')

    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
  })
})

describe('decodeAndValidateCbor', () => {
  test('should decode without a verdict when no rule is selected', () => {
    const result = decodeAndValidateCbor(payloadOf('{"name": "ada", "age": 36}'))

    expect(result.success).toBe(true)
    expect(result.valid).toBeUndefined()
    expect(result.validationErrors).toBeUndefined()
  })

  test('should mark a payload that matches the selected rule', () => {
    const result = decodeAndValidateCbor(payloadOf('{"name": "ada", "age": 36}'), personSchema, 'person')

    expect(result).toMatchObject({
      success: true,
      valid: true,
      schemaUsed: 'simple',
      rule: 'person',
    })
    expect(result.validationErrors).toBeUndefined()
  })

  test('should still return the data when the payload does not match the rule', () => {
    const result = decodeAndValidateCbor(payloadOf('{"name": "ada", "age": 36}'), productSchema, 'product')

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ name: 'ada', age: 36 })
    expect(result.valid).toBe(false)
    expect(result.validationErrors?.length).toBeGreaterThan(0)
  })

  test('should skip validation when the payload is not CBOR', () => {
    const result = decodeAndValidateCbor('not-cbor', personSchema, 'person')

    expect(result.success).toBe(false)
    expect(result.valid).toBeUndefined()
  })
})

describe('encodeCborPayload', () => {
  test('should encode JSON text', () => {
    const result = encodeCborPayload('{"name": "ada", "age": 36}')

    expect(result.success).toBe(true)
    expect(decodeCborPayload(result.payload).data).toEqual({ name: 'ada', age: 36 })
  })

  test('should encode the CBOR types JSON has no syntax for', () => {
    const result = encodeCborPayload("h'deadbeef'")

    expect(Array.from(binaryStringToBytes(result.payload))).toEqual([0x44, 0xde, 0xad, 0xbe, 0xef])
  })

  test('should refuse an empty payload', () => {
    expect(encodeCborPayload('')).toEqual({ success: false, error: expect.stringContaining('empty') })
    expect(encodeCborPayload('   ')).toEqual({ success: false, error: expect.stringContaining('empty') })
  })

  test('should refuse text it cannot read', () => {
    const result = encodeCborPayload('{not valid')

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/^CBOR encode failed: /)
    expect(result.payload).toBeUndefined()
  })

  test('should refuse a sequence, which NUI would not read back', () => {
    const result = encodeCborPayload('1\n2')

    expect(result.success).toBe(false)
    expect(result.error).toContain('single CBOR item')
  })

  test('should accept a payload that matches the selected rule', () => {
    const result = encodeCborPayload('{"name": "ada", "age": 36}', personSchema, 'person')

    expect(result.success).toBe(true)
    expect(result.validationErrors).toBeUndefined()
  })

  test('should refuse a payload that does not match the selected rule', () => {
    const result = encodeCborPayload('{"name": "ada", "age": -3}', personSchema, 'person')

    expect(result.success).toBe(false)
    expect(result.error).toContain("'person'")
    expect(result.validationErrors?.[0]).toMatch(/^\/age: /)
    expect(result.payload).toBeUndefined()
  })

  test('should produce a payload the decoder reads back unchanged', () => {
    const text = '{"name": "ada", "age": 36}'

    const encoded = encodeCborPayload(text)
    const decoded = decodeAndValidateCbor(encoded.payload, personSchema, 'person')

    expect(decoded.valid).toBe(true)
    expect(decoded.data).toEqual(JSON.parse(text))
  })
})
