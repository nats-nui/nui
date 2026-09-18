/**
 * Tests for deriving the fields of a CDDL rule
 */

import { describe, test, expect } from 'vitest'
import { CborEntry, CborField, deriveShape } from './shape'

/** The field of a rule, failing the test rather than the type check when it has none */
function shapeOf(content: string, rule: string): CborField {
  const { field, error } = deriveShape(content, rule)
  expect(error).toBeUndefined()
  return field
}

/** The entries of a rule that shapes a map or an array */
function entriesOf(content: string, rule: string): CborEntry[] {
  const field = shapeOf(content, rule)
  if (field.kind != 'map' && field.kind != 'array') {
    throw new Error(`expected a map or an array, got ${field.kind}`)
  }
  return field.entries
}

describe('primitives', () => {
  test('should shape the prelude names as their widgets', () => {
    const content = `
      a = tstr
      b = uint
      c = int
      d = bool
      e = bstr
      f = float
      g = nil
    `

    expect(shapeOf(content, 'a')).toMatchObject({ kind: 'text', type: 'tstr' })
    expect(shapeOf(content, 'b')).toMatchObject({ kind: 'number', integer: true, min: 0 })
    expect(shapeOf(content, 'c')).toMatchObject({ kind: 'number', integer: true })
    expect(shapeOf(content, 'd')).toMatchObject({ kind: 'bool' })
    expect(shapeOf(content, 'e')).toMatchObject({ kind: 'bytes' })
    expect(shapeOf(content, 'f')).toMatchObject({ kind: 'number', integer: false })
    expect(shapeOf(content, 'g')).toMatchObject({ kind: 'const', value: null })
  })

  test('should shape a bare major type', () => {
    expect(shapeOf('a = #3', 'a')).toMatchObject({ kind: 'text' })
    expect(shapeOf('a = #1', 'a')).toMatchObject({ kind: 'number', integer: true, max: -1 })
    expect(shapeOf('a = #7.25', 'a')).toMatchObject({ kind: 'number', integer: false })
    // a plain `any` is not a gap in the shape: the schema really does accept anything
    expect(shapeOf('a = #', 'a')).toEqual({ kind: 'any', path: '$', type: '#', hint: undefined })
  })

  test('should shape a literal as the value it pins', () => {
    expect(shapeOf('a = 7', 'a')).toMatchObject({ kind: 'const', value: 7, label: '7' })
    expect(shapeOf('a = "fixed"', 'a')).toMatchObject({ kind: 'const', value: 'fixed' })
  })

  test('should shape a simple value', () => {
    expect(shapeOf('a = #7.19', 'a')).toMatchObject({ kind: 'const', label: 'simple(19)' })
  })
})

describe('maps', () => {
  test('should shape each member with its name, type and occurrence', () => {
    const entries = entriesOf('person = { name: tstr, ? age: uint }', 'person')

    expect(entries).toHaveLength(2)
    expect(entries[0]).toMatchObject({
      label: 'name',
      key: { kind: 'fixed', value: 'name' },
      occur: { min: 1, max: 1 },
      value: { kind: 'text' },
    })
    expect(entries[1]).toMatchObject({
      label: 'age',
      occur: { min: 0, max: 1 },
      value: { kind: 'number', integer: true, min: 0 },
    })
  })

  test('should keep a key that is not a bareword', () => {
    const entries = entriesOf('m = { 1: tstr, "two": uint }', 'm')

    expect(entries[0].key).toEqual({ kind: 'fixed', value: 1, label: '1' })
    expect(entries[1].key).toMatchObject({ kind: 'fixed', value: 'two' })
  })

  test('should leave an open key to the editor', () => {
    const [entry] = entriesOf('m = { * tstr => int }', 'm')

    expect(entry).toMatchObject({
      label: 'entry',
      occur: { min: 0, max: undefined },
      key: { kind: 'open', field: { kind: 'text' } },
      value: { kind: 'number' },
    })
  })

  test('should nest a map inside a map', () => {
    const [entry] = entriesOf('m = { inner: { a: tstr } }', 'm')

    expect(entry.value).toMatchObject({ kind: 'map' })
    expect((entry.value as { entries: CborEntry[] }).entries[0]).toMatchObject({ label: 'a' })
  })

  test('should give every member a path of its own', () => {
    const entries = entriesOf('m = { a: tstr, b: { c: uint } }', 'm')

    expect(entries.map(entry => entry.path)).toEqual(['$.a', '$.b'])
    expect((entries[1].value as { entries: CborEntry[] }).entries[0].path).toBe('$.b.c')
  })
})

