import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { ProtobufTopicCache } from './ProtobufTopicCache'

const KEY = 'nats-protobuf-patterns-v2'
const LEGACY = 'nats-protobuf-patterns'
let values: Record<string, string> = {}
const storage = {
  getItem: vi.fn((key: string) => values[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { values[key] = value }),
  removeItem: vi.fn((key: string) => { delete values[key] }),
}
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
const caches: ProtobufTopicCache[] = []
const create = () => {
  const cache = new ProtobufTopicCache()
  caches.push(cache)
  return cache
}
let cache: ProtobufTopicCache
beforeEach(() => {
  values = {}
  vi.clearAllMocks()
  cache = create()
})
afterEach(() => { caches.splice(0).forEach(cache => cache.dispose()) })
const types = (cache: ProtobufTopicCache, subject = 'events.created') => cache.lookup(subject)?.map(candidate => candidate.messageType)
const legacy = { version: 1, root: { c: { events: { c: { created: { m: { s: 'schema', t: 'A', c: 0.9 } } } } } } }

describe('ordered subject candidates', () => {
  test('appends learned types and promotes manual choices without dropping alternatives', () => {
    cache.learnCandidate('events.created', 'schema', 'A')
    cache.learnCandidate('events.created', 'schema', 'B')
    expect(types(cache)).toEqual(['A', 'B'])
    cache.preferCandidate('events.created', 'schema', 'B')
    expect(types(cache)).toEqual(['B', 'A'])
    cache.learnCandidate('events.created', 'schema', 'A')
    expect(types(cache)).toEqual(['B', 'A'])
  })

  test('repeated learning or preference causes no writes or notifications', () => {
    cache.learnCandidate('events.created', 'schema', 'A')
    const revision = cache.getRevision()
    const changed = vi.fn()
    cache.subscribe(changed)
    storage.setItem.mockClear()
    for (let i = 0; i < 20; i++) {
      cache.learnCandidate('events.created', 'schema', 'A')
      cache.preferCandidate('events.created', 'schema', 'A')
    }
    expect(storage.setItem).not.toHaveBeenCalled()
    expect(changed).not.toHaveBeenCalled()
    expect(cache.getRevision()).toBe(revision)
  })

  test('candidate identity includes the schema', () => {
    cache.learnCandidate('events.created', 'one.proto', 'Event')
    cache.learnCandidate('events.created', 'two.proto', 'Event')
    expect(cache.lookup('events.created')).toHaveLength(2)
  })

  test('patterns accumulate candidates without overriding exact preferences', () => {
    for (let i = 0; i < 5; i++) cache.learnCandidate(`user.${i}.created`, 'schema', 'A')
    cache.learnCandidate('user.0.created', 'schema', 'B')
    cache.learnCandidate('user.1.created', 'schema', 'B')
    expect(types(cache, 'user.new.created')).toEqual(['A', 'B'])
    cache.preferCandidate('user.new.created', 'schema', 'C')
    expect(types(cache, 'user.new.created')).toEqual(['C'])
    expect(types(cache, 'user.another.created')).toEqual(['A', 'B'])
  })
})

describe('persistence and migration', () => {
  test('round-trips ordered candidates in the v2 document', () => {
    cache.learnCandidate('events.created', 'schema', 'A')
    cache.preferCandidate('events.created', 'schema', 'B')
    expect(JSON.parse(values[KEY]).version).toBe(2)
    expect(types(create())).toEqual(['B', 'A'])
    expect(values[LEGACY]).toBeUndefined()
  })

  test('migrates legacy exact mappings and wildcard confidence once', () => {
    const data = structuredClone(legacy)
    ;(data.root.c.events as any).w = { m: { s: 'schema', t: 'Fallback', c: 0.7, e: ['events.one', 'events.two'] } }
    values[LEGACY] = JSON.stringify(data)
    const migrated = create()
    expect(migrated.lookup('events.created')).toEqual([{ schema: 'schema', messageType: 'A', confidence: 0.9 }])
    expect(migrated.lookup('events.other')).toEqual([{ schema: 'schema', messageType: 'Fallback', confidence: 0.7, examples: ['events.one', 'events.two'] }])
    expect(values[KEY]).toBeDefined()
    expect(values[LEGACY]).toBe(JSON.stringify(data))
    migrated.preferCandidate('events.created', 'schema', 'B')
    expect(types(create())).toEqual(['B', 'A'])
  })

  test('clearing saves a tombstone so legacy candidates do not reappear', () => {
    values[LEGACY] = JSON.stringify(legacy)
    const migrated = create()
    migrated.clear()
    expect(create().lookup('events.created')).toBeNull()
    expect(JSON.parse(values[KEY])).toEqual({ version: 2, root: {} })
  })

  test.each(['bad json', JSON.stringify({ version: 999, root: {} })])('recovers from invalid data: %s', data => {
    values[KEY] = data
    expect(create().lookup('events.created')).toBeNull()
    expect(JSON.parse(values[KEY]).version).toBe(2)
  })

  test('a storage error keeps candidates in memory without recursive retries', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    storage.setItem.mockImplementationOnce(() => { throw new Error('QuotaExceededError') })
    cache.learnCandidate('events.created', 'schema', 'A')
    expect(types(cache)).toEqual(['A'])
    expect(storage.setItem).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })

  test('another tab can learn, promote and clear; legacy events are ignored', () => {
    const previous = (globalThis as any).window
    const fakeWindow = new EventTarget()
    Object.defineProperty(globalThis, 'window', { value: fakeWindow, configurable: true })
    const reader = create()
    const writer = create()
    const changed = vi.fn()
    reader.subscribe(changed)
    const dispatch = (key: string | null) => {
      const event = new Event('storage')
      Object.defineProperties(event, { key: { value: key }, storageArea: { value: storage } })
      fakeWindow.dispatchEvent(event)
    }
    try {
      writer.learnCandidate('events.created', 'schema', 'A')
      dispatch(KEY)
      expect(types(reader)).toEqual(['A'])
      writer.preferCandidate('events.created', 'schema', 'B')
      dispatch(KEY)
      expect(types(reader)).toEqual(['B', 'A'])
      dispatch(LEGACY)
      expect(changed).toHaveBeenCalledTimes(2)
      writer.clear()
      dispatch(KEY)
      expect(reader.lookup('events.created')).toBeNull()
      values = {}
      dispatch(null)
      expect(reader.lookup('events.created')).toBeNull()
    } finally {
      reader.dispose()
      writer.dispose()
      Object.defineProperty(globalThis, 'window', { value: previous, configurable: true })
    }
  })
})
