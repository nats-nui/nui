/**
 * Tests for ProtobufTopicCache implementation
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { ProtobufTopicCache } from './ProtobufTopicCache'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock
})

describe('ProtobufTopicCache', () => {
  let cache: ProtobufTopicCache

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    cache = new ProtobufTopicCache()
  })

  describe('Basic Cache Operations', () => {
    test('should store and retrieve successful decodes', () => {
      cache.onSuccessfulDecode('user.123.events.created', 'UserSchema', 'CreateEvent')
      
      const result = cache.lookup('user.123.events.created')
      expect(result).toEqual({
        schema: 'UserSchema',
        messageType: 'CreateEvent',
        confidence: 1.0
      })
    })

    test('should return null for unknown topics', () => {
      const result = cache.lookup('unknown.topic')
      expect(result).toBeNull()
    })

    test('should handle failed decodes', () => {
      cache.onSuccessfulDecode('test.topic', 'TestSchema', 'TestType')
      cache.onDecodeFailed('test.topic')
      
      const result = cache.lookup('test.topic')
      expect(result?.confidence).toBeLessThan(1.0)
    })
  })

  describe('Persistence', () => {
    test('should save to localStorage on successful decode', () => {
      cache.onSuccessfulDecode('persist.test', 'PersistSchema', 'PersistType')
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'nats-protobuf-patterns',
        expect.any(String)
      )
    })

    test('should load from localStorage on initialization', () => {
      // Pre-populate localStorage
      const mockData = JSON.stringify({
        version: 1,
        root: {
          c: {
            'loaded': {
              c: {
                'topic': {
                  m: {
                    s: 'LoadedSchema',
                    t: 'LoadedType',
                    c: 0.9
                  }
                }
              }
            }
          }
        }
      })
      localStorageMock.setItem('nats-protobuf-patterns', mockData)
      
      // Create new cache instance
      const newCache = new ProtobufTopicCache()
      const result = newCache.lookup('loaded.topic')
      
      expect(result).toMatchObject({
        schema: 'LoadedSchema',
        messageType: 'LoadedType',
        confidence: 0.9
      })
    })

    test('should handle corrupt localStorage data gracefully', () => {
      localStorageMock.setItem('nats-protobuf-patterns', 'invalid json')
      
      // Should not throw and should remove corrupt data
      const newCache = new ProtobufTopicCache()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('nats-protobuf-patterns')
    })

    test('should handle version mismatches', () => {
      const oldVersionData = JSON.stringify({
        version: 999,
        root: {}
      })
      localStorageMock.setItem('nats-protobuf-patterns', oldVersionData)
      
      const newCache = new ProtobufTopicCache()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('nats-protobuf-patterns')
    })
  })

  describe('Conflict Handling', () => {
    test('should handle schema conflicts', () => {
      // Initial mapping
      cache.onSuccessfulDecode('conflict.topic', 'OriginalSchema', 'OriginalType')
      
      // Verify initial state
      let result = cache.lookup('conflict.topic')
      expect(result?.schema).toBe('OriginalSchema')
      expect(result?.messageType).toBe('OriginalType')
      expect(result?.confidence).toBe(1.0)
      
      // Conflict with different schema
      cache.handleConflict('conflict.topic', 'NewSchema', 'NewType')
      
      // Should now return the new schema with exact match priority
      result = cache.lookup('conflict.topic')
      expect(result?.schema).toBe('NewSchema')
      expect(result?.messageType).toBe('NewType')
      expect(result?.confidence).toBe(1.0) // New exact mapping should have full confidence
    })
  })

  describe('Cache Statistics', () => {
    test('should provide cache statistics', () => {
      cache.onSuccessfulDecode('stats.topic1', 'Schema1', 'Type1')
      cache.onSuccessfulDecode('stats.topic2', 'Schema2', 'Type2')
      
      const stats = cache.getStats()
      expect(stats.terminals).toBeGreaterThanOrEqual(2)
      expect(stats.nodes).toBeGreaterThan(0)
    })
  })

  describe('Cache Clearing', () => {
    test('should clear all cached data', () => {
      cache.onSuccessfulDecode('clear.test', 'ClearSchema', 'ClearType')
      
      cache.clear()
      
      const result = cache.lookup('clear.test')
      expect(result).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('nats-protobuf-patterns')
    })
  })

  describe('Serialization', () => {
    test('should use compact JSON format', () => {
      cache.onSuccessfulDecode('compact.test', 'CompactSchema', 'CompactType')
      
      const setItemCall = localStorageMock.setItem.mock.calls[0]
      const serializedData = setItemCall[1]
      const parsed = JSON.parse(serializedData)
      
      // Should use short keys
      expect(parsed.root.c).toBeDefined() // children
      expect(parsed.root.c.compact.c.test.m).toBeDefined() // mapping
      expect(parsed.root.c.compact.c.test.m.s).toBe('CompactSchema') // schema
      expect(parsed.root.c.compact.c.test.m.t).toBe('CompactType') // messageType
      expect(parsed.root.c.compact.c.test.m.c).toBe(1.0) // confidence
    })

    test('should handle storage overflow gracefully', () => {
      // Mock QuotaExceededError
      localStorageMock.setItem.mockImplementationOnce(() => {
        const error = new Error('Storage quota exceeded')
        error.name = 'QuotaExceededError'
        throw error
      })

      // Should not crash
      expect(() => {
        cache.onSuccessfulDecode('overflow.test', 'OverflowSchema', 'OverflowType')
      }).not.toThrow()
    })
  })
})