describe('arrays', () => {
  test('should shape a fixed array as its positions', () => {
    const entries = entriesOf('point = [x: int, y: int]', 'point')

    expect(entries).toHaveLength(2)
    expect(entries[0]).toMatchObject({ label: 'x', occur: { min: 1, max: 1 } })
    // a position is its own key: there is nothing for the editor to name
    expect(entries[0].key).toBeUndefined()
  })

  test('should shape a repeated entry as rows', () => {
    expect(entriesOf('list = [* tstr]', 'list')[0]).toMatchObject({
      occur: { min: 0 },
      value: { kind: 'text' },
    })
    expect(entriesOf('list = [+ tstr]', 'list')[0]).toMatchObject({ occur: { min: 1 } })
    expect(entriesOf('list = [2*5 tstr]', 'list')[0]).toMatchObject({ occur: { min: 2, max: 5 } })
  })
})

describe('choices', () => {
  test('should shape a choice of types as options', () => {
    const field = shapeOf('a = tstr / uint', 'a')

    expect(field).toMatchObject({ kind: 'choice', type: 'tstr / uint' })
    expect((field as { options: CborField[] }).options.map(option => option.kind)).toEqual(['text', 'number'])
  })

  test('should shape a choice of literals as a set of values', () => {
    const field = shapeOf('color = "red" / "green" / "blue"', 'color')

    expect(field).toMatchObject({
      kind: 'enum',
      options: [
        { label: '"red"', value: 'red' },
        { label: '"green"', value: 'green' },
        { label: '"blue"', value: 'blue' },
      ],
    })
  })

  test('should shape `&` as the values of the group it names', () => {
    const content = `
      level = &levels
      levels = (low: 1, high: 2)
    `

    expect(shapeOf(content, 'level')).toMatchObject({
      kind: 'enum',
      options: [{ label: 'low', value: 1 }, { label: 'high', value: 2 }],
    })
  })

  test('should shape a group choice as alternative shapes', () => {
    const field = shapeOf('m = { a: tstr // b: uint }', 'm')

    expect(field.kind).toBe('choice')
    const options = (field as { options: CborField[] }).options
    expect(options.map(option => option.kind)).toEqual(['map', 'map'])
    expect((options[0] as { entries: CborEntry[] }).entries[0].label).toBe('a')
    expect((options[1] as { entries: CborEntry[] }).entries[0].label).toBe('b')
  })

  test('should keep a rule extended with `/=` as one choice', () => {
    const content = `
      a = tstr
      a /= uint
    `

    expect(shapeOf(content, 'a')).toMatchObject({ kind: 'choice' })
  })
})

describe('groups', () => {
  test('should inline a group referenced inside a map', () => {
    const content = `
      person = { name: tstr, address }
      address = (street: tstr, city: tstr)
    `

    expect(entriesOf(content, 'person').map(entry => entry.label)).toEqual(['name', 'street', 'city'])
  })

  test('should inline a parenthesised group', () => {
    expect(entriesOf('m = { a: tstr, (b: uint, c: bool) }', 'm').map(entry => entry.label))
      .toEqual(['a', 'b', 'c'])
  })

  test('should hand the occurrence of an optional group to its members', () => {
    const entries = entriesOf('m = { a: tstr, ? (b: uint, c: bool) }', 'm')

    expect(entries[1].occur).toEqual({ min: 0, max: 1 })
    expect(entries[2].occur).toEqual({ min: 0, max: 1 })
  })

  test('should inline the members of an unwrapped map', () => {
    const content = `
      base = { id: uint }
      full = { ~base, name: tstr }
    `

    expect(entriesOf(content, 'full').map(entry => entry.label)).toEqual(['id', 'name'])
  })
})

