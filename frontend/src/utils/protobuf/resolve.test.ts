import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import * as protobuf from '@/utils/protobuf'
import { detectProtobufMessage, forgetProtobufResolutions, getTopicCache, learnProtobufResolution, resolveProtobuf } from './resolve'

let values: Record<string, string> = {}
const storage = {
  getItem: vi.fn((key: string) => values[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { values[key] = value }),
  removeItem: vi.fn((key: string) => { delete values[key] }),
}
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
const schema = protobuf.parseProtoSchema('syntax = "proto3"; message A { string name = 1; } message B { int32 count = 2; } message Alias { string nick = 1; }', 'events.proto')
const schemas = [schema]
const encode = (type: string, data: object) => String.fromCharCode(...schema.root!.lookupType(type).encode(data).finish())
const a = encode('A', { name: 'Ada' })
const b = encode('B', { count: 42 })
const subject = 'events.created'
const learn = (type: string) => getTopicCache().learnCandidate(subject, schema.name, type)

beforeEach(() => {
  values = {}
  getTopicCache().clear()
  forgetProtobufResolutions()
  storage.setItem.mockClear()
})
afterEach(() => vi.restoreAllMocks())

describe('ordered resolution', () => {
  test('reading shares an answer without teaching; learning is an explicit commit', () => {
    const first = resolveProtobuf(a, schemas, subject)
    expect(resolveProtobuf(a, schemas, subject)).toBe(first)
    expect(first.messageType).toBe('A')
    expect(getTopicCache().lookup(subject)).toBeNull()
    expect(storage.setItem).not.toHaveBeenCalled()
    learnProtobufResolution(subject, first)
    expect(getTopicCache().lookup(subject)?.[0].messageType).toBe('A')
  })

  test('skips empty successful decodes and discovers another type', () => {
    learn('A')
    const answer = resolveProtobuf(b, schemas, subject)
    expect(answer).toMatchObject({ messageType: 'B', decoded: { data: { count: 42 } } })
    learnProtobufResolution(subject, answer)
    expect(getTopicCache().lookup(subject)?.map(candidate => candidate.messageType)).toEqual(['A', 'B'])
  })

  test('first meaningful candidate wins; manual preference changes the winner', () => {
    learn('A')
    learn('Alias')
    expect(resolveProtobuf(a, schemas, subject).messageType).toBe('A')
    getTopicCache().preferCandidate(subject, schema.name, 'Alias')
    expect(resolveProtobuf(a, schemas, subject)).toMatchObject({ messageType: 'Alias', decoded: { data: { nick: 'Ada' } } })
  })

  test('skips missing types and decode errors before trying the next candidate', () => {
    learn('Removed')
    learn('B')
    learn('A')
    expect(resolveProtobuf(a, schemas, subject).messageType).toBe('A')
    expect(getTopicCache().lookup(subject)).toHaveLength(3)
  })

  test('a failed decode is never learned', () => {
    const answer = resolveProtobuf('\xff', schemas, subject)
    learnProtobufResolution(subject, answer)
    expect(getTopicCache().lookup(subject)).toBeNull()
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  test('unknown-field-only results are not automatically selected', () => {
    const onlyA = protobuf.parseProtoSchema('syntax = "proto3"; message A { string name = 1; repeated int32 items = 3; }', 'only.proto')
    expect(detectProtobufMessage(b, [onlyA])).toBeUndefined()
    expect(resolveProtobuf(b, [onlyA], subject)).toEqual({})
  })

  test('steady unique traffic uses the learned type without full detection', () => {
    learnProtobufResolution(subject, resolveProtobuf(a, schemas, subject))
    const decode = vi.spyOn(protobuf, 'decodeProtobufMessage')
    const discover = vi.spyOn(protobuf, 'getAllMessageTypes')
    storage.setItem.mockClear()
    for (let i = 0; i < 100; i++) {
      const answer = resolveProtobuf(encode('A', { name: `user-${i}` }), schemas, subject)
      learnProtobufResolution(subject, answer)
    }
    expect(decode).toHaveBeenCalledTimes(100)
    expect(discover).not.toHaveBeenCalled()
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  test('alternating types keep their order and never repeat full discovery', () => {
    learn('A')
    learn('B')
    const decode = vi.spyOn(protobuf, 'decodeProtobufMessage')
    const discover = vi.spyOn(protobuf, 'getAllMessageTypes')
    for (let i = 0; i < 20; i++) {
      const type = i % 2 ? 'B' : 'A'
      const payload = encode(type, type === 'A' ? { name: `user-${i}` } : { count: i })
      const answer = resolveProtobuf(payload, schemas, subject)
      expect(answer.messageType).toBe(type)
      learnProtobufResolution(subject, answer)
    }
    expect(decode).toHaveBeenCalledTimes(30)
    expect(discover).not.toHaveBeenCalled()
    expect(getTopicCache().lookup(subject)?.map(candidate => candidate.messageType)).toEqual(['A', 'B'])
  })
})

describe('decoded result cache', () => {
  test('unrelated mapping changes keep an existing answer', () => {
    learn('A')
    const first = resolveProtobuf(a, schemas, subject)
    getTopicCache().learnCandidate('other.created', schema.name, 'B')
    expect(resolveProtobuf(a, schemas, subject)).toBe(first)
  })

  test('schema edits and clearing mappings invalidate answers', () => {
    learn('Alias')
    const first = resolveProtobuf(a, schemas, subject)
    getTopicCache().clear()
    const cleared = resolveProtobuf(a, schemas, subject)
    expect(cleared).not.toBe(first)
    expect(cleared.messageType).toBe('A')
    const changed = protobuf.parseProtoSchema('syntax = "proto3"; message A { string changed = 1; }', schema.name)
    expect(resolveProtobuf(a, [changed], subject)).toMatchObject({ decoded: { data: { changed: 'Ada' } } })
  })

  test('new wildcard candidates invalidate affected subjects only', () => {
    for (let i = 0; i < 5; i++) getTopicCache().learnCandidate(`user.${i}.created`, schema.name, 'A')
    const first = resolveProtobuf(b, schemas, 'user.new.created')
    learn('A')
    const unrelated = resolveProtobuf(a, schemas, subject)
    getTopicCache().learnCandidate('user.0.created', schema.name, 'B')
    getTopicCache().learnCandidate('user.1.created', schema.name, 'B')
    expect(resolveProtobuf(b, schemas, 'user.new.created')).not.toBe(first)
    expect(resolveProtobuf(a, schemas, subject)).toBe(unrelated)
  })

  test('retains up to 512 answers using FIFO eviction', () => {
    learn('A')
    const first = resolveProtobuf(a, schemas, subject)
    for (let i = 0; i < 511; i++) resolveProtobuf(encode('A', { name: `user-${i}` }), schemas, subject)
    expect(resolveProtobuf(a, schemas, subject)).toBe(first)
    resolveProtobuf(encode('A', { name: 'overflow' }), schemas, subject)
    expect(resolveProtobuf(a, schemas, subject)).not.toBe(first)
  })
})
