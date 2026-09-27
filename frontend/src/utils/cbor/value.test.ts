/**
 * Tests for reading and writing the values the fields of a shape hold
 */

import { describe, test, expect } from 'vitest'
import { CBOR } from '@cbortech/cbor'
import { deriveShape, CborField } from './shape'
import {
  CborRow,
  CborRowsValue,
  CborValue,
  emptyValue,
  fromJsValue,
  fromNotation,
  fromPayload,
  rowOf,
  toJsValue,
  toNotation,
  toPayloadOfValue,
} from './value'
import { bytesToBinaryString, validateCborPayload } from '.'

const PERSON = `
person = {
  name: tstr,
  ? age: uint,
}
`

function fieldOf(content: string, rule: string): CborField {
  const { field, error } = deriveShape(content, rule)
  expect(error).toBeUndefined()
  return field
}

/** The rows of a map or an array value, failing the test rather than the type check */
function rowsOf(value: CborValue): CborRow[] {
  expect(value.kind).toBe('rows')
  return (value as CborRowsValue).rows
}

/** Type a value into the row filling one entry */
function type(value: CborValue, entry: number, text: string): CborValue {
  const rows = rowsOf(value).map(row => row.entry == entry ? { ...row, value: { kind: 'scalar' as const, text } } : row)
  return { kind: 'rows', rows }
}

/** Add a row for an entry the shape leaves out of the form until it is asked for */
function add(field: CborField, value: CborValue, entry: number): CborValue {
  const entries = (field as { entries: Parameters<typeof rowOf>[0][] }).entries
  return { kind: 'rows', rows: [...rowsOf(value), rowOf(entries[entry], entry)] }
}

describe('emptyValue', () => {
  test('should hold a row for every member the schema requires', () => {
    const field = fieldOf(PERSON, 'person')
    const rows = rowsOf(emptyValue(field))

    // the optional member is not in the form until it is asked for
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ entry: 0, value: { kind: 'scalar', text: '' } })
  })

  test('should hold as many rows as the schema needs at least', () => {
    expect(rowsOf(emptyValue(fieldOf('pair = [2*4 uint]', 'pair')))).toHaveLength(2)
  })

  test('should start from the value of `.default`', () => {
    expect(emptyValue(fieldOf('a = uint .default 5', 'a'))).toMatchObject({ text: '5' })
    expect(emptyValue(fieldOf('a = bool .default true', 'a'))).toMatchObject({ kind: 'bool', on: true })
  })

  test('should start a choice on its first alternative', () => {
    expect(emptyValue(fieldOf('a = tstr / uint', 'a'))).toMatchObject({ kind: 'choice', option: 0 })
  })
})

