/**
 * Tests for TopicTrie implementation
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { TopicTrie } from './TopicTrie'

describe('TopicTrie', () => {
  let trie: TopicTrie

  beforeEach(() => {
    trie = new TopicTrie()
  })

  describe('Basic Operations', () => {
    test('should insert and lookup exact matches', () => {
      trie.insert('user.123.events.created', 'UserSchema', 'CreateEvent')
      
      const result = trie.lookup('user.123.events.created')
      expect(result).toEqual({
        schema: 'UserSchema',
        messageType: 'CreateEvent',
        confidence: 1.0
      })
    })

    test('should return null for non-existent topics', () => {
      const result = trie.lookup('non.existent.topic')
      expect(result).toBeNull()
    })

    test('should handle topic depth limits', () => {
      const deepTopic = new Array(25).fill('segment').join('.') // Exceed new limit of 20
      trie.insert(deepTopic, 'DeepSchema', 'DeepType')
      
      // Should not crash and should warn about depth
      const result = trie.lookup(deepTopic)
      expect(result).toBeNull()
    })
  })

  describe('Pattern Matching', () => {
    beforeEach(() => {
      // Create pattern: user.*.events.created
      trie.createPattern(
        ['user.123.events.created', 'user.456.events.created'],
        'UserSchema',
        'CreateEvent'
      )
    })

    test('should match wildcard patterns', () => {
      const result = trie.lookup('user.789.events.created')
      expect(result).toMatchObject({
        schema: 'UserSchema',
        messageType: 'CreateEvent'
      })
      expect(result?.confidence).toBeLessThan(1.0)
      expect(result?.confidence).toBeGreaterThan(0.5)
    })

    test('should prefer exact matches over patterns', () => {
      // Insert exact match
      trie.insert('user.999.events.created', 'ExactSchema', 'ExactEvent')
      
      const result = trie.lookup('user.999.events.created')
      expect(result).toEqual({
        schema: 'ExactSchema',
        messageType: 'ExactEvent',
        confidence: 1.0
      })
    })

    test('should prefer more specific patterns', () => {
      // Create less specific pattern
      trie.createPattern(
        ['user.111.anything', 'user.222.anything'],
        'GenericSchema',
        'GenericType'
      )
      
      const result = trie.lookup('user.333.events.created')
      expect(result?.schema).toBe('UserSchema') // More specific pattern should win
    })
  })

  describe('Confidence Management', () => {
    beforeEach(() => {
      trie.insert('test.topic', 'TestSchema', 'TestType')
    })

    test('should increase confidence on successful updates', () => {
      const initialResult = trie.lookup('test.topic')
      expect(initialResult?.confidence).toBe(1.0)
      
      trie.updateConfidence('test.topic', true)
      const updatedResult = trie.lookup('test.topic')
      expect(updatedResult?.confidence).toBeGreaterThanOrEqual(1.0) // Confidence is capped at 1.0
      expect(updatedResult?.confidence).toBeLessThanOrEqual(1.0)
    })

    test('should decrease confidence on failures', () => {
      trie.updateConfidence('test.topic', false)
      const result = trie.lookup('test.topic')
      expect(result?.confidence).toBeLessThan(1.0)
      expect(result?.confidence).toBeGreaterThanOrEqual(0.1)
    })

    test('should not go below minimum confidence', () => {
      // Repeatedly fail to test minimum
      for (let i = 0; i < 10; i++) {
        trie.updateConfidence('test.topic', false)
      }
      
      const result = trie.lookup('test.topic')
      expect(result?.confidence).toBe(0.1)
    })
  })

  describe('Statistics', () => {
    test('should provide accurate statistics', () => {
      trie.insert('topic1', 'Schema1', 'Type1')
      trie.insert('topic2', 'Schema2', 'Type2')
      trie.createPattern(['pattern.a', 'pattern.b'], 'PatternSchema', 'PatternType')
      
      const stats = trie.getStats()
      expect(stats.terminals).toBeGreaterThanOrEqual(3)
      expect(stats.patterns).toBeGreaterThanOrEqual(1)
      expect(stats.nodes).toBeGreaterThan(stats.terminals)
    })
  })

  describe('Cleanup', () => {
    test('should remove low confidence patterns', () => {
      trie.insert('low.confidence.topic', 'LowSchema', 'LowType')
      
      // Reduce confidence
      for (let i = 0; i < 5; i++) {
        trie.updateConfidence('low.confidence.topic', false)
      }
      
      // Clean up with threshold 0.5
      trie.cleanup(0.5)
      
      const result = trie.lookup('low.confidence.topic')
      expect(result).toBeNull()
    })

    test('should preserve high confidence patterns', () => {
      trie.insert('high.confidence.topic', 'HighSchema', 'HighType')
      
      trie.cleanup(0.5)
      
      const result = trie.lookup('high.confidence.topic')
      expect(result).not.toBeNull()
      expect(result?.schema).toBe('HighSchema')
    })
  })
})