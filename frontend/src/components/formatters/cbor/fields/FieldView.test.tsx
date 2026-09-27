/**
 * Tests for the fields a CDDL rule is rendered as, and for what they keep back
 * until it is asked for
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, test, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { CBOR } from '@cbortech/cbor'
import { bytesToBinaryString } from '@/utils/cbor'
import { CborField, deriveShape } from '@/utils/cbor/shape'
import { CborValue, emptyValue, fromNotation, markedFields, toJsValue } from '@/utils/cbor/value'
import CborStructured from '../CborStructured'
import FieldView from './FieldView'

function fieldOf(content: string, rule: string): CborField {
  const { field, error } = deriveShape(content, rule)
  expect(error).toBeUndefined()
  return field
}

/** The markup of a shape being filled in */
function form(content: string, rule: string, value?: CborValue): string {
  const field = fieldOf(content, rule)
  return renderToStaticMarkup(
    <FieldView field={field} value={value ?? emptyValue(field)} onChange={() => undefined} />,
  )
}

/** The markup of a payload read through a rule */
function read(content: string, rule: string, cdn: string): string {
  return renderToStaticMarkup(
    <CborStructured field={fieldOf(content, rule)} payload={bytesToBinaryString(CBOR.compile(cdn))} />,
  )
}

const PERSON = `
person = {
  name: tstr, ; who it is
  ? age: uint,
}
`

describe('writing', () => {
  test('should show the members the rule requires', () => {
    const markup = form(PERSON, 'person')

    expect(markup).toContain('name')
    expect(markup).toContain('<input')
  })

  test('should say nothing is wrong with a form nobody has filled in yet', () => {
    const field = fieldOf('order = { id: uint, item: tstr }', 'order')
    const empty = emptyValue(field)

    // what a card marks is what markedFields hands it, and an untouched form
    // hands it nothing: the reader has not made a mistake by arriving
    expect(markedFields(toJsValue(field, empty).errors)).toEqual({})
    expect(form('order = { id: uint, item: tstr }', 'order')).not.toContain('needed here')
  })

  test('should mark the field holding something its schema will not take', () => {
    const field = fieldOf('order = { item: tstr .size 3 }', 'order')
    const value = fromNotation(field, '{"item": "abcd"}').value

    const marked = markedFields(toJsValue(field, value).errors)
    expect(Object.values(marked)).toEqual(['exactly 3 characters'])
    expect(renderToStaticMarkup(
      <FieldView field={field} value={value} errors={marked} onChange={() => undefined} />,
    )).toContain('exactly 3 characters')
  })

  test('should keep an optional member behind the chip that adds it', () => {
    const markup = form(PERSON, 'person')

    // the member is offered, not laid out: a rule with thirty of them stays readable
    expect(markup).toContain('+ age')
    expect(markup.match(/<input/g)).toHaveLength(1)
  })

  test('should lay out a member the rule requires more than once', () => {
    const markup = form('pair = [2*4 uint]', 'pair')

    expect(markup.match(/<input/g)).toHaveLength(2)
  })

  test('should offer the alternatives of a choice as a switch', () => {
    const markup = form('a = tstr / uint', 'a')

    expect(markup).toContain('<select')
    expect(markup).toContain('tstr')
    expect(markup).toContain('uint')
  })

  test('should offer the values of a set as a list', () => {
    const markup = form('color = "red" / "green"', 'color')

    expect(markup).toContain('&quot;red&quot;</option>')
    expect(markup).toContain('&quot;green&quot;</option>')
  })

  test('should show a value the schema pins without an input for it', () => {
    const markup = form('m = { kind: "event" }', 'm')

    expect(markup).toContain('&quot;event&quot;')
    expect(markup).not.toContain('<input')
  })

  test('should fall back to notation for the one value that needs it', () => {
    const markup = form('tree = { value: uint, ? child: tree }', 'tree')

    expect(markup).toContain('+ child')
    expect(form('a = any', 'a')).toContain('<textarea')
  })

  test('should hold back the type and the tag until they are asked for', () => {
    const markup = form('a = tdate', 'a')

    // the disclosure is there; what it says is not
    expect(markup).toContain('what the schema says about this field')
    expect(markup).not.toContain('tag 0')
  })

  test('should switch a bool with a checkbox rather than a text box', () => {
    expect(form('a = bool', 'a')).toContain('type="checkbox"')
  })
})

describe('reading', () => {
  test('should show a payload under the names its rule gives it', () => {
    const markup = read(PERSON, 'person', '{"name": "ada", "age": 36}')

    expect(markup).toContain('name')
    expect(markup).toContain('ada')
    expect(markup).toContain('36')
  })

  test('should show only the members the payload carries', () => {
    const markup = read(PERSON, 'person', '{"name": "ada"}')

    expect(markup).toContain('ada')
    expect(markup).not.toContain('age')
  })

  test('should offer nothing to fill in', () => {
    const markup = read(PERSON, 'person', '{"name": "ada"}')

    expect(markup).not.toContain('<input')
    expect(markup).not.toContain('+ age')
  })

  test('should show bytes as hex', () => {
    expect(read('a = { raw: bstr }', 'a', `{"raw": h'dead'}`)).toContain('dead')
  })

  test('should report a payload that is not CBOR at all', () => {
    const markup = renderToStaticMarkup(
      <CborStructured field={fieldOf(PERSON, 'person')} payload={'not cbor'} />,
    )

    expect(markup).toMatch(/[A-Za-z]/)
    expect(markup).not.toContain('ada')
  })
})

/**
 * The guide walks through two schemas that ship with the tests, and shows what
 * the form makes of them. A guide is only worth reading while that is still true.
 */
describe('the schemas the guide demonstrates', () => {
  const schemaOf = (name: string) =>
    readFileSync(join(__dirname, '../../../../../../tests/cddlschemas/default', name), 'utf8')

  test('should open person.cddl as the two members it requires', () => {
    const content = schemaOf('person.cddl')
    const markup = form(content, 'person')

    expect(markup.match(/<input/g)).toHaveLength(2)
    expect(markup).toContain('+ email')
    expect(markup).toContain('who it is')
  })

  test('should open order.cddl with required rows and chips for the rest', () => {
    const content = schemaOf('order.cddl')
    const field = fieldOf(content, 'order')
    const markup = form(content, 'order')

    expect(markup).toContain('+ note')
    expect(markup).toContain('+ headers')
    expect(markup).toContain('&quot;shipped&quot;')
    expect(markup).toContain('sku')

    const value = fromNotation(field, `{
      "id": 37(h'000102030405060708090a0b0c0d0e0f'),
      "placed": 0("2026-07-27T00:00:00Z"),
      "status": "new",
      "lines": [{"sku": "ABC-1234", "qty": 2, "price": {"currency": "USD", "cents": 420}}]
    }`).value
    expect(markedFields(toJsValue(field, value).errors)).toEqual({})
  })

  test('should read an order back through the rule it was written with', () => {
    const markup = read(schemaOf('order.cddl'), 'order', `{
      "id": 37(h'4f8a1c2d3e4b5a69788796a5b4c3d2e1'),
      "placed": 0("2026-07-28T09:00:00Z"),
      "status": "paid",
      "lines": [{"sku": "ABC-1234", "qty": 2, "price": {"currency": "EUR", "cents": 4200}}],
      "note": "leave at the door"
    }`)

    expect(markup).toContain('ABC-1234')
    expect(markup).toContain('leave at the door')
    expect(markup).toContain('4f8a1c2d3e4b5a69788796a5b4c3d2e1')
  })
})