describe('tags', () => {
  test('should carry the tag next to the value it wraps', () => {
    expect(shapeOf('a = #6.32(tstr)', 'a')).toMatchObject({ kind: 'text', tags: [32] })
  })

  test('should resolve a tagged prelude name', () => {
    expect(shapeOf('a = tdate', 'a')).toMatchObject({ kind: 'text', tags: [0], type: 'tdate' })
  })

  test('should nest tags outermost first', () => {
    expect(shapeOf('a = #6.55799(#6.32(tstr))', 'a')).toMatchObject({ tags: [55799, 32] })
  })
})

describe('constraints', () => {
  test('should read a range as bounds', () => {
    expect(shapeOf('a = 1..10', 'a')).toMatchObject({ kind: 'number', min: 1, max: 10 })
    expect(shapeOf('a = 1...10', 'a')).toMatchObject({ kind: 'number', min: 1, max: 9 })
  })

  test('should read `.size` as the length the schema asks for, exactly', () => {
    expect(shapeOf('a = tstr .size 20', 'a'))
      .toMatchObject({ kind: 'text', minLength: 20, maxLength: 20 })
    expect(shapeOf('a = bstr .size 4', 'a'))
      .toMatchObject({ kind: 'bytes', minLength: 4, maxLength: 4 })
  })

  test('should read `.size (a..b)` as a range of lengths', () => {
    expect(shapeOf('a = tstr .size (0..140)', 'a'))
      .toMatchObject({ kind: 'text', minLength: 0, maxLength: 140 })
    expect(shapeOf('a = bstr .size (1...4)', 'a'))
      .toMatchObject({ kind: 'bytes', minLength: 1, maxLength: 3 })
  })

  test('should read a comparison as a bound', () => {
    expect(shapeOf('a = uint .le 100', 'a')).toMatchObject({ max: 100 })
    expect(shapeOf('a = uint .gt 0', 'a')).toMatchObject({ min: 1 })
  })

  test('should read `.regexp` as a pattern', () => {
    expect(shapeOf('a = tstr .regexp "[a-z]+"', 'a')).toMatchObject({ pattern: '[a-z]+' })
  })

  test('should read `.default` as the value to start from', () => {
    expect(shapeOf('a = uint .default 5', 'a')).toMatchObject({ defaultValue: 5 })
  })

  test('should keep the value when the control says nothing about the widget', () => {
    expect(shapeOf('a = bstr .cbor tstr', 'a')).toMatchObject({ kind: 'bytes' })
  })
})

describe('generics', () => {
  test('should shape a rule that binds its parameters', () => {
    const content = `
      envelope<t> = { body: t }
      reading = envelope<uint>
    `

    expect(entriesOf(content, 'reading')[0]).toMatchObject({
      label: 'body',
      value: { kind: 'number', integer: true, min: 0 },
    })
  })

  test('should refuse to shape a generic rule on its own', () => {
    const { field, error } = deriveShape('envelope<t> = { body: t }', 'envelope')

    expect(field).toBeUndefined()
    expect(error).toContain('generic')
  })
})

describe('limits', () => {
  test('should leave a rule that refers back to itself to notation', () => {
    const content = 'tree = { value: uint, ? child: tree }'
    const [, child] = entriesOf(content, 'tree')

    expect(child.value).toMatchObject({ kind: 'any', reason: 'recursive' })
  })

  test('should report a rule the schema does not define', () => {
    expect(deriveShape('a = tstr', 'missing').error).toContain('missing')
  })

  test('should report a schema that does not compile', () => {
    expect(deriveShape('a = = =', 'a').error).toBeTruthy()
  })
})

describe('hints', () => {
  test('should take the comment written after a member', () => {
    const content = `
      person = {
        name: tstr, ; who it is
        age: uint,
      }
    `

    expect(entriesOf(content, 'person')[0].hint).toBe('who it is')
  })

  test('should take the comment written above a member', () => {
    const content = `
      person = {
        ; who it is
        name: tstr,
      }
    `

    expect(entriesOf(content, 'person')[0].hint).toBe('who it is')
  })

  test('should leave a member with no comment without a hint', () => {
    expect(entriesOf('person = { name: tstr }', 'person')[0].hint).toBeUndefined()
  })
})
