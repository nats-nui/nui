import { describe, expect, test } from 'vitest'
import { decodeProtobufMessage, parseProtoSchema } from '@/utils/protobuf'

const schema = parseProtoSchema(`syntax = "proto3";
message Known { int32 count = 1; bool enabled = 2; string name = 3; repeated int32 items = 4; map<string, int32> labels = 5; }
message Other { string text = 6; }`, 'fields.proto')
const encode = (type: string, data: object) => String.fromCharCode(...schema.root!.lookupType(type).encode(data).finish())

describe('recognized payload fields', () => {
  test('unknown fields and initialized empty containers do not count', () => {
    const result = decodeProtobufMessage(encode('Other', { text: 'hello' }), schema, 'Known')
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ items: [], labels: {} })
    expect(result.recognizedFieldCount).toBe(0)
  })
  test('explicit zero, false and empty string count', () => {
    const result = decodeProtobufMessage(encode('Known', { count: 0, enabled: false, name: '' }), schema, 'Known')
    expect(result.recognizedFieldCount).toBe(3)
  })
  test('nonempty repeated and map fields count', () => {
    const result = decodeProtobufMessage(encode('Known', { items: [0], labels: { key: 0 } }), schema, 'Known')
    expect(result.recognizedFieldCount).toBe(2)
  })
})
