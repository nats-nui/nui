/**
 * Tests for CddlTopicCache implementation
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { CddlTopicCache } from './CddlTopicCache'

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

describe('CddlTopicCache', () => {
  let cache: CddlTopicCache

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    cache = new CddlTopicCache()
  })

  describe('Basic Cache Operations', () => {
    test('should store and retrieve the schema and rule of a topic', () => {
      cache.onSuccessfulDecode('orders.eu.created', 'orders.cddl', 'order')

      expect(cache.lookup('orders.eu.created')).toEqual({
        schema: 'orders.cddl',
        messageType: 'order',
        confidence: 1.0
      })
    })

    test('should return null for unknown topics', () => {
      expect(cache.lookup('unknown.topic')).toBeNull()
    })

    test('should lose confidence in a mapping that stops matching', () => {
      cache.onSuccessfulDecode('orders.eu.created', 'orders.cddl', 'order')
      cache.onDecodeFailed('orders.eu.created')

      expect(cache.lookup('orders.eu.created')?.confidence).toBeLessThan(1.0)
    })

    test('should forget everything on clear', () => {
      cache.onSuccessfulDecode('orders.eu.created', 'orders.cddl', 'order')

      cache.clear()

      expect(cache.lookup('orders.eu.created')).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('nats-cddl-patterns')
    })
  })

  describe('Persistence', () => {
    test('should save under its own key, leaving the protobuf cache alone', () => {
      cache.onSuccessfulDecode('orders.eu.created', 'orders.cddl', 'order')

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'nats-cddl-patterns',
        expect.any(String)
      )
    })

    test('should reload what a previous session learned', () => {
      cache.onSuccessfulDecode('orders.eu.created', 'orders.cddl', 'order')

      const reloaded = new CddlTopicCache()

      expect(reloaded.lookup('orders.eu.created')).toMatchObject({
        schema: 'orders.cddl',
        messageType: 'order'
      })
      reloaded.dispose()
    })

    test('should start empty when the stored data cannot be read', () => {
      localStorageMock.getItem.mockReturnValueOnce('{ not json')

      const broken = new CddlTopicCache()

      expect(broken.lookup('orders.eu.created')).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('nats-cddl-patterns')
      broken.dispose()
    })
  })
})