describe('toJsValue', () => {
  test('should read the members of a map', () => {
    const field = fieldOf(PERSON, 'person')
    const value = type(add(field, emptyValue(field), 1), 1, '36')

    expect(toJsValue(field, type(value, 0, 'ada'))).toEqual({
      value: { name: 'ada', age: 36 },
      errors: [],
    })
  })

  test('should report a member left empty as missing, not as wrong', () => {
    const field = fieldOf(PERSON, 'person')

    // an empty text is a text: it is the missing number that has nothing to mean
    expect(toJsValue(field, emptyValue(field))).toEqual({ value: { name: '' }, errors: [] })
    expect(toJsValue(fieldOf('a = uint', 'a'), emptyValue(fieldOf('a = uint', 'a'))).errors)
      .toEqual([{ path: '$', message: 'a number is needed here', kind: 'missing' }])
  })

  test('should report nothing wrong about a form nobody has filled in yet', () => {
    const field = fieldOf(`
      order = {
        id: uint,
        item: tstr .size 8,
        where: "here" / "there",
      }
    `, 'order')

    // the whole point: an untouched form is unfinished, and unfinished is not
    // wrong - the number and the eight-character string are both merely awaited
    expect(toJsValue(field, emptyValue(field)).errors.filter(error => error.kind == 'invalid'))
      .toEqual([])
    expect(toJsValue(field, emptyValue(field)).errors.map(error => error.kind))
      .toEqual(['missing', 'missing'])
  })

  test('should report a number outside the bounds of the schema', () => {
    const field = fieldOf('a = 1..10', 'a')

    expect(toJsValue(field, { kind: 'scalar', text: '11' }).errors)
      .toEqual([{ path: '$', message: 'between 1 and 10', kind: 'invalid' }])
    expect(toJsValue(field, { kind: 'scalar', text: '7' }).value).toBe(7)
  })

  test('should report text the schema will not take', () => {
    expect(toJsValue(fieldOf('a = tstr .size 3', 'a'), { kind: 'scalar', text: 'abcd' }).errors)
      .toEqual([{ path: '$', message: 'exactly 3 characters', kind: 'invalid' }])
    expect(toJsValue(fieldOf('a = tstr .size (0..3)', 'a'), { kind: 'scalar', text: 'abcd' }).errors)
      .toEqual([{ path: '$', message: 'between 0 and 3 characters', kind: 'invalid' }])
    expect(toJsValue(fieldOf('a = tstr .regexp "^[a-z]+$"', 'a'), { kind: 'scalar', text: 'A1' }).errors)
      .toEqual([{ path: '$', message: 'does not match ^[a-z]+$', kind: 'invalid' }])
  })

  test('should report a member that appears too few times', () => {
    const field = fieldOf('pair = [2*4 uint]', 'pair')
    const value: CborValue = { kind: 'rows', rows: [] }

    // an unnamed item of an array goes by the type it is
    expect(toJsValue(field, value).errors).toEqual([
      { path: '$.0', message: "'uint' is needed 2 time(s), not 0", kind: 'missing' },
    ])
  })

  test('should keep a number too large to hold exactly as a bigint', () => {
    expect(toJsValue(fieldOf('a = biguint', 'a'), { kind: 'scalar', text: '18446744073709551615' }).value)
      .toBe(18446744073709551615n)
  })

  test('should enforce bounds on integers too large for Number', () => {
    const field: CborField = {
      kind: 'number',
      path: '$',
      type: 'int',
      integer: true,
      max: 9007199254740996,
    }
    expect(toJsValue(field, { kind: 'scalar', text: '9007199254740997' }).errors).toEqual([
      { path: '$', message: '9007199254740996 or less', kind: 'invalid' },
    ])
  })

  test('should read bytes written as hex, text, or base64', () => {
    const field = fieldOf('a = bstr', 'a')

    expect(toJsValue(field, { kind: 'scalar', text: '01ff', encoding: 'hex' }).value)
      .toEqual(new Uint8Array([0x01, 0xff]))
    expect(toJsValue(field, { kind: 'scalar', text: 'hi', encoding: 'utf8' }).value)
      .toEqual(new Uint8Array([0x68, 0x69]))
    expect(toJsValue(field, { kind: 'scalar', text: 'AQI=', encoding: 'base64' }).value)
      .toEqual(new Uint8Array([0x01, 0x02]))
  })

  test('should report hex that is not a whole number of bytes', () => {
    expect(toJsValue(fieldOf('a = bstr', 'a'), { kind: 'scalar', text: 'abc' }).errors)
      .toEqual([{ path: '$', message: 'a hex string needs two characters per byte', kind: 'invalid' }])
  })

  test('should read an `any` field as diagnostic notation', () => {
    expect(toJsValue(fieldOf('a = any', 'a'), { kind: 'scalar', text: '[1, 2]' }).value).toEqual([1, 2])
    expect(toJsValue(fieldOf('a = any', 'a'), { kind: 'scalar', text: '{oops' }).errors).toHaveLength(1)
  })

  test('should keep the pairs of a map whose keys are not text', () => {
    const field = fieldOf('m = { 1: tstr, 2: tstr }', 'm')
    const rows = rowsOf(emptyValue(field))
    const value: CborValue = {
      kind: 'rows',
      rows: rows.map(row => ({ ...row, value: { kind: 'scalar' as const, text: 'x' } })),
    }

    expect(toJsValue(field, value).value).toBeInstanceOf(CBOR.MapEntries)
  })

  test('should put the value the schema pins in place without asking', () => {
    const field = fieldOf('m = { kind: "event", name: tstr }', 'm')
    const value = type(emptyValue(field), 1, 'started')

    expect(toJsValue(field, value).value).toEqual({ kind: 'event', name: 'started' })
  })
})

describe('tags', () => {
  test('should wrap the value in the tag the schema gives it', () => {
    const field = fieldOf('a = tdate', 'a')
    const { value } = toJsValue(field, { kind: 'scalar', text: '2024-01-01T00:00:00Z' })

    expect(CBOR.Tag.get(value)).toBe(0n)
    expect(CBOR.Tag.getValue(value)).toBe('2024-01-01T00:00:00Z')
  })

  test('should take the tag off again when filling the fields', () => {
    const field = fieldOf('a = tdate', 'a')
    const tagged = CBOR.Tag.set('2024-01-01T00:00:00Z', 0n)

    expect(fromJsValue(field, tagged)).toMatchObject({ text: '2024-01-01T00:00:00Z' })
  })
})

