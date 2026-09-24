import { beforeEach, describe, expect, test, vi } from 'vitest'
import { parseProtoSchema } from '@/utils/protobuf'
import { ProtoSchema } from '@/types/Protobuf'
import { detectProtobufMessage, forgetProtobufResolutions, getTopicCache, getTopicCacheRevision, resolveProtobuf, subscribeToTopicCache } from './resolve'

const storage = (() => {
  let values: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => values[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { values[key] = value }),
    removeItem: vi.fn((key: string) => { delete values[key] }),
    clear: () => { values = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: storage })

const personSchema = parseProtoSchema('syntax = "proto3"; message Person { string name = 1; }', 'person.proto')
const otherSchema = parseProtoSchema('syntax = "proto3"; message Other { int32 count = 2; }', 'other.proto')
const person = String.fromCharCode(...personSchema.root!.lookupType('Person').encode({ name: 'Ada' }).finish())

beforeEach(() => {
  storage.clear()
  getTopicCache().clear()
  forgetProtobufResolutions()
  storage.setItem.mockClear()
})

describe('protobuf list resolution', () => {
  test('shares one answer for the same subject and payload without teaching the topic cache', () => {
    const schemas = [personSchema]
    const first = resolveProtobuf(person, schemas, 'people.created')
    const second = resolveProtobuf(person, schemas, 'people.created')

    expect(first).toBe(second)
    expect(first).toMatchObject({ messageType: 'Person', decoded: { success: true, data: { name: 'Ada' } } })
    expect(getTopicCache().lookup('people.created')).toBeNull()
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  test('uses a remembered message type without changing the mapping', () => {
    getTopicCache().onSuccessfulDecode('people.created', 'person.proto', 'Person')
    storage.setItem.mockClear()

    const answer = resolveProtobuf(person, [personSchema], 'people.created')

    expect(answer).toMatchObject({ messageType: 'Person', decoded: { success: true } })
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  test('forgets a row answer after the card teaches a subject', () => {
    const schemas = [otherSchema, personSchema]
    const before = resolveProtobuf(person, schemas, 'people.created')
    const onChange = vi.fn()
    const unsubscribe = subscribeToTopicCache(onChange)
    const revision = getTopicCacheRevision()

    getTopicCache().onSuccessfulDecode('people.created', 'person.proto', 'Person')

    const after = resolveProtobuf(person, schemas, 'people.created')
    expect(onChange).toHaveBeenCalledOnce()
    expect(getTopicCacheRevision()).toBeGreaterThan(revision)
    expect(after).not.toBe(before)
    expect(after).toMatchObject({ schema: { name: 'person.proto' }, messageType: 'Person' })
    unsubscribe()
  })

  test('invalidates row answers after a conflict or clear', () => {
    const schemas = [otherSchema, personSchema]
    getTopicCache().onSuccessfulDecode('people.created', 'person.proto', 'Person')
    const remembered = resolveProtobuf(person, schemas, 'people.created')

    getTopicCache().handleConflict('people.created', 'other.proto', 'Other')
    const conflicted = resolveProtobuf(person, schemas, 'people.created')
    expect(conflicted).not.toBe(remembered)
    expect(conflicted.schema).toBe(otherSchema)

    getTopicCache().clear()
    const cleared = resolveProtobuf(person, schemas, 'people.created')
    expect(cleared).not.toBe(conflicted)
    expect(cleared.schema).toBe(personSchema)
  })

  test('invalidates answers when schema content changes', () => {
    const first = resolveProtobuf(person, [personSchema])
    const changed: ProtoSchema = parseProtoSchema('syntax = "proto3"; message Person { string alias = 1; }', 'person.proto')
    const second = resolveProtobuf(person, [changed])

    expect(second).not.toBe(first)
    expect(second.schema).toBe(changed)
  })

  test('keeps the card detector selection consistent with row selection', () => {
    const schemas = [personSchema]
    expect(detectProtobufMessage(person, schemas)?.messageType).toBe(resolveProtobuf(person, schemas).messageType)
  })
})