describe('toNotation', () => {
  test('should write what the fields hold as notation', () => {
    const field = fieldOf(PERSON, 'person')
    const value = type(type(add(field, emptyValue(field), 1), 0, 'ada'), 1, '36')

    expect(toNotation(field, value).text).toBe('{\n  "name": "ada",\n  "age": 36\n}')
  })

  test('should write nothing while a field is in error', () => {
    const field = fieldOf('a = uint', 'a')

    const result = toNotation(field, { kind: 'scalar', text: '' })

    expect(result.text).toBeUndefined()
    expect(result.errors).toHaveLength(1)
  })
})

describe('round trips', () => {
  test('should come back the same through notation', () => {
    const field = fieldOf(PERSON, 'person')
    const value = type(type(add(field, emptyValue(field), 1), 0, 'ada'), 1, '36')
    const { text } = toNotation(field, value)

    expect(toJsValue(field, fromNotation(field, text).value).value).toEqual({ name: 'ada', age: 36 })
  })

  test('should come back the same through a payload', () => {
    const field = fieldOf('m = { id: uint, tags: [* tstr], raw: bstr }', 'm')
    const source = { id: 7, tags: ['a', 'b'], raw: new Uint8Array([0xde, 0xad]) }
    const value = fromJsValue(field, source)

    expect(toJsValue(field, value).value).toEqual(source)
  })

  test('should carry a value the schema accepts to a payload the schema accepts', () => {
    const field = fieldOf(PERSON, 'person')
    const value = type(emptyValue(field), 0, 'ada')
    const { payload, errors } = toPayloadOfValue(field, value)

    expect(errors).toEqual([])
    expect(validateCborPayload(payload, { id: 'p', name: 'p.cddl', content: PERSON }, 'person'))
      .toEqual({ valid: true, errors: [] })
  })

  test('should fill the fields from a payload as it arrived', () => {
    const field = fieldOf(PERSON, 'person')
    const payload = bytesToBinaryString(CBOR.compile('{"name": "ada", "age": 36}'))

    expect(toJsValue(field, fromPayload(field, payload).value).value).toEqual({ name: 'ada', age: 36 })
  })

  test('should report a payload that is not CBOR at all', () => {
    expect(fromPayload(fieldOf(PERSON, 'person'), 'not cbor').error).toBeTruthy()
  })
})

describe('filling from a decoded value', () => {
  test('should put the members of a map in their places', () => {
    const field = fieldOf(PERSON, 'person')
    const rows = rowsOf(fromJsValue(field, { name: 'ada', age: 36 }))

    expect(rows.map(row => row.entry)).toEqual([0, 1])
    expect(rows[1].value).toMatchObject({ text: '36' })
  })

  test('should give the members the schema does not name to the open one', () => {
    const field = fieldOf('m = { name: tstr, * tstr => uint }', 'm')
    const rows = rowsOf(fromJsValue(field, { name: 'ada', hits: 3, misses: 1 }))

    expect(rows).toHaveLength(3)
    expect(rows[1]).toMatchObject({ entry: 1, key: { text: 'hits' }, value: { text: '3' } })
  })

  test('should spread the items of an array over the entries that take them', () => {
    const field = fieldOf('a = [head: tstr, * uint]', 'a')
    const rows = rowsOf(fromJsValue(field, ['x', 1, 2, 3]))

    expect(rows.map(row => row.entry)).toEqual([0, 1, 1, 1])
    expect(rows[3].value).toMatchObject({ text: '3' })
  })

  test('should pick the alternative the value fits', () => {
    const field = fieldOf('a = tstr / uint', 'a')

    expect(fromJsValue(field, 42)).toMatchObject({ kind: 'choice', option: 1, value: { text: '42' } })
    expect(fromJsValue(field, 'x')).toMatchObject({ kind: 'choice', option: 0, value: { text: 'x' } })
  })

  test('should pick the value of a set the payload uses', () => {
    expect(fromJsValue(fieldOf('a = "red" / "green"', 'a'), 'green')).toEqual({ kind: 'enum', index: 1 })
  })
})
